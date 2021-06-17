import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Snackbar, FAB } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dataManager from '../../data/DataManager';
import {useSelector, useDispatch } from 'react-redux';
import dialogManager from '../../components/dialog/DialogManager';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [roomGroup, setRoomGroup] = useState({})
    const [showModal, setShowModal] = useState(false);
    const [itemRoomGroupAdd, setRoomGroupAdd] = useState("");
    const dispatch = useDispatch()
    const groupsBackup = useRef([]);
    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        console.log("Room props.route.params ", props.route.params);
        setRoomGroupAdd(props.route.params.Name)
        setRoomGroup(props.route.params)
    }, [])

    const onClickOk = () => {
        if (allPer.Room_Update || allPer.IsAdmin) {
            let params = { RoomGroup: { Id: props.route.params.Id, Type: null, Discount: 0, DiscountRatio: 0, Name: itemRoomGroupAdd } }
            new HTTPService().setPath(ApiPath.ROOM_GROUPS).POST(params).then(async (res) => {
                console.log("onClickOk ADD_GROUP res ", res);
                if (res) {
                    setRoomGroupAdd(res.Name)
                    setRoomGroup(res)
                    groupsBackup.current = { type: "Edit", res: res }
                }
                dialogManager.hiddenLoading();
                setShowModal(false)
            }).catch((e) => {
                dialogManager.hiddenLoading();
                setShowModal(false)
                console.log("onClickOk err ", e);
            })
        } else {
            setShowModal(false)
            dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }

    const onCallBack = async () => {
        console.log("onCallBack ");
        dispatch({ type: 'ALREADY', already: false })
        await dataManager.syncRoomsReInsert()
        dispatch({ type: 'ALREADY', already: true })
    }

    const onClickDelete = () => {
        if (allPer.Room_Delete || allPer.IsAdmin) {
            dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_nhom_phong_ban'), I18n.t("thong_bao"), res => {
                if (res == 1) {
                    new HTTPService().setPath(ApiPath.ROOM_GROUPS + "/" + roomGroup.Id).DELETE({}).then(async (res) => {
                        console.log("onClickDelete res ", res);
                        if (res) {
                            // groupsBackup.current = { type: "Delete", data: res }
                            props.route.params._onSelect({ type: "Delete", res: roomGroup })
                            props.navigation.pop()
                        }
                        dialogManager.hiddenLoading();
                    }).catch((e) => {
                        dialogManager.hiddenLoading();
                        console.log("onClickDelete err ", e);
                    })
                }
            })
        } else {
            dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }

    const onClickEdit = () => {
        setShowModal(true)
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
                    props.route.params._onSelect(groupsBackup.current)
                    props.navigation.pop()
                }}
                navigation={props.navigation}
                title={I18n.t('chi_tiet_nhom_phong_ban')}
            />

            <View style={{ margin: 15, padding: 20, backgroundColor: "#fff", borderRadius: 10, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Image style={{ height: 50, marginBottom: 15 }} resizeMode={"contain"} source={Images.icon_phong_ban} />
                <Text>{roomGroup.Name}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
                <TouchableOpacity onPress={() => onClickEdit()} style={{ justifyContent: "center", flexDirection: "row", borderRadius: 20, padding: 12, width: (Metrics.screenWidth / 2) - 25, backgroundColor: "#f6871e1a" }}>
                    <Image style={{ width: 20, height: 20, marginRight: 7 }} source={Images.icon_edit} />
                    <Text>{I18n.t('chinh_sua')}</Text>
                </TouchableOpacity>
                {
                    allPer.Room_Delete || allPer.IsAdmin ?
                        <TouchableOpacity onPress={() => onClickDelete()} style={{ justifyContent: "center", flexDirection: "row", borderRadius: 20, padding: 12, width: (Metrics.screenWidth / 2) - 25, backgroundColor: "#f21e3c1a" }}>
                            <Image style={{ width: 20, height: 20, marginRight: 7 }} source={Images.trash} />
                            <Text>{I18n.t('xoa')}</Text>
                        </TouchableOpacity>
                        : null
                }
            </View>

            <ScrollView style={{ margin: 10 }}>
                {
                    props.route.params.rooms && props.route.params.rooms.length > 0 ?
                        props.route.params.rooms.map((item, index) => {
                            return (
                                <View style={{ margin: 0, marginTop: 0, backgroundColor: "#fff", padding: 10, paddingLeft: 0, borderRadius: 5, flexDirection: "row", alignItems: "center" }}>
                                    <Image style={{ height: 40 }} resizeMode={"contain"} source={Images.icon_phong_ban} />
                                    <Text style={{ fontWeight: "bold" }}>{item.Name}</Text>
                                </View>
                            )
                        })
                        : null
                }
            </ScrollView>

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