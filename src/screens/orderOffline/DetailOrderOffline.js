import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { TouchableWithoutFeedback, Modal, Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { Snackbar, RadioButton } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString, dateUTCToDate, dateToString } from '../../common/Utils';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';
import { useSelector, useDispatch } from 'react-redux';
import colors from '../../theme/Colors';
import dialogManager from '../../components/dialog/DialogManager';
import { URL, HTTPService } from '../../data/services/HttpService';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import QRCode from 'react-native-qrcode-svg';
import { ApiPath } from '../../data/services/ApiPath';
import dataManager from '../../data/DataManager';
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';
var Sound = require('react-native-sound');
const TYPE_MODAL = { FILTER_ACCOUNT: "FILTER_ACCOUNT", QRCODE: "QRCODE" }

const CASH = {
    Id: 0,
    UUID: -1,
    Name: I18n.t('tien_mat'),
    Value: "",
}

export default (props) => {

    const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [dataOrder, setDataOrder] = useState({});
    const [dataJsonContent, setDataJsonContent] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [vendorSession, setVendorSession] = useState({})
    const [itemMethod, setItemMethod] = useState(CASH);
    const typeModal = useRef();
    const settingObject = useRef();
    const qrCodeRealm = useRef();
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            setVendorSession(JSON.parse(data));
            console.log("setVendorSession ", data);
        }
        getVendorSession()
        getData();
    }, [])

    const getData = async () => {
        console.log("getData props.route.params ", props.route.params);
        setDataOrder(props.route.params.data)
        setDataJsonContent(JSON.parse(props.route.params.data.Orders));
        let JsonContentTmp = JSON.parse(props.route.params.data.Orders)
        let OrderDetails = []
        let products = await realmStore.queryProducts()
        JsonContentTmp.OrderDetails.forEach(element => {
            let productWithId = products.filtered(`Id ==${element.Id}`)
            console.log("getData productWithId ", productWithId);
            productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
            let ProductImages = productWithId.ProductImages ? productWithId.ProductImages : ""
            console.log("getData ProductImages ", ProductImages);
            console.log("getData element ", element);
            element['ProductImages'] = ProductImages;
            OrderDetails.push(element)
        });
        console.log("getData OrderDetails ", JSON.stringify(OrderDetails));
        JsonContentTmp.OrderDetails = OrderDetails;
        console.log("getData JsonContentTmp ", JSON.stringify(JsonContentTmp));
        setDataJsonContent(JsonContentTmp);
    }

    const onRePrint = () => {
        console.log("onRePrint ", props.route.params.data.Orders);
        let jsonContent = dataJsonContent
        jsonContent.PaymentCode = props.route.params.data.Id;
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: false } })
    }

    const onDeleteOrder = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_hoa_don'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                dataManager.deleteRow(SchemaName.ORDERS_OFFLINE, props.route.params.data.Id);
                props.route.params.onCallBack();
                props.navigation.pop()

            }
        })
    }

    const onClickItemOrder = (item) => {

    }

    const renderMethod = (MoreAttributes) => {
        console.log("renderMethod vendorSession ", vendorSession);
        console.log("renderMethod MoreAttributes ", MoreAttributes);
        if (MoreAttributes == undefined) return [I18n.t("tien_mat")];
        let MoreAttributesTmp = {}
        try {
            MoreAttributesTmp = MoreAttributes ? JSON.parse(MoreAttributes) : null;
        } catch (error) {
            console.log(" getMoreAttributes error ", error);
        }
        MoreAttributes = MoreAttributesTmp;
        let listPaymentMethod = [];
        if (MoreAttributes.PaymentMethods && MoreAttributes.PaymentMethods.length > 0 && vendorSession.Accounts && vendorSession.Accounts.length > 0) {
            [{ Id: 0, Name: I18n.t("tien_mat") }, ...vendorSession.Accounts].forEach(element => {
                MoreAttributes.PaymentMethods.forEach(elm => {
                    if (element.Id == elm.AccountId) {
                        listPaymentMethod.push(element.Name)
                    }
                })
            });
        }
        return listPaymentMethod.length > 0 ? listPaymentMethod : [I18n.t("tien_mat")]
    }

    const renderFilter = () => {
        return null
    }

    const renderImage = (ProductImages) => {
        if (ProductImages != undefined) {
            let ProductImagesTmp = JSON.parse(ProductImages && typeof (ProductImages) == 'string' ? ProductImages : "[]")
            if (ProductImagesTmp.length > 0) {
                return { uri: ProductImagesTmp[0].ImageURL };
            } else {
                return Images.default_food_image;
            }
        }
        return Images.default_food_image;
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
                <TouchableOpacity style={styles.buttonCreateQR} onPress={() => onRePrint()}>
                    <Image source={Images.printer} style={styles.iconButton} />
                    <Text style={styles.textCreateQR}>{I18n.t('in_lai')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreateQR} onPress={() => onDeleteOrder()}>
                    <Image source={Images.icon_trash} style={styles.iconButton} />
                    <Text style={styles.textCreateQR}>{I18n.t('xoa')}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.rowInfo}>
                        <Text style={[styles.textBoldBlack, { textTransform: "uppercase" }]}>{dataOrder.Id}</Text>
                        <Text style={styles.textOrange}>{(dataJsonContent.PartnerId && dataJsonContent.PartnerId.Id != 0 && dataOrder.ExcessCash < 0) ? I18n.t('ghi_no') : I18n.t('hoan_thanh')}</Text>
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
                        <Text style={styles.textGray}>VAT</Text>
                        <Text style={styles.textBoldRed}>{dataJsonContent && dataJsonContent.VATRates ? dataJsonContent.VATRates : 0}%</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('phuong_thuc_thanh_toan')}</Text>
                        <View style={{ flexDirection: 'column', alignItems: "flex-end" }}>
                            {
                                renderMethod(dataJsonContent.MoreAttributes).map((item, index) => {
                                    return (
                                        <Text key={index} style={{ fontStyle: "italic", color: "gray" }}>{item}</Text>
                                    )
                                })
                            }
                        </View>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('tong_cong')}</Text>
                        <Text style={styles.textBoldBlack}>{dataJsonContent && dataJsonContent.Total ? currencyToString(dataJsonContent.Total) : 0} đ</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.textGray}>{I18n.t('tong_thanh_toan')}</Text>
                        <Text style={styles.textBoldBlue}>{dataJsonContent && (dataJsonContent.AmountReceived && dataJsonContent.PartnerId && dataJsonContent.PartnerId.Id != 0) ? currencyToString(dataJsonContent.AmountReceived) : currencyToString(dataJsonContent.Total)} đ</Text>
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
                                            <Image style={styles.imageProduct}
                                                source={renderImage(item.ProductImages)}
                                            />
                                            <View style={styles.viewNameProduct}>
                                                <Text style={{ textTransform: 'uppercase' }}>{item.Name}</Text>
                                                <Text style={{ marginTop: 10, color: "gray" }}>{currencyToString(item.Price)} x {item.Quantity}{item.IsLargeUnit ? item.LargeUnit ? `/${item.LargeUnit}` : '' : item.Unit ? `/${item.Unit}` : ''}</Text>
                                                {
                                                    item.Description && item.Description != "" ?
                                                        <Text style={{ color: "gray", fontSize: 12, marginTop: 5 }}>{item.Description}</Text>
                                                        : null
                                                }
                                            </View>
                                            <View style={styles.viewTotalProduct}>
                                                <Text style={{ color: "gray" }}></Text>
                                                <Text style={{ fontWeight: "bold", marginTop: 10, color: colors.colorLightBlue, }}>{currencyToString(item.Price * item.Quantity)} đ</Text>
                                                <Text style={{ color: "gray" }}></Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                                : null
                        }
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={styles.viewModal}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            if (typeModal.current != TYPE_MODAL.QRCODE)
                                setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>
                    </TouchableWithoutFeedback>
                    <View style={[styles.viewModalContent]}>
                        <View style={styles.viewContentPopup}>
                            {renderFilter()}
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
        </View >
    );
};


const styles = StyleSheet.create({
    content: { backgroundColor: "#fff", paddingVertical: 5 },
    textOrange: { fontWeight: "bold", color: "orange" },
    textBoldBlack: { fontWeight: "bold" },
    textBoldRed: { fontWeight: "bold", color: "red" },
    textBoldGreen: { fontWeight: "bold", color: "green" },
    textBoldBlue: { fontWeight: "bold", color: "#36a3f7" },
    textGray: { color: "gray" },
    rowInfo: { flexDirection: "row", justifyContent: "space-between", padding: 5, paddingHorizontal: 20 },
    iconButton: { width: 32, height: 32 },
    textCreateQR: { marginTop: 10, textAlign: "center" },
    buttonCreateQR: {
        width: "100%", flex: 1, backgroundColor: "#fff",
        justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 10, marginHorizontal: 5
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
    viewModal: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    viewModalContent: { justifyContent: 'center', alignItems: 'center', },
    viewContentPopup: {
        padding: 0,
        borderRadius: 4, marginHorizontal: 20,
        width: Metrics.screenWidth * 0.8
    },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    },
    textButtonCancel: { textAlign: "center", color: "#000" },
    textButtonOk: { textAlign: "center", color: "#fff" },
    viewButtonOk: { marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingVertical: 10, justifyContent: "flex-end" },
    viewButtonCancel: { flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, alignItems: 'center', justifyContent: "center" },
    viewRadioButton: { flexDirection: "row", alignItems: "center", padding: 3 },
    viewFilter: { backgroundColor: "#fff", padding: 15, maxHeight: Metrics.screenHeight * 0.7, borderRadius: 4 },
    titleFilter: { paddingBottom: 10, fontWeight: "bold", textTransform: "uppercase", color: colors.colorLightBlue, textAlign: "left", width: "100%" },
    buttonAddAcount: { flex: 3, padding: 10, paddingTop: 5, color: colors.colorchinh },
    viewBottomFilter: { justifyContent: "center", flexDirection: "row", paddingTop: 10 },
})