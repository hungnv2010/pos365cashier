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
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import RoomDetail from './RoomDetail'

var HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 70 : 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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

    const [statescrollY, setScrollY] = useState(new Animated.Value(
        Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
    ))

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
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
        if (data != "Add")
            await realmStore.deleteRoom()
        await dataManager.syncRoomsReInsert()
        getDataInRealm();
        isReLoad.current = true;
    }

    useEffect(() => {
        setUpdate(1)
    }, [expand])

    const onClickItem = (el) => {
        roomItem.current = el;
        if (deviceType == Constant.PHONE)
            props.navigation.navigate(ScreenList.RoomDetail, { room: roomItem.current, listRoom: rooms, roomGroups: props.route.params.roomGroups, _onSelect: onCallBack })
        else {
            setDataParams({ ...{ room: roomItem.current, listRoom: rooms, roomGroups: props.route.params.roomGroups } })
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
                style={{ flexGrow: 1 }}
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
                                                    <Text style={{ padding: 15 }}>{item.list.length} {I18n.t('ban')}</Text>
                                                </View>

                                                {
                                                    item.list.map((el, indexEl) => {
                                                        return (
                                                            <TouchableOpacity key={indexEl.toString()} onPress={() => onClickItem(el)} style={{ backgroundColor: "#fff", padding: 15, flexDirection: "column" }}>
                                                                <Text style={{ textTransform: "uppercase", fontWeight: "bold" }}>{el.Name}</Text>
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
                    if (isReLoad.current == true)
                        props.route.params._onSelect();
                    props.navigation.goBack()
                }}
                navigation={props.navigation}
                title={I18n.t('danh_sach_phong_ban')}
            />

            <View style={{ flexDirection: "row", flex: 1}}>
                <View style={{ flex: 1, flexDirection: "column" }}>
                    <View
                        onLayout={(event) => {
                            var { x, y, width, height } = event.nativeEvent.layout;
                        }}
                        // flexShrink: expand < true && rooms.length > 5 ? 3.5 : 0 
                        style={[styles.header, {}]}>
                        {
                            [{ Id: "", Name: I18n.t("tat_ca") }].concat(rooms).map((item, index) => {
                                return (
                                    <TouchableOpacity key={index.toString()} onPress={() => onClickTab(item, index)} style={{
                                        padding: 10,
                                    }}>
                                        <Text style={{ color: indexTab == index ? colors.colorLightBlue : "black", fontSize: 15 }}>{item.Name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>
                    {_renderScrollViewContent()}
                </View>
                {deviceType == Constant.TABLET ?
                    <View style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: "#ccc" }}>
                        <RoomDetail params={dataParams} _onSelect={(data) => onCallBack(data)} />
                    </View>
                    : null}
            </View>
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
                        setDataParams({})
                    }
                }}
            />
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