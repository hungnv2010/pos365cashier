import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Snackbar } from 'react-native-paper';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images } from '../../theme';
import { ScreenList } from '../../common/ScreenList';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [rooms, setRooms] = useState([])
    const [roomGroups, setRoomGroups] = useState([])

    useEffect(() => {

        getDataInRealm();

    }, [])

    const getDataInRealm = async () => {
        roomsTmp = await realmStore.queryRooms()
        roomsTmp = roomsTmp.sorted('Position')
        roomGroupsTmp = await realmStore.queryRoomGroups()
        roomGroupsTmp = roomGroupsTmp.sorted('Id')
        setRooms(roomsTmp)
        setRoomGroups(roomGroupsTmp)
    }

    const onCallBack = ()=> {
        getDataInRealm();
    }

    const onClickRoomCategori = () => {
        props.navigation.navigate(ScreenList.RoomCategory, roomGroups)
    }

    const onClickRoomList = () => {
        props.navigation.navigate(ScreenList.RoomList, { rooms: rooms, roomGroups: roomGroups, _onSelect: onCallBack })
    }

    return (
        <View style={styles.conatiner}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('danh_muc_phong_ban')}
            />

            <TouchableOpacity onPress={() => onClickRoomCategori()} style={styles.view_item}>
                <Image style={styles.image} source={Images.icon_product} />
                <View style={styles.view_info}>
                    <Text style={styles.title}>{I18n.t('nhom_phong_ban')}</Text>
                    <Text>{I18n.t('so_luong_nhom')}: {roomGroups.length}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onClickRoomList()} style={[styles.view_item, { marginTop: 0 }]}>
                <Image style={styles.image} source={Images.icon_product} />
                <View style={styles.view_info}>
                    <Text style={styles.title}>{I18n.t('danh_sach_phong_ban')}</Text>
                    <Text>{I18n.t('so_luong_ban')}: {rooms.length}</Text>
                </View>
            </TouchableOpacity>

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
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    image: { width: 70, height: 70 },
    view_item: { margin: 20, backgroundColor: "#fff", padding: 10, borderRadius: 10, flexDirection: "row", alignItems: "center" },
    view_info: { flexDirection: "column", marginLeft: 10, height: "100%" },
    title: { fontWeight: "bold", marginBottom: 10 }
})