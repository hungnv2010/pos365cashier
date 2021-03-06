import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore'
import { useSelector, useDispatch } from 'react-redux';
import { currencyToString, dateUTCToMoment, getTimeFromNow, text_highlight, change_alias } from '../../../common/Utils'
import { Constant } from '../../../common/Constant';
import { Images, Metrics } from '../../../theme';
import colors from '../../../theme/Colors';
import TextTicker from 'react-native-text-ticker';
import moment from 'moment';
import Menu from 'react-native-material-menu';
import useDebounce from '../../../customHook/useDebounce';
import { useFocusEffect } from '@react-navigation/native';
import signalRManager from '../../../common/SignalR';
import dataManager from '../../../data/DataManager';
import dialogManager from '../../../components/dialog/DialogManager';

const _nodes = new Map();

export default (props) => {

    const [indexRoom, setIndexRoom] = useState(0)
    const [loadDone, setLoadDone] = useState(false)
    const [textSearch, setTextSearch] = useState(() => props.textSearch)
    const debouncedVal = useDebounce(textSearch)
    const idInterval = useRef(null)
    const { already } = useSelector(state => {
        return state.Common
    });

    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    const numberColumn = useSelector(state => {
        let numberColumn = (state.Common.orientaition == Constant.LANDSCAPE) ? 8 : 4
        if (state.Common.deviceType == Constant.TABLET) numberColumn++
        return numberColumn
    });

    let rooms = null
    let roomGroups = null
    let serverEvents = null
    let isSendServer = null
    let updateTime = null
    const [datas, setData] = useState([])
    const [valueAll, setValueAll] = useState({})
    const widthRoom = Dimensions.get('screen').width / numberColumn;
    const RoomAll = { Name: I18n.t('tat_ca'), Id: -1, isGroup: true }
    const [listRoom, setListRoom] = useState([])
    const dataRef = useRef([])
    const roomRef = useRef([])
    const [filterStatus, setFilterStatus] = useState('tat_ca')
    const [status, setStatus] = useState()
    const [idFilter, setIdFilter] = useState(-1)
    // const [perOrder, setPerOrder] = useState({
    //     read: true,
    //     create: true,
    //     update: true,
    //     delete: true,
    //     import: true,
    //     export: true
    // })



    useFocusEffect(
        React.useCallback(() => {
            updateTime = setInterval(() => {
                reloadTime()
            }, 1000 * 60);
            return () => {
                clearInterval(updateTime)
            }
        }, [])
    );
    // useEffect(() => {
    //     console.log('props room table', props.itemPer);
    //     if (props.itemPer) {
    //         let item = props.itemPer.items
    //         let allPer = {}
    //         item.forEach(element => {
    //             if (element.id == "Order_Read") allPer.read = element.Checked
    //             if (element.id == "Order_Create") allPer.create = element.Checked
    //             if (element.id == "Order_Update") allPer.update = element.Checked
    //             if (element.id == "Order_Delete") allPer.delete = element.Checked
    //             if (element.id == "Order_Import") allPer.import = element.Checked
    //             if (element.id == "Order_Export") allPer.export = element.Checked
    //         });
    //         setPerOrder(allPer)
    //     }

    // }, [props.itemPer])
    // useEffect(() => {
    //     console.log("per", perOrder);
    // }, [perOrder])


    useEffect(() => {
        console.log('alreadyalreadyalready', already);
        if (!already) return
        const init = async () => {
            rooms = await realmStore.queryRooms()
            rooms = rooms.sorted('Position')
            roomGroups = await realmStore.queryRoomGroups()
            roomGroups = roomGroups.sorted('Id')
            //roomGroups.push(RoomAll)
            serverEvents = await realmStore.queryServerEvents()
            isSendServer = serverEvents.filtered(`isSend == true`)
            // console.log('isSendServer==', isSendServer);

            let newDatas = insertServerEvent(getDatas(rooms, roomGroups), serverEvents)
            dataRef.current = newDatas
            setData(newDatas)
            let list = newDatas.filter(item => item.isGroup)
            list.unshift(RoomAll)
            setListRoom(list)

            serverEvents.addListener((collection, changes) => {
                if (changes.insertions.length || changes.modifications.length) {
                    let newDatas = insertServerEvent(getDatas(rooms, roomGroups), serverEvents)
                    dataRef.current = newDatas
                    setData(newDatas)
                    setFilterStatus('tat_ca')
                    setStatus()
                    setIndexRoom(0)
                }
            })

            // isSendServer.addListener((collection, changes) => {
            //     if (changes.insertions.length || changes.modifications.length) {
            //         console.log('isSendServer.addListener', JSON.parse(JSON.stringify(isSendServer[0])));
            //         let serverEvent = JSON.parse(JSON.stringify(isSendServer[0]))
            //         signalRManager.sendMessageServerEventNow(serverEvent)
            //         realmStore.insertServerEvent({ ...serverEvent, isSend: false })
            //     }
            // })

            setTextSearch(props.textSearch)

            setLoadDone(true)
        }
        const getServerEventIsSend = async () => {
            let serverEvents = await realmStore.queryServerEvents()
            let isSendServer = serverEvents.filtered(`isSend == TRUE`)
            if (isSendServer.length == 0) return
            let serverEvent = JSON.parse(JSON.stringify(isSendServer[0]))
            signalRManager.sendMessageServerEventNow(JSON.parse(JSON.stringify(serverEvent)), () => {
                serverEvent.isSend = false
                realmStore.insertServerEvent(serverEvent)
            })
            console.log('isSendServer.length', isSendServer.length);

        }
        init()

        idInterval.current = setInterval(() => {
            getServerEventIsSend()
        }, 3000);

        return () => {
            setLoadDone(false)
            if (serverEvents) serverEvents.removeAllListeners()
            if (idInterval.current) clearInterval(idInterval.current)
        }

    }, [already])

    const reloadTime = async () => {
        setData([...dataRef.current])
    }

    const getDatas = (rooms, roomGroups) => {
        let newDatas = []
        //newDatas.push(RoomAll)
        if (rooms && rooms.length > 1) rooms.sorted('Position')
        if (roomGroups) {
            roomGroups.forEach(roomGroup => {
                let roomsInside = rooms.filtered(`RoomGroupId == ${roomGroup.Id}`)
                let lengthRoomsInside = roomsInside.length
                if (roomsInside && lengthRoomsInside > 0) {
                    roomGroup.isGroup = true
                    roomGroup.sum = lengthRoomsInside
                    newDatas.push(roomGroup)
                    newDatas = newDatas.concat(roomsInside.slice())
                }
            })

            let otherGroup = { Id: 0, Name: newDatas.length > 0 ? I18n.t('khac') : null, isGroup: true }
            let roomsInside = rooms.filtered(`RoomGroupId == ${otherGroup.Id}`)
            let lengthRoomsInside = roomsInside.length
            if (roomsInside && lengthRoomsInside > 0) {
                otherGroup.sum = lengthRoomsInside
                newDatas.push(otherGroup)
                newDatas = newDatas.concat(roomsInside.slice())
            }
        }
        else
            newDatas = rooms

        return newDatas
    }

    const insertServerEvent = (newDatas, serverEvents) => {
        let totalCash = 0
        let totalUse = 0
        newDatas.forEach(data => {
            if (data.Id != undefined) {
                let listFiters = serverEvents.filtered(`RoomId == ${data.Id}`)
                if (listFiters && listFiters.length > 0) {
                    let Total = 0
                    let RoomMoment = ""
                    let IsActive = false
                    listFiters.forEach(elm => {
                        let JsonContentJS = {}
                        try {
                            JsonContentJS = elm.JsonContent ? JSON.parse(elm.JsonContent) : {}
                        } catch (error) {
                            console.log('JsonContentJS error elm ', elm);
                            console.log('JsonContentJS error', error);
                        }
                        // let JsonContentJS = elm.JsonContent ? JSON.parse(elm.JsonContent) : {}
                        let totalPoision = JsonContentJS.Total ? JsonContentJS.Total : 0
                        Total += totalPoision
                        if (JsonContentJS.ActiveDate) {
                            let ActiveMoment = moment(JsonContentJS.ActiveDate)
                            if (!RoomMoment) RoomMoment = ActiveMoment
                            else if (ActiveMoment.isBefore(RoomMoment) && totalPoision > 0) RoomMoment = ActiveMoment
                        }
                        if (JsonContentJS.OrderDetails && JsonContentJS.OrderDetails.length) IsActive = true
                    })
                    data.Total = Total
                    totalCash += Total
                    data.RoomMoment = RoomMoment
                    data.IsActive = IsActive
                    if (IsActive) totalUse++
                }
            }
        })

        setValueAll({ cash: totalCash, use: totalUse, room: rooms.length })

        return newDatas
    }
    let refScroll = null;

    const scrollToInitialPosition = () => {
        refScroll.scrollTo({ y: 500 })
    }
    const onItemPress = (item) => {
        const { Id, Name, ProductId, IsActive } = item
        if (allPer.IsAdmin || allPer.Order_Create) {
            deviceType == Constant.TABLET ?
            props.navigation.navigate('ServedForTablet', { room: { Id: Id, Name: Name, ProductId: ProductId, IsActive: IsActive  } })
            :
            props.navigation.navigate('PageServed', { room: { Id: Id, Name: Name, ProductId: ProductId, IsActive: IsActive } })
        } else {
            dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
        
    }
    //filter---------------------------------------------------------------
    const filterRoom = (value) => {
        setStatus(value)
        filterByCategory(idFilter)
        hideMenu()

    }
    useEffect(() => {
        console.log("textsearch", props.textSearch);
        setValueCategory()
    }, [datas])

    const searchRoom = () => {
        if (debouncedVal) {
            let room = dataRef.current.filter(item => item.RoomGroupId != null)
            let roomGroup = dataRef.current.filter(item => item.isGroup == true)
            let newDatas = []
            if (roomGroup) {
                roomGroup.forEach(roomGroup => {
                    // let roomsInside = room.filter(item => item.RoomGroupId == roomGroup.Id && (item.Name).toLowerCase().indexOf(debouncedVal.toLowerCase()) != -1)
                    let roomsInside = room.filter(item => item.RoomGroupId == roomGroup.Id && change_alias(item.Name).toLowerCase().indexOf(change_alias(debouncedVal).toLowerCase()) != -1)
                    let lengthRoomsInside = roomsInside.length
                    if (roomsInside && lengthRoomsInside > 0) {
                        roomGroup.isGroup = true
                        roomGroup.sum = lengthRoomsInside
                        newDatas.push(roomGroup)
                        newDatas = newDatas.concat(roomsInside.slice())
                    }
                })
            }
            setData(newDatas)
        } else {
            setData([...dataRef.current])

        }
        setFilterStatus('tat_ca')
    }
    useEffect(() => {
        setTextSearch(props.textSearch)
    }, [props.textSearch])
    useEffect(() => {
        searchRoom()
    }, [debouncedVal])
    const filterByCategory = () => {
        if (status == null) {
            if (idFilter == -1) {
                setData(dataRef.current)

            } else {
                let room = dataRef.current.filter(item => item.RoomGroupId == idFilter)
                setData(room)
            }
        } else {
            if (idFilter == -1) {
                if (status == true) {
                    let room = dataRef.current.filter(item => item.IsActive && item.IsActive == true)
                    let roomGroup = dataRef.current.filter(item => item.isGroup == true)
                    console.log("Room", room);
                    console.log("group", roomGroup);
                    let newDatas = []
                    if (roomGroup) {
                        roomGroup.forEach(roomGroup => {
                            let roomsInside = room.filter(item => item.RoomGroupId == roomGroup.Id && (item.Name).toLowerCase().indexOf(debouncedVal.toLowerCase()) != -1)
                            let lengthRoomsInside = roomsInside.length
                            if (roomsInside && lengthRoomsInside > 0) {
                                roomGroup.isGroup = true
                                roomGroup.sum = lengthRoomsInside
                                newDatas.push(roomGroup)
                                newDatas = newDatas.concat(roomsInside.slice())
                            }
                        })
                    }
                    setData(newDatas)

                } else if (status == false) {
                    let room = dataRef.current.filter(item => item.IsActive != true)
                    let roomGroup = dataRef.current.filter(item => item.isGroup == true)
                    console.log("Room", room);
                    console.log("group", roomGroup);
                    let newDatas = []
                    if (roomGroup) {
                        roomGroup.forEach(roomGroup => {
                            let roomsInside = room.filter(item => item.RoomGroupId == roomGroup.Id && (item.Name).toLowerCase().indexOf(debouncedVal.toLowerCase()) != -1)
                            let lengthRoomsInside = roomsInside.length
                            if (roomsInside && lengthRoomsInside > 0) {
                                roomGroup.isGroup = true
                                roomGroup.sum = lengthRoomsInside
                                newDatas.push(roomGroup)
                                newDatas = newDatas.concat(roomsInside.slice())
                            }
                        })
                    }
                    setData(newDatas)

                }
                else {
                    setData([...dataRef.current])
                }
            } else {
                let room = dataRef.current.filter(item => item.RoomGroupId == idFilter && item.IsActive == status)
                setData(room)

            }
        }

    }
    useEffect(() => {
        filterByCategory()
    }, [idFilter, status])
    const setValueCategory = (list) => {
        let total = 0
        let listRoom = []
        let data = []
        let sumTable = 0
        let uses = 0
        if (idFilter != -1) {
            listRoom = dataRef.current.filter(item => item.RoomGroupId == idFilter)
            sumTable = listRoom.length
            data = dataRef.current.filter(item => item.IsActive == true && item.RoomGroupId == idFilter)
            uses = data.length
        } else {
            listRoom = dataRef.current.filter(item => item.isGroup == true)
            sumTable = dataRef.current.length - listRoom.length
            data = dataRef.current.filter(item => item.IsActive == true && item.RoomGroupId != idFilter && item.Id != 0)
            uses = data.length;
        }
        if (data && data.length > 0) {
            data.forEach(item => {
                let itemTotal = item.Total
                total += itemTotal
            })
        } else {
            total = 0
        }
        setValueAll({ ...valueAll, cash: total, use: uses, room: sumTable })

    }
    //
    const renderRoom = (item, widthRoom) => {
        widthRoom = parseInt(widthRoom)
        return item.isEmpty ?
            (<View style={{ width: widthRoom - 5 }}></View>)
            :
            (<TouchableOpacity onPress={() => { onItemPress(item) }} key={item.Id}
                style={[styles.room, { width: widthRoom - 5, height: widthRoom, backgroundColor: item.IsActive ? colors.colorLightBlue : 'white', }]}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                    <View style={{ alignItems: "center", padding: 0, flex: 1 }}>
                        <View style={{ justifyContent: "center", alignItems: "center", flex: 1, height: "90%" }}>
                            <TextTicker
                                style={{
                                    fontSize: 13, textAlign: "center", textAlignVertical: "center", textTransform: "uppercase", padding: 4, marginTop: 0, color: item.IsActive ? 'white' : 'black'
                                }}
                                duration={6000}
                                bounce={false}
                                marqueeDelay={1000}
                            >
                                {item.Name}
                            </TextTicker>
                        </View>
                    </View>
                    <View style={{ height: 0.5, width: "90%", backgroundColor: "#ddd", justifyContent: "center", alignItems: "center" }}></View>
                    <View style={{ justifyContent: "center", paddingHorizontal: 10, alignItems: "center", flex: 2 }}>
                        {item.IsActive ?
                            // <View>
                            <View style={{ flexDirection: "row", }}>
                                <Image source={Images.image_clock} style={{ width: 10, height: 10, marginRight: 2, alignSelf: "center" }}></Image>
                                {/* <Text style={{ color: "#fff", fontSize: 8 }}>{item.RoomMoment._i}</Text> */}
                                <TextTicker
                                    style={{ fontSize: 10, textAlign: "center", color: item.IsActive ? 'white' : 'black', fontSize: 8 }}
                                    duration={6000}
                                    bounce={false}
                                    marqueeDelay={1000}>
                                    {item.RoomMoment && item.IsActive ? getTimeFromNow(item.RoomMoment) : ""}
                                </TextTicker>
                            </View>
                            //      <TextTicker
                            //         style={{ fontSize: 10, textAlign: "center", color: item.IsActive ? 'white' : 'black', fontSize: 8 }}
                            //         duration={6000}
                            //         bounce={false}
                            //         marqueeDelay={1000}>
                            //         {item.RoomMoment && item.IsActive ? getTimeFromNow(item.RoomMoment._i) : ""}
                            //     </TextTicker> 
                            //     <Text style={{ color: "#fff", fontSize: 8 }}>{item.RoomMoment && item.IsActive ? moment(item.RoomMoment._i).fromNow() : ""}</Text> 
                            // </View> 
                            : null}
                        <Text style={{ paddingTop: item.IsActive ? 10 : 0, color: item.IsActive ? "#fff" : "#000", textAlign: "center", fontSize: 10 }}>{item.IsActive ? currencyToString(item.Total) : I18n.t("san_sang")}</Text>
                    </View>
                    {/* {
                        listOrder.includes(item.Id) ?
                            <Icon style={{ position: "absolute", right: 3, top: 3 }} name="pencil" size={20} color="black" />
                            :
                            null
                    } */}
                </View>
            </TouchableOpacity>
            );
    }

    const renderRoomGroup = (item) => {
        return (
            <View key={item.Id} style={styles.roomGroup}>
                <Text style={{ padding: 0, fontSize: 16, textTransform: "uppercase", color: colors.colorLightBlue, paddingLeft: 3 }}>{item.Name}</Text>
            </View>
        )
    }
    //menu filter
    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = () => {
        _menu.hide();
    };

    const showMenu = () => {
        _menu.show();
    };
    //

    return loadDone ? (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', borderWidth: 5, borderColor: '#f2f2f2', backgroundColor: 'white', borderRadius: 16, paddingVertical: 5, flexWrap: true }}>
                <View style={{ flexDirection: "row", width: deviceType == Constant.PHONE ? "100%" : "33%", justifyContent: "flex-start", alignItems: 'center', paddingLeft: 13, paddingBottom: 5 }}>
                    <Image source={Images.icon_transfer_money} style={{ width: 32, height: 32, paddingStart: 13 }}></Image>
                    <View style={{ flexDirection: 'row', paddingLeft: 8, }}>
                        <Text style={{ paddingRight: 5, color: '#c3c3c3', fontSize: 14 }}>{I18n.t('tam_tinh')}: </Text>
                        <Text style={{ fontWeight: 'bold', color: colors.colorchinh, fontSize: 16 }}>{currencyToString(valueAll.cash)}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: "row", width: deviceType == Constant.PHONE ? "50%" : "33%", justifyContent: deviceType == Constant.PHONE ? "flex-start" : 'center', alignItems: 'center', paddingBottom: 5, paddingLeft: 13 }}>
                    <Image source={Images.icon_using} style={{ width: 32, height: 32, paddingLeft: 13 }}></Image>
                    <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
                        <Text style={{ color: "#c3c3c3", fontSize: 14 }}>{I18n.t('dang_dung')}: </Text>
                        <View style={{ justifyContent: "center", borderRadius: 5, }}>
                            <Text style={{ color: "#36a3f7", fontSize: 12, paddingHorizontal: 2, fontWeight: 'bold', fontSize: 16 }}>{valueAll.use}/{valueAll.room}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", width: deviceType == Constant.PHONE ? "50%" : "34%", alignItems: "center", justifyContent: "flex-end", paddingRight: 13 }}>
                    <Menu style={{ alignItems: 'center', borderRadius: 16, justifyContent: 'center', width: 150 }}
                        ref={setMenuRef}
                        button={<View style={{}} >
                            <TouchableOpacity style={{ flexDirection: 'row', backgroundColor: colors.colorLightBlue, padding: 5, borderRadius: 16, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 20 }} onPress={showMenu}>
                                <Text style={{ fontSize: 14, color: 'white', paddingRight: 5, fontWeight: 'bold' }} >{I18n.t(filterStatus)}</Text>
                                <Image style={{ width: 10, height: 6, paddingLeft: 5, alignItems: 'center' }} source={Images.icon_arrow_down_white} />
                            </TouchableOpacity>
                        </View>}
                    >
                        <View style={{ backgroundColor: '#f2f2f2', borderRadius: 16, elevation: 5, borderWidth: 0.5, borderColor: 'gray' }}>
                            <TouchableOpacity onPress={() => { filterRoom(null), setFilterStatus('tat_ca') }} style={{ backgroundColor: filterStatus == 'tat_ca' ? colors.colorLightBlue : null, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                                <Text style={[styles.titleMenu, { color: filterStatus == 'tat_ca' ? 'white' : null, fontWeight: filterStatus == 'tat_ca' ? 'bold' : null, }]} >{I18n.t('tat_ca')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { filterRoom(true), setFilterStatus('dang_dung') }} style={{ backgroundColor: filterStatus == 'dang_dung' ? colors.colorLightBlue : null }}>
                                <Text style={[styles.titleMenu, { color: filterStatus == 'dang_dung' ? 'white' : null, fontWeight: filterStatus == 'dang_dung' ? 'bold' : null }]}>{I18n.t('dang_dung')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { filterRoom(false), setFilterStatus('dang_trong') }} style={{ backgroundColor: filterStatus == 'dang_trong' ? colors.colorLightBlue : null, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                                <Text style={[styles.titleMenu, { color: filterStatus == 'dang_trong' ? 'white' : null, fontWeight: filterStatus == 'dang_trong' ? 'bold' : null }]}>{I18n.t('dang_trong')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </View>

            </View>
            <View style={{ height: 40, backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 5 }}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ backgroundColor: '#f2f2f2', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}>
                    {listRoom ?
                        listRoom.map((data, index) =>
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setIndexRoom(index)
                                    // console.log("_nodes.size ", _nodes.size);
                                    // const node = _nodes.get(data.Id);
                                    // console.log("node ", node);
                                    // refScroll.scrollTo({ y: node })
                                    setIdFilter(data.Id)
                                }} style={{ height: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: 15, paddingVertical: 5, backgroundColor: indexRoom == index ? colors.colorLightBlue : null, paddingVertical: 5, borderRadius: 16 }}>
                                <Text style={{ color: indexRoom == index ? "#fff" : "#000", textTransform: 'uppercase', fontWeight: indexRoom == index ? 'bold' : null }}>{data.Name}</Text>
                            </TouchableOpacity>
                        )
                        : null}
                </ScrollView>
            </View>
            <View style={{ flex: 1, padding: 2 }}>
                <ScrollView scrollToOverflowEnabled={true} showsVerticalScrollIndicator={false} ref={(ref) => refScroll = ref} style={{ flex: 1 }}>
                    <View style={styles.containerRoom}>
                        {datas ?
                            datas.map((data, idx) =>
                                <View
                                    key={idx}
                                    onLayout={(e) => {
                                        let footerY = e.nativeEvent.layout.y;
                                        if (data.isGroup) {
                                            console.log("footerY ", footerY);
                                            _nodes.set(data.Id, footerY)
                                        }
                                    }}
                                    style={{ flexDirection: "row" }}>
                                    {data.isGroup ? renderRoomGroup(data) : renderRoom(data, widthRoom)}
                                </View>
                            ) : null
                        }
                    </View>
                </ScrollView>
            </View>
        </View>
    )
        :
        (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" style={{}} color={colors.colorchinh} />
            </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 16,
    },
    containerRoom: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap', alignContent: 'flex-start',
        justifyContent: 'flex-start'
    },
    room: {
        justifyContent: "center",
        margin: 2,
        borderRadius: 4
    },
    roomGroup: {
        // backgroundColor: "white",
        marginVertical: 4,
        flexDirection: "row", alignItems: "center",
        width: "100%",
        borderBottomColor: "#ddd", borderBottomWidth: 0
    },
    header: {
        fontSize: 32,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24
    },
    titleMenu: {
        textAlign: 'center', paddingHorizontal: 20, paddingVertical: 10
    }
});