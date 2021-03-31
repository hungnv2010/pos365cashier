import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import { Snackbar } from 'react-native-paper';
import I18n from '../../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { currencyToString, dateUTCToDate, dateToString } from '../../../common/Utils';
import realmStore, { SchemaName } from '../../../data/realm/RealmStore';
import { useSelector } from 'react-redux';
import colors from '../../../theme/Colors';
import dialogManager from '../../../components/dialog/DialogManager';
import { URL } from '../../../data/services/HttpService';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import { Constant } from '../../../common/Constant';
import { ScreenList } from '../../../common/ScreenList';
import { useFocusEffect } from '@react-navigation/native';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [dataPaymentPending, setDataPaymentPending] = useState([]);
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    useFocusEffect(
        React.useCallback(() => {
            getData();
        }, [])
    );

    // useEffect(() => {
    //     getData();
    // }, [])

    const getData = async () => {
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        if (vendorSession != "") {
            dialogManager.showLoading()
            vendorSession = JSON.parse(vendorSession)
            let queryQRCode = await realmStore.queryQRCode();
            let queryString = `HostName == '${URL.link}'`;
            queryString += (vendorSession.CurrentBranchId && vendorSession.CurrentBranchId != 0 ? ` AND BranchId == ${vendorSession.CurrentBranchId}` : '');
            queryQRCode = queryQRCode.filtered(queryString)
            console.log("useEffect queryQRCode ", JSON.parse(JSON.stringify(queryQRCode)));
            let queryQRCodeReverse = [];
            queryQRCode.forEach(element => {
                queryQRCodeReverse.push(element);
            });
            setDataPaymentPending(queryQRCodeReverse.reverse())
            // setTimeout(() => {
            dialogManager.hiddenLoading()
            // }, 500);
        }
    }

    const onClickItemOrder = (item, type = 1) => {
        console.log("onClickItemOrder item ", item);
        props.navigation.navigate(ScreenList.DetailPaymentPending, { data: item, CreateQR: type == 1 ? false : true })
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                navigation={props.navigation}
                title={I18n.t("don_hang_cho_thanh_toan_vnpay_qr")}
            />
            <View style={styles.syncData}>
                <Text style={styles.textOrder}>{I18n.t('don_hang')}({dataPaymentPending.length > 0 ? dataPaymentPending.length : 0})</Text>
                <Icon onPress={getData} name="sync" size={25} color={colors.colorLightBlue} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginHorizontal: 10 }}>{
                dataPaymentPending.map((item, index) => {
                    let jsonContent = JSON.parse(item.JsonContent)
                    console.log("render jsonContent ", jsonContent);
                    return (
                        <TouchableOpacity key={index.toString()} style={[styles.viewItem, { marginTop: index == 0 ? 0 : 10 }]} onPress={() => onClickItemOrder(item, 1)}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 }}>
                                <Text style={{ fontWeight: "bold", color: colors.colorLightBlue, textTransform: 'uppercase' }}>{jsonContent.RoomName ? jsonContent.RoomName : I18n.t('don_hang')}</Text>
                                <Text style={{ fontWeight: "bold" }}>{item.Code}</Text>
                            </View>
                            <View style={{ borderBottomColor: "#ddd", borderBottomWidth: .5, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: "#808080" }}>{item.Status ? I18n.t("da_thanh_toan") : I18n.t("chua_thanh_toan")}</Text>
                                <Text style={{ color: "#808080" }}>{jsonContent.Partner && jsonContent.Partner.Name && jsonContent.Partner.Name != '' ? jsonContent.Partner.Name : I18n.t('khach_le')}</Text>
                            </View>
                            <View style={{ marginTop: 0, flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 }}>
                                <Text style={{}}>{I18n.t("thoi_gian")}</Text>
                                <Text style={{}}>{dateToString(new Date(jsonContent.PurchaseDate), "DD-MM-YYYY HH:mm")}</Text>
                            </View>
                            <View style={{ paddingVertical: 5, flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 }}>
                                <Text style={{}}>{I18n.t('tong_tien')}</Text>
                                <Text style={{ fontWeight: "bold", color: colors.colorLightBlue, }}>{currencyToString(jsonContent.Total)} đ</Text>
                            </View>
                            <TouchableOpacity style={styles.butonCreateQRCode} onPress={() => onClickItemOrder(item, 2)}>
                                <Text style={{ fontWeight: "bold", color: colors.colorLightBlue }}>{I18n.t('tao_lai_ma_qr')}</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View >
    );
};


const styles = StyleSheet.create({
    butonCreateQRCode: {
        width: "100%", flex: 1, backgroundColor: "#139ffa1a",
        justifyContent: "center", alignItems: "center", paddingHorizontal: 15, paddingVertical: 12, borderRadius: 5
    },
    viewItem: {
        width: "100%", flex: 1,
        padding: 10, backgroundColor: "#fff",
        justifyContent: "center", paddingHorizontal: 15, paddingBottom: 15, borderRadius: 10
    },
    textOrder: { fontWeight: "bold", color: "gray", textTransform: "uppercase" },
    syncData: { flexDirection: "row", padding: 5, paddingHorizontal: 10, justifyContent: "space-between", alignItems: "center" },
    textButton: { color: colors.colorLightBlue, fontWeight: "bold" },
    button: { marginTop: 10, width: "100%", height: 50, justifyContent: "center", backgroundColor: "#fff", borderRadius: 15, paddingLeft: 20 },
})