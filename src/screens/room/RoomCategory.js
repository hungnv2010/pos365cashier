import React, { useEffect, useState, useLayoutEffect } from 'react';
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
import { useDispatch } from 'react-redux';
import dialogManager from '../../components/dialog/DialogManager';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [roomGroups, setRoomGroups] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [itemRoomGroupAdd, setRoomGroupAdd] = useState("");
    const dispatch = useDispatch()

    useEffect(() => {
        console.log("Room props.route.params ", JSON.stringify(props.route.params));
        setRoomGroups(props.route.params.roomGroups)

    }, [])

    // const setRoomGroupAdd = (text) =>{

    // }

    const onClickOk = () => {
        let params = { RoomGroup: { Id: 0, Type: null, Discount: 0, DiscountRatio: 0, Name: itemRoomGroupAdd } }
        new HTTPService().setPath(ApiPath.ROOM_GROUPS).POST(params).then(async (res) => {
            console.log("onClickOk ADD_GROUP res ", res);
            if (res) {
                let list = [...roomGroups, res]
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

    const onCallBack = async () => {
        console.log("onCallBack ");
        dispatch({ type: 'ALREADY', already: false })
        await dataManager.syncRoomsReInsert()
        dispatch({ type: 'ALREADY', already: true })
        // getDataInRealm();
        // isReLoad.current = true;
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
                navigation={props.navigation}
                title={I18n.t('nhom_phong_ban')}
            />

            <View style={{ margin: 15, backgroundColor: "#fff", borderRadius: 5, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={"md-search"} size={25} color="black" style={{ marginLeft: 10 }} />
                <TextInput style={{ padding: 10, flex: 1, color: "#000" }} />
            </View>

            <ScrollView>
                {
                    roomGroups.map((item, index) => {
                        return (
                            <View style={{ margin: 15, marginTop: 0, backgroundColor: "#fff", padding: 10, borderRadius: 5, flexDirection: "column" }}>
                                <Text style={{ fontWeight: "bold" }}>{item.Name}</Text>
                                <Text style={{ marginTop: 5 }}>{I18n.t('so_luong_ban')}: 0</Text>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <FAB
                style={styles.fab}
                big
                icon="plus"
                color="#fff"
                onPress={() => {
                    setShowModal(true)
                }}
            />

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