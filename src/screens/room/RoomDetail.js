import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar } from 'react-native-paper';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import colors from '../../theme/Colors';
import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [room, setRoom] = useState({})
    const [isEditRoom, setIsEditRoom] = useState(false)

    useEffect(() => {
        console.log("Data ====== ", props.route.params);
        if (props.route.params && props.route.params.Id) {
            setIsEditRoom(true)
            setRoom(JSON.parse(JSON.stringify(props.route.params)))
        }
    }, [])

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
                        <View style={[styles.view_border_input, { flex: 1 }]}>
                            <TextInput style={{ padding: 10, flex: 1, color: "#000" }} />
                            <IconAntDesign name={"down"} size={20} color="gray" style={{ marginRight: 10 }} />
                        </View>
                        <TouchableOpacity style={{ marginTop: 10, marginLeft: 10, backgroundColor: colors.colorLightBlue, padding: 5.5, borderRadius: 4 }}>
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
                    <View style={styles.view_border_input}>
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} />
                        <IconAntDesign name={"down"} size={20} color="gray" style={{ marginRight: 10 }} />
                    </View>
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
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", marginTop: 0, borderRadius: 10, backgroundColor: "#f2f2f2", justifyContent: "center", alignItems: "center", padding: 10 }}>
                        <IconAntDesign name={"delete"} size={25} color="black" />
                    </TouchableOpacity>
                    : null}
                <TouchableOpacity style={{ flex: 8, flexDirection: "row", marginLeft: isEditRoom ? 15 : 0, marginTop: 0, borderRadius: 10, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 15 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold"}}>Áp dụng</Text>
                </TouchableOpacity>
            </View>

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
    view_border_input: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, borderWidth: 0.5, borderRadius: 2, borderColor: "black" }
})