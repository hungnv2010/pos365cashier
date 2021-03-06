import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Snackbar, FAB } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/Colors';
import { Metrics } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dataManager from '../../data/DataManager';
import {useSelector, useDispatch } from 'react-redux';
import dialogManager from '../../components/dialog/DialogManager';
import { ScreenList } from '../../common/ScreenList';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [roomGroups, setRoomGroups] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [itemRoomGroupAdd, setRoomGroupAdd] = useState("");
    const dispatch = useDispatch()
    const groupsBackup = useRef([]);
    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        console.log("Room props.route.params ", JSON.stringify(props.route.params));
        let groups = [];
        if (props.route.params.roomGroups.length > 0) {
            props.route.params.roomGroups.forEach(element => {
                let rooms = [];
                props.route.params.rooms.forEach(item => {
                    if (element.Id === item.RoomGroupId) {
                        console.log("check ", element.Id === item.RoomGroupId, element.Id, item.RoomGroupId)
                        rooms.push(JSON.parse(JSON.stringify(item)))
                    }
                });
                groups.push({ ...JSON.parse(JSON.stringify(element)), rooms: rooms })
            });
        }
        console.log("roomGroups ====  ", JSON.stringify(groups));
        groupsBackup.current = groups;
        setRoomGroups(groups.reverse())
    }, [])

    const onChangeTextSearch = (text) => {
        if (text != "") {
            let groups = groupsBackup.current.filter(item => item.Name.indexOf(text) > -1)
            console.log("onChangeTextSearch groups", groups);
            setRoomGroups(groups)
        } else {
            setRoomGroups(groupsBackup.current)
        }
    }

    const onClickOk = () => {
        let params = { RoomGroup: { Id: 0, Type: null, Discount: 0, DiscountRatio: 0, Name: itemRoomGroupAdd } }
        new HTTPService().setPath(ApiPath.ROOM_GROUPS).POST(params).then(async (res) => {
            console.log("onClickOk ADD_GROUP res ", res);
            if (res) {
                let list = [res, ...roomGroups]
                console.log("onClickOk list ", list);
                setRoomGroups(list);
                onCallBack()
            }
            dialogManager.hiddenLoading();
            setShowModal(false)
        }).catch((e) => {
            dialogManager.hiddenLoading();
            setShowModal(false)
            console.log("onClickOk err ", e);
        })
        setRoomGroupAdd("")
    }

    const onCallBack = async (data = "") => {
        console.log("onCallBack data ", data, typeof (data));
        dispatch({ type: 'ALREADY', already: false })
        await realmStore.deleteSchema([SchemaName.ROOM_GROUP])
        await dataManager.syncRoomsReInsert()
        dispatch({ type: 'ALREADY', already: true })
        if (data != "") {
            console.log("onCallBack roomGroups ::: ", data.type, data.type == "Edit");
            if (data.type == "Edit") {
                console.log("onCallBack roomGroups ::1: ");
                let groups = []
                roomGroups.forEach(element => {
                    let object = element;
                    if (element.Id == data.res.Id) {
                        object = { ...element, ...data.res }
                    }
                    groups.push(object)
                });
                console.log("onCallBack edit groups ", groups);
                setRoomGroups(groups)
            } else if (data.type == "Delete") {
                let groups = []
                roomGroups.forEach(element => {
                    if (element.Id != data.res.Id) {
                        groups.push(element)
                    }

                });
                console.log("onCallBac del groups ", groups);
                setRoomGroups(groups)
            }
        }
    }

    const onClickRoomGroups = (item) => {
        console.log("onClickRoomGroups item ", JSON.stringify(item));
        props.navigation.navigate(ScreenList.RoomCategoryDetail, { ...item, _onSelect: onCallBack })
    }

    const renderContentModal = () => {
        return (
            <View style={{ padding: 10 }}>
                <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>{I18n.t('them_moi_nhom')}</Text>
                <View style={styles.view_border_input}>
                    <TextInput style={{ height: 40, paddingLeft: 10, color: "#000", borderWidth: 0.5, borderColor: "gray" }} value={itemRoomGroupAdd} onChangeText={(text) => setRoomGroupAdd(text)} placeholder={I18n.t('ten_nhom')} placeholderTextColor="gray" />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => {
                        setRoomGroupAdd("");
                        setShowModal(false)
                    }}>
                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500", marginRight: 15, color: "red" }}>{I18n.t('huy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={onClickOk}>
                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500" }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.conatiner}>
            <ToolBarDefault
                clickLeftIcon={() => {
                    props.route.params._onSelect();
                    props.navigation.pop()
                }}
                navigation={props.navigation}
                title={I18n.t('nhom_phong_ban')}
            />

            <View style={{ margin: 15, backgroundColor: "#fff", borderRadius: 5, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={"md-search"} size={25} color="black" style={{ marginLeft: 10 }} />
                <TextInput style={{ padding: 10, flex: 1, color: "#000" }} onChangeText={(text) => onChangeTextSearch(text)} />
            </View>

            <ScrollView>
                {
                    roomGroups.map((item, index) => {
                        return (
                            <TouchableOpacity onPress={() => onClickRoomGroups(item)} style={{ margin: 15, marginTop: 0, backgroundColor: "#fff", padding: 10, borderRadius: 5, flexDirection: "column" }}>
                                <Text style={{ fontWeight: "bold" }}>{item.Name}</Text>
                                <Text style={{ marginTop: 5 }}>{I18n.t('so_luong_ban')}: {item.rooms && item.rooms.length > 0 ? item.rooms.length : 0}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
            { allPer.Room_Create || allPer.IsAdmin ?
                <FAB
                    style={styles.fab}
                    big
                    icon="plus"
                    color="#fff"
                    onPress={() => {
                        setShowModal(true)
                    }}
                /> : null
            }

            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            {renderContentModal()}
                        </View>
                    </View>
                </View>
            </Modal>

            <Snackbar
                duration={1500}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
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
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    }
})