import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback } from "react-native";
import { Snackbar } from 'react-native-paper';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
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
    const [nameRoomGroupAdd, setNameRoomGroup] = useState("");
    const typeModal = useRef(0)

    useEffect(() => {
        console.log("Data ====== ", props.route.params);
        if (props.route.params && props.route.params.Id) {
            setIsEditRoom(true)
            setRoom(JSON.parse(JSON.stringify(props.route.params)))
        }
    }, [])

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
            let params = { RoomGroup: { Id: 0, Type: null, Discount: 0, DiscountRatio: 0, Name: nameRoomGroupAdd } }
            new HTTPService().setPath(ApiPath.ROOM_GROUPS).POST(params).then(async (res) => {
                console.log("onClickOk ADD_GROUP res ", res);
                if (res) {

                }
                dialogManager.hiddenLoading();
                setShowModal(false)
            }).catch((e) => {
                dialogManager.hiddenLoading();
                setShowModal(false)
                console.log("onClickOk err ", e);
            })
            setNameRoomGroup("")
        }

    }

    const renderContentModal = () => {
        if (typeModal.current == TYPE_MODAL.ADD_GROUP)
            return (
                <View style={{ padding: 10 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>Thêm mới nhóm</Text>
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} value={nameRoomGroupAdd} onChangeText={(text) => setNameRoomGroup(text)} placeholder="Tên nhóm" placeholderTextColor="gray" />
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
        if (typeModal.current == TYPE_MODAL.SELECT_GROUP)
            return (
                <View style={{ padding: 10 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>Chọn nhóm</Text>

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
        if (typeModal.current == TYPE_MODAL.SELECT_SERVICE)
            return (
                <View style={{ padding: 10 }}>
                    <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>Dịch vụ tính giờ</Text>
                   
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
                navigation={props.navigation}
                title={room.Name ? room.Name : I18n.t('them_phong_ban')}
            />

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.view_content}>
                <View>
                    <Text>Tên phòng bàn</Text>
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} value={room.Name ? room.Name : ""} />
                        <Ionicons name={"close"} size={25} color="black" style={{ marginRight: 10 }} />
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>Tên nhóm</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <TouchableOpacity onPress={onSelectGroup} style={[styles.view_border_input, { flex: 1 }]}>
                            <Text style={{ padding: 11.5, flex: 1, color: "#000" }} ></Text>
                            <IconAntDesign name={"down"} size={20} color="gray" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClickAddGroup} style={{ marginTop: 10, marginLeft: 10, backgroundColor: colors.colorLightBlue, padding: 5.5, borderRadius: 4 }}>
                            <Ionicons name={"plus"} size={25} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>Thứ tự hiển thị</Text>
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} value={room.Position ? room.Position.toString() : ""} />
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>Dịch vụ tính giờ</Text>
                    <TouchableOpacity onPress={onSelectService} style={styles.view_border_input}>
                        <Text style={{ padding: 11.5, flex: 1, color: "#000" }} ></Text>
                        <IconAntDesign name={"down"} size={20} color="gray" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>Ghi chú</Text>
                    <View style={styles.view_border_input}>
                        <TextInput
                            value={room.Description ? room.Description : ""}
                            multiline
                            placeholderTextColor="#808080"
                            style={{ padding: 10, flex: 1, height: 100, color: "#000" }} />
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <View style={{ flexDirection: "row", margin: 10, marginHorizontal: 20 }}>
                {isEditRoom ?
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", marginTop: 0, borderRadius: 5, backgroundColor: "#f2f2f2", justifyContent: "center", alignItems: "center", padding: 10 }}>
                        <IconAntDesign name={"delete"} size={25} color="black" />
                    </TouchableOpacity>
                    : null}
                <TouchableOpacity style={{ flex: 8, flexDirection: "row", marginLeft: isEditRoom ? 15 : 0, marginTop: 0, borderRadius: 5, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 15 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Áp dụng</Text>
                </TouchableOpacity>
            </View>

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
                duration={5000}
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
    view_content: { padding: 15, marginBottom: 0 },
    view_border_input: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, borderWidth: 0.5, borderRadius: 2, borderColor: "black" },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    }
})