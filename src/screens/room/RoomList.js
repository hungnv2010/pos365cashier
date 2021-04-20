import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';
import dataManager from '../../data/DataManager';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import RoomDetail from './RoomDetail'

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [rooms, setRooms] = useState([])
    const [indexTab, setIndexTab] = useState(0)
    const [expand, setExpand] = useState(true)
    const [update, setUpdate] = useState(0)
    const [dataParams, setDataParams] = useState({})
    const isReLoad = useRef(false);
    const roomItem = useRef({});
    const clickAdd = useRef(false);
    const [roomGroups, setRoomGroups] = useState([])
    const [titleAddEdit, setTitleAddEdit] = useState(I18n.t('them_phong_ban'))

    const dispatch = useDispatch()

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });

    useEffect(() => {

        getDataInRealm();

    }, [])

    const getDataInRealm = async () => {

        roomsTmp = await realmStore.queryRooms()
        roomsTmp = roomsTmp.sorted('Position')
        roomGroupsTmp = await realmStore.queryRoomGroups()
        roomGroupsTmp = roomGroupsTmp.sorted('Id')
        setRoomGroups(roomGroupsTmp)

        console.log("getDataInRealm roomsTmp ", JSON.parse(JSON.stringify(roomsTmp)));
        var outputList = [];
        roomGroupsTmp.map(item => {
            console.log("getDataInRealm item ", item);
            let object = { Id: item.Id, Name: item.Name, list: [] }
            roomsTmp.map(child => {
                if (item.Id == child.RoomGroupId) {
                    object.list.push(JSON.parse(JSON.stringify(child)))
                }
            })
            outputList.push(object);
        })
        outputList.push({ Id: "", Name: I18n.t('khac'), list: roomsTmp.filter(item => item.RoomGroupId == 0) })
        console.log("getDataInRealm outputList test ", JSON.parse(JSON.stringify(outputList))[outputList.length - 1].list);
        setRooms([...outputList])
    }

    const onCallBack = async (data) => {
        console.log("onCallBack data ", data);
        dispatch({ type: 'ALREADY', already: false })
        if (data != "Add") {
            setRooms([])
            // dispatch({ type: 'ALREADY', already: false })
            await realmStore.deleteRoom()
        }
        await dataManager.syncRoomsReInsert()
        dispatch({ type: 'ALREADY', already: true })
        getDataInRealm();
        isReLoad.current = true;
    }

    useEffect(() => {
        setUpdate(1)
    }, [expand])

    const onClickItem = (el) => {
        roomItem.current = el;
        if (deviceType == Constant.PHONE)
            props.navigation.navigate(ScreenList.RoomDetail, { room: roomItem.current, listRoom: rooms, roomGroups: roomGroups, _onSelect: onCallBack })
        else {
            setTitleAddEdit(I18n.t('cap_nhat_phong_ban'))
            setDataParams({ ...{ room: roomItem.current, listRoom: rooms, roomGroups: roomGroups } })
        }
    }

    const onClickTab = (el, i) => {
        setIndexTab(i)
    }

    const _renderScrollViewContent = () => {
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                onMomentumScrollBegin={
                    () => setExpand(false)
                }
                onScroll={(event) => {
                    if (event.nativeEvent.contentOffset.y < 30) {
                        setExpand(true)
                    } else {
                        setExpand(false)
                    }
                }}
                style={{ flex: 1 }}
            >
                {
                    rooms.map((item, index) => {
                        if (indexTab == "" || indexTab == index + 1)
                            return (
                                <View style={{ flex: 1 }} key={index.toString()}>
                                    {
                                        item.list.length > 0 ?
                                            <View style={{}}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#eeeeee", }}>
                                                    <Text style={{ textTransform: "uppercase", fontWeight: "bold", padding: 15 }}>{item.Name}</Text>
                                                    <Text style={{ padding: 15 }}>{item.list.length} {/* {I18n.t('ban')} */}</Text>
                                                </View>

                                                {
                                                    item.list.map((el, indexEl) => {
                                                        return (
                                                            <TouchableOpacity key={indexEl.toString()} onPress={() => onClickItem(el)} style={{ backgroundColor: "#fff", padding: 15, flexDirection: "column" }}>
                                                                <Text style={{ color: colors.colorLightBlue }}>{el.Name}</Text>
                                                            </TouchableOpacity>
                                                        )
                                                    })
                                                }
                                            </View>
                                            : null
                                    }
                                </View>
                            )
                        else return null;
                    })
                }
            </ScrollView>
        );
    }

    return (
        <View style={styles.fill}>
            <ToolBarDefault
                clickLeftIcon={() => {
                    if (isReLoad.current == true) {
                        dispatch({ type: 'ALREADY', already: true })
                    }
                    props.navigation.goBack()
                }}
                navigation={props.navigation}
                title={I18n.t('danh_sach_phong_ban')}
            />

            <View style={{ flexDirection: "row", flex: 1 }}>
                <View
                    style={{ flex: 1 }}
                >
                    <View style={{ height: 45, backgroundColor: 'white', padding: 5 }}>
                        <View style={{ backgroundColor: '#f2f2f2', paddingHorizontal: 5, height: "100%", borderRadius: 18 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{}}>{
                                [{ Id: "", Name: I18n.t("tat_ca") }].concat(rooms).map((item, index) => {
                                    return (
                                        <TouchableOpacity key={index.toString()} onPress={() => onClickTab(item, index)} style={{
                                            alignSelf: "center",
                                            height: "80%", justifyContent: "center", alignItems: "center", paddingHorizontal: 15, paddingVertical: 5, backgroundColor: indexTab == index ? colors.colorLightBlue : null, paddingVertical: 5, borderRadius: 18
                                        }}>
                                            <Text style={{ color: indexTab == index ? "#fff" : "#000", textTransform: 'uppercase', fontWeight: indexTab == index ? 'bold' : null }}>{item.Name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                    {_renderScrollViewContent()}
                    <FAB
                        style={styles.fab}
                        big
                        icon="plus"
                        color="#fff"
                        onPress={() => {
                            clickAdd.current = true;
                            if (deviceType == Constant.PHONE)
                                props.navigation.navigate(ScreenList.RoomDetail, { _onSelect: onCallBack })
                            else {
                                setTitleAddEdit(I18n.t('them_phong_ban'))
                                setDataParams({})
                            }
                        }}
                    />
                </View>
                {deviceType == Constant.TABLET ?
                    <View style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: "#ccc" }}>
                        <View style={{height: 45,backgroundColor: '#fff', justifyContent: "center", alignItems: "center"}}>
                            <Text style={{color: colors.colorchinh , textTransform: "uppercase"}}>{titleAddEdit}</Text>
                        </View>
                        <RoomDetail params={dataParams} _onSelect={(data) => onCallBack(data)} />
                    </View>
                    : null}
            </View>
            {/* <FAB
                style={styles.fab}
                big
                icon="plus"
                color="#fff"
                onPress={() => {
                    clickAdd.current = true;
                    if (deviceType == Constant.PHONE)
                        props.navigation.navigate(ScreenList.RoomDetail, { _onSelect: onCallBack })
                    else {
                        setDataParams({})
                    }
                }}
            /> */}
        </View>

    );

}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    },
    fill: {
        flex: 1, backgroundColor: "#fff",
    },
    header: {
        backgroundColor: "#eeeeee",
        borderRadius: 10, margin: 10,
        // width: Metrics.screenWidth * 1.5,
        flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 0, borderBottomColor: colors.colorchinh
    }
})