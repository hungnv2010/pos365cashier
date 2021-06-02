import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Snackbar, RadioButton } from 'react-native-paper';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import colors from '../../theme/Colors';
import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dialogManager from '../../components/dialog/DialogManager';
import dataManager from '../../data/DataManager';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { height } from 'react-native-daterange-picker/src/modules';

const TYPE_MODAL = {
    ADD_GROUP: 1,
    SELECT_GROUP: 2,
    SELECT_SERVICE: 3
}

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [room, setRoom] = useState({})
    const [isEditRoom, setIsEditRoom] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [itemRoomGroupAdd, setRoomGroupAdd] = useState("");
    const [itemProductService, setProductService] = useState("");
    const [itemRoomGroup, setRoomGroup] = useState("");
    const typeModal = useRef(0)
    const listProductService = useRef([])
    const roomGroups = useRef([])
    const [indexRoomGroups, setIndexRoomGroups] = useState(-1)
    const [indexProductService, setIndexProductService] = useState(0)
    const [vendorSession, setVendorSession] = useState({});
    const [branch, setBranch] = useState({});

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {
        console.log("Room detail params ====== ", props);
        getData(props.params);
        getRoomGroup()
    }, [props.params])

    useEffect(() => {
        console.log("Room detail data ====== ", props);
        if (deviceType == Constant.PHONE)
            getData(props.route.params);
        getRoomGroup()
    }, [])

    const getData = async (params) => {
        console.log("getData detail params ====== ", params);
        if (params && params.room) {
            setIsEditRoom((params.room && params.room != undefined) ? true : false)
            if (params.room && params.room != undefined)
                setRoom(JSON.parse(JSON.stringify(params.room)))
            if (params.roomGroups && params.roomGroups != undefined)
                roomGroups.current = JSON.parse(JSON.stringify(params.roomGroups))
            roomGroups.current = [{ Id: "", Name: I18n.t("khong_xac_dinh") }].concat(Object.keys(roomGroups.current).map((key) => roomGroups.current[key]));
            if (params.room && params.room.RoomGroupId) {
                setIndexRoomGroups(roomGroups.current.findIndex(item => item.Id == params.room.RoomGroupId))
                let array = roomGroups.current.filter(item => (item.Id == params.room.RoomGroupId && params.room.RoomGroupId != 0));
                setRoomGroup(array.length > 0 ? array[0] : "")
            }
        } else {
            resetRoom();
        }

        let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        console.log('getDataInRealm VENDOR_SESSION data', JSON.parse(data));
        if (data && data != "")
            data = JSON.parse(data)
        setVendorSession(data);

        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        if (branch && branch != "") {
            setBranch(JSON.parse(branch))
        }

        let products = await realmStore.queryProducts();
        listProductService.current = products.filter(item => ((item.IsTimer && item.IsTimer == true && item.ProductType == 2)))
        listProductService.current = [{ Id: "", Name: I18n.t("khong_xac_dinh") }].concat(listProductService.current);
        if (params && params.room != undefined) {
            let product = listProductService.current.filter(item => (item.Id == params.room.ProductId && params.room.ProductId != 0))
            setProductService(product && product.length > 0 ? product[0] : "");
        }
    }
    const getRoomGroup = () => {
        new HTTPService().setPath(ApiPath.ROOM_GROUPS).GET().then((res) => {
            if (res) {
                roomGroups.current = res
            }
        }).catch(e => {
            console.log("err", e);
        })
    }

    const resetRoom = () => {
        setIsEditRoom(false)
        setRoom("")
        setRoomGroup("")
        setProductService({})
        getDataRoomGroup()
    }

    const getDataRoomGroup = async () => {
        let roomGroupsTmp = await realmStore.queryRoomGroups()
        roomGroupsTmp = roomGroupsTmp.sorted('Id')
        roomGroups.current = JSON.parse(JSON.stringify(roomGroupsTmp))
        roomGroups.current = [{ Id: "", Name: I18n.t("khong_xac_dinh") }].concat(Object.keys(roomGroups.current).map((key) => roomGroups.current[key]));
        console.log("roomdetail", roomGroups.current);
    }

    const onClickAddGroup = () => {
        typeModal.current = TYPE_MODAL.ADD_GROUP
        setShowModal(true)
    }

    const onSelectGroup = () => {
        typeModal.current = TYPE_MODAL.SELECT_GROUP
        setShowModal(true)
    }

    const onSelectService = () => {
        typeModal.current = TYPE_MODAL.SELECT_SERVICE
        setShowModal(true)
    }

    const onClickOk = () => {

        if (typeModal.current == TYPE_MODAL.ADD_GROUP) {
            let params = { RoomGroup: { Id: 0, Type: null, Discount: 0, DiscountRatio: 0, Name: itemRoomGroupAdd } }
            new HTTPService().setPath(ApiPath.ROOM_GROUPS).POST(params).then(async (res) => {
                console.log("onClickOk ADD_GROUP res ", res);
                if (res) {
                    if (res.ResponseStatus) {
                        dialogManager.showPopupOneButton(`${res.ResponseStatus.Message}`, I18n.t('thong_bao'))
                    } else {
                        props._onSelect('Add')
                        roomGroups.current.push(res)
                    }
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
        if (typeModal.current == TYPE_MODAL.SELECT_SERVICE) {
            if (indexProductService != 0) {
                setProductService(listProductService.current[indexProductService])
            } else {
                setProductService('')
            }
            setShowModal(false)
        }
        if (typeModal.current == TYPE_MODAL.SELECT_GROUP) {
            if (indexRoomGroups > -1)
                setRoomGroup(roomGroups.current[indexRoomGroups].Id != "" ? roomGroups.current[indexRoomGroups] : "")
            setShowModal(false)
        }

    }

    const onClickApply = () => {
        Keyboard.dismiss();
        if (!(room && room.Name && room.Name.trim() != "")) {
            setToastDescription(I18n.t("vui_long_nhap_day_du_thong_tin_truoc_khi_luu"))
            setShowToast(true)
            return;
        }

        if (isEditRoom) {
            let params = {
                Room: {
                    BranchId: branch.Id ? branch.Id : "",
                    //CreatedBy: vendorSession.CurrentUser.Id,
                    // CreatedDate: "2020-09-16T03:11:46.8330000Z"
                    //RetailerId: vendorSession.CurrentUser.RetailerId,

                    Id: room.Id,
                    // Printer: "12"
                    Description: room.Description,
                    Name: room.Name,
                    Position: room.Position,
                    Product: itemProductService,
                    ProductId: itemProductService.Id,
                    RoomGroupId: itemRoomGroup.Id
                }
            };
            console.log("onClickApply isEditRoom params ", params);
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.ROOMS).POST(params).then(async (res) => {
                console.log("onClickApply isEditRoom  res ", res);
                if (res) {
                    if (deviceType == Constant.PHONE) {
                        if (res.ResponseStatus) {
                            dialogManager.showPopupOneButton(`${res.ResponseStatus.Message}`, I18n.t('thong_bao'))
                        } else {
                            props.route.params._onSelect("Add");
                            props.navigation.pop()
                        }
                    } else {
                        if (res.ResponseStatus) {
                            dialogManager.showPopupOneButton(`${res.ResponseStatus.Message}`, I18n.t('thong_bao'))
                        } else {
                            props._onSelect("Add")
                        }
                    }
                }
                dialogManager.hiddenLoading();
            }).catch((e) => {
                dialogManager.hiddenLoading();
                console.log("onClickApply isEditRoom err ", e);
            })
        } else {
            let params = {
                Room: {
                    // Printer: "12"
                    Description: room.Description,
                    Name: room.Name,
                    Position: room.Position,
                    Product: itemProductService,
                    ProductId: itemProductService.Id,
                    RoomGroupId: itemRoomGroup.Id
                }
            };
            console.log("onClickApply params ", params);
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.ROOMS).POST(params).then(async (res) => {
                console.log("onClickApply  res ", res);
                if (res) {
                    dialogManager.hiddenLoading();
                    if (res.ResponseStatus && res.ResponseStatus.ErrorCode) {
                        dialogManager.showPopupOneButton(res.ResponseStatus.Message)
                        // props.navigation.pop()
                        return;
                    }
                    if (deviceType == Constant.PHONE) {
                        props.route.params._onSelect("Add");
                        props.navigation.pop()
                    } else {
                        props._onSelect("Add")
                        resetRoom();
                    }
                }

            }).catch((e) => {
                dialogManager.hiddenLoading();
                console.log("onClickApply err ", e);
            })
        }
    }

    const onClickDone = () => {
        if (isEditRoom) {
            if (props.permission.update || (props.route.params && props.route.params.permission && props.route.params.permission.update)) onClickApply()
            else {
                dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                    dialogManager.destroy();
                }, null, null, I18n.t('dong'))
            }
        } else {
            if (props.permission.create || (props.route.params && props.route.params.permission && props.route.params.permission.create)) onClickApply()
            else {
                dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                    dialogManager.destroy();
                }, null, null, I18n.t('dong'))
            }
        }
    }

    const onClickDelete = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_ban_nay'), I18n.t("thong_bao"), async res => {
            if (res == 1) {
                dialogManager.showLoading();
                new HTTPService().setPath(ApiPath.ROOMS + "/" + room.Id).DELETE().then(async (res) => {
                    console.log("onClickDelete  res ", res);
                    if (res) {
                        if (deviceType == Constant.PHONE) {
                            props.route.params._onSelect(room.Id);
                            props.navigation.pop()
                        } else {
                            props._onSelect(room.Id)
                            resetRoom();
                        }
                    }
                    dialogManager.hiddenLoading();
                }).catch((e) => {
                    dialogManager.hiddenLoading();
                    console.log("onClickDelete err ", e);
                })
            }
        })
    }

    const renderContentModal = () => {
        if (typeModal.current == TYPE_MODAL.ADD_GROUP)
            return (
                <View style={{ padding: 10 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>{I18n.t('them_moi_nhom')}</Text>
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} value={itemRoomGroupAdd} onChangeText={(text) => setRoomGroupAdd(text)} placeholder={I18n.t('ten_nhom')} placeholderTextColor="gray" />
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
        if (typeModal.current == TYPE_MODAL.SELECT_GROUP) {
            return (
                <View style={{ padding: 10, height: Metrics.screenHeight * 0.6 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>{I18n.t('chon_nhom')}</Text>
                    <ScrollView>
                        {roomGroups.current.map((el, index) => {
                            return (
                                <TouchableOpacity onPress={() => {
                                    setIndexRoomGroups(index)
                                }} key={index} style={{ flexDirection: "row", alignItems: "center", }}>
                                    <RadioButton.Android
                                        color={colors.colorLightBlue}
                                        status={indexRoomGroups == index ? 'checked' : 'unchecked'}
                                        onPress={() => { setIndexRoomGroups(index) }}
                                    />
                                    <Text style={{ marginLeft: 20 }}>{el.Name}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
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
        if (typeModal.current == TYPE_MODAL.SELECT_SERVICE) {
            return (
                <View style={{ padding: 10, height: Metrics.screenHeight * 0.7 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>{I18n.t('dich_vu_tinh_gio')}</Text>
                    <ScrollView>
                        {listProductService.current.map((el, index) => {
                            return (
                                <TouchableOpacity onPress={() => { setIndexProductService(index) }} key={index} style={{ flexDirection: "row", alignItems: "center", }}>
                                    <RadioButton.Android
                                        color={colors.colorLightBlue}
                                        status={indexProductService == index ? 'checked' : 'unchecked'}
                                        onPress={() => { setIndexProductService(index) }}
                                    />
                                    <Text style={{ marginLeft: 20 }}>{el.Name}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
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
    }

    return (
        <View style={styles.conatiner}>
            {deviceType != Constant.TABLET ?
                <ToolBarDefault
                    {...props}
                    navigation={props.navigation}
                    clickLeftIcon={() => {
                        props.navigation.goBack()
                    }}
                    title={(props.route.params.room && props.route.params.room.Name) ? I18n.t('cap_nhat_phong_ban') : I18n.t('them_phong_ban')}
                /> : null}

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.view_content}>
                <View>
                    <Text>{I18n.t('ten_phong_ban')}</Text>
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} value={room.Name ? room.Name : ""} onChangeText={(text) => setRoom({ ...room, Name: text })} />
                        <Ionicons name={"close"} size={25} color="black" style={{ marginRight: 10 }} onPress={() => { setRoom({ ...room, Name: '' }) }} />
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>{I18n.t('ten_nhom')}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <TouchableOpacity onPress={onSelectGroup} style={[styles.view_border_input, { flex: 1 }]}>
                            <Text style={{ padding: 11.5, flex: 1, color: "#000" }} >{itemRoomGroup.Name}</Text>
                            <IconAntDesign name={"down"} size={20} color="gray" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={onClickAddGroup} style={{ marginTop: 10, marginLeft: 10, backgroundColor: colors.colorLightBlue, padding: 5.5, borderRadius: 4 }}>
                            <Ionicons name={"plus"} size={25} color="white" />
                        </TouchableOpacity> */}
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>{I18n.t('thu_tu_hien_thi')}</Text>
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} value={room.Position ? room.Position.toString() : ""} onChangeText={(text) => setRoom({ ...room, Position: +text })} />
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>{I18n.t('dich_vu_tinh_gio')}</Text>
                    <TouchableOpacity onPress={onSelectService} style={styles.view_border_input}>
                        <Text style={{ padding: 11.5, flex: 1, color: "#000" }} >{itemProductService.Name}</Text>
                        <IconAntDesign name={"down"} size={20} color="gray" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>{I18n.t('ghi_chu')}</Text>
                    <View style={styles.view_border_input}>
                        <TextInput
                            value={room.Description ? room.Description : ""}
                            onChangeText={(text) => setRoom({ ...room, Description: text })}
                            multiline
                            placeholderTextColor="#808080"
                            style={{ padding: 10, flex: 1, height: 100, color: "#000" }} />
                    </View>
                </View>
                <View style={{ flexDirection: "row", margin: 10, marginHorizontal: 0, marginTop: 50 }}>
                    {isEditRoom && (props.permission && props.permission.delete || (props.route.params && props.route.params.permission && props.route.params.permission.delete)) ?
                        <TouchableOpacity onPress={onClickDelete} style={{ flex: 1, flexDirection: "row", marginTop: 0, borderRadius: 5, backgroundColor: "#f2f2f2", justifyContent: "center", alignItems: "center", padding: 10 }}>
                            <IconAntDesign name={"delete"} size={25} color="black" />
                        </TouchableOpacity>
                        : null}
                    <TouchableOpacity onPress={onClickDone} style={{ flex: 8, flexDirection: "row", marginLeft: isEditRoom ? 15 : 0, marginTop: 0, borderRadius: 5, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 15 }}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>{I18n.t('ap_dung')}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>

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
    conatiner: { flex: 1, backgroundColor: "#ffffff" },
    image: { width: 50, height: 50 },
    view_content: { padding: 15, marginBottom: 0, flex: 1 },
    view_border_input: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, borderWidth: 0.5, borderRadius: 2, borderColor: "black" },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    }
})

