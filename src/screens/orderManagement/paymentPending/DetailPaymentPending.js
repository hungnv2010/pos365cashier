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

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [dataPaymentPending, setDataPaymentPending] = useState({});
    const [dataJsonContent, setDataJsonContent] = useState({});
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    useEffect(() => {
        getData();
    }, [])

    const getData = async () => {
        console.log("getData props.route.params ", props.route.params);
        setDataPaymentPending(props.route.params)
        setDataJsonContent(JSON.parse(props.route.params.JsonContent));
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                navigation={props.navigation}
                title={I18n.t("chi_tiet_don_hang")}
            />
            <View style={styles.syncData}>
                <TouchableOpacity style={styles.buttonCreateQR}>
                    <Image source={Images.qrcode} style={styles.iconButton} />
                    <Text style={styles.textCreateQR}>{I18n.t('tao_lai_ma_qr')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreateQR}>
                    <Image source={Images.change_method} style={styles.iconButton} />
                    <Text style={styles.textCreateQR}>{I18n.t('doi_phuong_thuc_thanh_toan')}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.rowInfo}>
                        <Text style={[styles.textBoldBlack, { textTransform: "uppercase" }]}>{dataPaymentPending.Code}</Text>
                        <Text style={styles.textOrange}>{dataPaymentPending.Status == false ? I18n.t('chua_thanh_toan') : I18n.t('da_thanh_toan')}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={{}}>{I18n.t('ngay_ban')}</Text>
                        <Text style={{}}>{dataJsonContent && dataJsonContent.PurchaseDate ? dateToString(new Date(dataJsonContent.PurchaseDate), "DD-MM-YYYY HH:mm") : ""}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={{}}>{I18n.t('khach_hang')}</Text>
                        <Text style={{}}>{dataJsonContent && dataJsonContent.Partner && dataJsonContent.Partner.Name != '' ? dataJsonContent.Partner.Name : I18n.t('khach_le')}</Text>
                    </View>
                </View>
                <View style={[styles.content, { marginTop: 10 }]}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('tong_tam_tinh')}</Text>
                        <Text style={styles.textBoldBlack}>{dataJsonContent && dataJsonContent.Total ? currencyToString(dataJsonContent.Total + dataJsonContent.Discount) : 0} đ</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('chiet_khau')}</Text>
                        <Text style={styles.textBoldGreen}>{dataJsonContent && dataJsonContent.Discount ? currencyToString(dataJsonContent.Discount) : 0} đ</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('phuong_thuc_thanh_toan')}</Text>
                        <Text style={{}}>VNPAY-QR</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('tong_cong')}</Text>
                        <Text style={styles.textBoldBlack}>{dataJsonContent && dataJsonContent.Total ? currencyToString(dataJsonContent.Total) : 0} đ</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('tong_thanh_toan')}</Text>
                        <Text style={styles.textBoldBlue}>{dataJsonContent && dataJsonContent.TotalPayment ? currencyToString(dataJsonContent.TotalPayment) : 0} đ</Text>
                    </View>
                </View>
                <View style={[styles.content, { marginTop: 10, padding: 20, flex: 1 }]}>
                    <Text style={styles.textBoldBlack}>{I18n.t('san_pham')} ({dataJsonContent.OrderDetails && dataJsonContent.OrderDetails.length ? dataJsonContent.OrderDetails.length : 0})</Text>
                    <View>
                        {
                            dataJsonContent.OrderDetails && dataJsonContent.OrderDetails.length > 0 ?
                                dataJsonContent.OrderDetails.map((item, index) => {
                                    return (
                                        <TouchableOpacity key={index.toString()} style={[styles.viewItem]} onPress={() => onClickItemOrder(item)}>
                                            <Image style={styles.imageProduct} source={item.ProductImages && JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image} />
                                            <View style={styles.viewNameProduct}>
                                                <Text style={{ textTransform: 'uppercase' }}>{item.Name}</Text>
                                                <Text style={{ marginTop: 10, color: "gray" }}>{currencyToString(item.Price)} x {item.Quantity}</Text>
                                            </View>
                                            <View style={styles.viewTotalProduct}>
                                                <Text style={{ color: "gray" }}></Text>
                                                <Text style={{ fontWeight: "bold", marginTop: 10, color: colors.colorLightBlue, }}>{currencyToString(item.Price * item.Quantity)} đ</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                                : null
                        }
                    </View>
                </View>
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
    content: { backgroundColor: "#fff", paddingVertical: 5 },
    textOrange: { fontWeight: "bold", color: "orange" },
    textBoldBlack: { fontWeight: "bold" },
    textBoldGreen: { fontWeight: "bold", color: "green" },
    textBoldBlue: { fontWeight: "bold", color: "#36a3f7" },
    textGray: { color: "gray" },
    rowInfo: { flexDirection: "row", justifyContent: "space-between", padding: 5, paddingHorizontal: 20 },
    iconButton: { width: 32, height: 32 },
    textCreateQR: { marginTop: 10, textAlign: "center" },
    buttonCreateQR: {
        width: "100%", flex: 1, backgroundColor: "#fff",
        justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 5, marginHorizontal: 5
    },
    viewItem: {
        marginTop: 10,
        width: "100%", flex: 1, padding: 10, borderColor: "#ddd", borderWidth: 0.5, flexDirection: "row", borderRadius: 5
    },
    viewNameProduct: { flex: 3, marginHorizontal: 10, flexDirection: "column", justifyContent: "space-between", padding: 0 },
    textOrder: { fontWeight: "bold", color: "gray", textTransform: "uppercase" },
    viewTotalProduct: { flexDirection: "column", justifyContent: "space-between", padding: 0 },
    syncData: { flexDirection: "row", padding: 10, justifyContent: "space-between" },
    textButton: { color: colors.colorLightBlue, fontWeight: "bold" },
    imageProduct: { width: 50, height: 50, borderColor: "gray", borderRadius: 25, borderWidth: 0.5 },
    button: { marginTop: 10, width: "100%", height: 50, justifyContent: "center", backgroundColor: "#fff", borderRadius: 5, paddingLeft: 20 },
})