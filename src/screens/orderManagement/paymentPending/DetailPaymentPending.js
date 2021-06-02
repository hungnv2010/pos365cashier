import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { TouchableWithoutFeedback, Modal, Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import { Snackbar, RadioButton } from 'react-native-paper';
import I18n from '../../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { currencyToString, dateUTCToDate, dateToString } from '../../../common/Utils';
import realmStore, { SchemaName } from '../../../data/realm/RealmStore';
import { useSelector, useDispatch } from 'react-redux';
import colors from '../../../theme/Colors';
import dialogManager from '../../../components/dialog/DialogManager';
import { URL, HTTPService } from '../../../data/services/HttpService';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import { Constant } from '../../../common/Constant';
import QRCode from 'react-native-qrcode-svg';
import { ApiPath } from '../../../data/services/ApiPath';
import dataManager from '../../../data/DataManager';
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
    const [dataPaymentPending, setDataPaymentPending] = useState({});
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
            settingObject.current = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (settingObject.current)
                settingObject.current = JSON.parse(settingObject.current)
            console.log("settingObject.current ", settingObject.current);
        }
        getVendorSession()
        getData();
    }, [])

    const getData = async () => {
        console.log("getData props.route.params ", props.route.params);
        setDataPaymentPending(props.route.params.data)
        setDataJsonContent(JSON.parse(props.route.params.data.JsonContent));
        let JsonContentTmp = JSON.parse(props.route.params.data.JsonContent)
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
        if (props.route.params.CreateQR && props.route.params.CreateQR == true) {
            onCreateQr(props.route.params.data.Id);
        }
    }

    const onSelectMethod = (item) => {
        console.log("onSelectMethod ", item, itemMethod);
        setItemMethod({ ...item });
    }

    const onChangeMethod = () => {
        typeModal.current = TYPE_MODAL.FILTER_ACCOUNT
        setShowModal(true)
    }

    const onCreateQr = async (Id = 0) => {
        typeModal.current = TYPE_MODAL.QRCODE
        setShowModal(true)
        if (Id == 0) return;
        qrCodeRealm.current = await realmStore.queryQRCode()
        qrCodeRealm.current.addListener((collection, changes) => {
            if (changes.insertions.length || changes.modifications.length) {
                console.log("onCreateQr handlerQRCode qrCode.addListener collection changes ", collection, changes);
                let QRCodeItem = qrCodeRealm.current.filtered(`Id == '${Id}'`);
                if (QRCodeItem) {
                    QRCodeItem = JSON.parse(JSON.stringify(QRCodeItem))[0];
                    console.log("onCreateQr QRCodeItem ", QRCodeItem);
                    if (QRCodeItem.Status == true) {
                        realmStore.deleteQRCode(Id);
                        qrCodeRealm.current.removeAllListeners()
                        setShowModal(false);
                        props.navigation.pop()
                    }
                }
            }
        })
    }

    const onClickCancelOrder = () => {
        setShowModal(false)
        console.log('onClickCancelOrder dataPaymentPending ', dataPaymentPending);
        let id = dataPaymentPending && dataPaymentPending.Id ? dataPaymentPending.Id : ""
        new HTTPService().setPath(ApiPath.DELETE_ORDER.replace("{orderId}", id)).DELETE()
            .then(result => {
                console.log('onClickCancelOrder result', result);
                if (result) {
                    qrCodeRealm.current.removeAllListeners()
                    realmStore.deleteQRCode(dataPaymentPending.Id);
                    props.navigation.pop()
                }
            }).catch(err => {
                console.log("onClickCancelOrder err ", err);
            })
    }

    const onClickChangeMethod = () => {
        setShowModal(false)
        setTimeout(() => {
            typeModal.current = TYPE_MODAL.FILTER_ACCOUNT
            setShowModal(true)
        }, 200);
        qrCodeRealm.current.removeAllListeners()
    }

    const onClickBackOrder = () => {
        setShowModal(false)
        qrCodeRealm.current.removeAllListeners()
    }

    const onClickItemOrder = (item) => {

    }

    const onClickCancelFilter = () => {
        setShowModal(false)
    }

    const onClickOkFilter = () => {
        console.log("onClickOkFilter ", itemMethod);
        setShowModal(false)
        onClickPay();
    }

    const onClickPay = async () => {
        console.log("onClickPay jsonContent ", dataJsonContent);
        let json = { ...dataJsonContent };
        let MoreAttributes = json.MoreAttributes ? (typeof (json.MoreAttributes) == 'string' ? JSON.parse(json.MoreAttributes) : json.MoreAttributes) : {}
        MoreAttributes.PaymentMethods = [{ AccountId: itemMethod.Id, Value: json.Total }]
        json['MoreAttributes'] = JSON.stringify(MoreAttributes);
        // if (itemMethod.Id && itemMethod.Id > 0)
        json.AccountId = itemMethod.Id;

        let params = {
            QrCodeEnable: vendorSession.Settings.QrCodeEnable,
            MerchantCode: vendorSession.Settings.MerchantCode,
            MerchantName: vendorSession.Settings.MerchantName,
            DontSetTime: true,
            ExcessCashType: 0,
            Order: {},
        };
        let tilteNotification = json.RoomName;
        if (isFNB == false) {
            params.DeliveryBy = null;//by retain
            params.ShippingCost = 0;//by retain
            params.LadingCode = "";//by retain
            tilteNotification = I18n.t('don_hang')
            delete json.Pos;
            delete json.RoomName;
            delete json.RoomId;
        }
        params.Order = json;
        console.log("onClickPay params ", params);
        let net = await NetInfo.fetch();
        if (net.isConnected == true && net.isInternetReachable == true) {
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.ORDERS).POST(params).then(async order => {
                console.log("onClickPay order ", order);
                dialogManager.hiddenLoading()
                if (order) {
                    dataManager.sentNotification(tilteNotification, I18n.t('khach_thanh_toan') + " " + currencyToString(json.Total))
                    realmStore.deleteQRCode(dataPaymentPending.Id);
                    if (settingObject.current.am_bao_thanh_toan == true)
                        playSound()
                    await printAfterPayment(json, order.Code)
                    if (order.ResponseStatus && order.ResponseStatus.Message && order.ResponseStatus.Message != "") {
                        dialogManager.showPopupOneButton(order.ResponseStatus.Message.replace(/<strong>/g, "").replace(/<\/strong>/g, ""))
                    }
                    setTimeout(() => {
                        // if (!isFNB)
                        //     props.route.params.onCallBack(1, json)
                        props.navigation.pop()
                    }, 500);
                } else {
                    onError(json)
                }
            }, err => {
                dialogManager.hiddenLoading()
                console.log("onClickPay err== ", err);
            })
        } else {
            let isCheckStockControlWhenSelling = await dataManager.checkStockControlWhenSelling(json.OrderDetails)
            if (isCheckStockControlWhenSelling) {
                return;
            } else {
                onError(json)
            }
        }
    }

    const onError = (json) => {
        dialogManager.showPopupOneButton(I18n.t("khong_co_ket_noi_internet_don_hang_cua_quy_khach_duoc_luu_vao_offline"))
        if (!isFNB) {
            json["RoomName"] = I18n.t('don_hang');
            json["Pos"] = "A"
        }
        handlerError({ JsonContent: json })
        realmStore.deleteQRCode(dataPaymentPending.Id);
        props.navigation.pop()
    }

    const handlerError = (data) => {
        console.log("handlerError data ", data);
        dialogManager.hiddenLoading()
        let params = {
            Id: "OFFLINEIOS" + Math.floor(Math.random() * 9999999),
            Orders: JSON.stringify(data.JsonContent),
            ExcessCash: data.JsonContent.ExcessCash,
            DontSetTime: 0,
            HostName: URL.link,
            BranchId: vendorSession.CurrentBranchId,
            SyncCount: 0
        }
        console.log("handlerError params ", params);
        dataManager.syncOrdersOffline([params]);
    }

    const printAfterPayment = async (jsonContent, Code) => {
        console.log("printAfterPayment jsonContent 1 ", jsonContent, props.route.params);
        jsonContent.PaymentCode = Code;
        jsonContent.PurchaseDate = moment().utc().format("YYYY-MM-DD[T]HH:mm:ss.SS[Z]");
        console.log("printAfterPayment jsonContent 2 ", jsonContent);
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: false } })
    }

    const playSound = () => {
        Sound.setCategory('Playback');
        const callback = (error, sound) => {
            if (error) {
                console.log('error ' + error.message + " sound " + JSON.stringify(sound));
                return;
            }
            sound.play(() => {
                sound.release();
            });
        };
        const sound = new Sound('file.mp3', Sound.MAIN_BUNDLE, error => callback(error, sound));
    }

    const renderFilter = () => {
        if (typeModal.current == TYPE_MODAL.FILTER_ACCOUNT) {
            let listAccount = vendorSession.Accounts.filter(item => item.Id != Constant.ID_VNPAY_QR)
            return (
                <View style={styles.viewFilter}>
                    <Text style={styles.titleFilter}>{I18n.t('loai_hinh_thanh_toan')}</Text>
                    <ScrollView style={{ maxHeight: Metrics.screenWidth }}>
                        {
                            listAccount && [CASH].concat(listAccount).map((item, index) => {
                                return (
                                    <TouchableOpacity key={index.toString()} onPress={() => onSelectMethod(item)} style={styles.viewRadioButton}>
                                        <RadioButton.Android
                                            status={itemMethod.Id == item.Id ? 'checked' : 'unchecked'}
                                            onPress={() => onSelectMethod(item)}
                                            color={colors.colorchinh}
                                        />
                                        <Text style={{}}>{item.Name}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                    <View style={styles.viewBottomFilter}>
                        <TouchableOpacity style={styles.viewButtonCancel} onPress={onClickCancelFilter}>
                            <Text style={styles.textButtonCancel}>{I18n.t("huy")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.viewButtonOk} onPress={onClickOkFilter}>
                            <Text style={styles.textButtonOk}>{I18n.t("dong_y")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        if (typeModal.current == TYPE_MODAL.QRCODE)
            return (
                <View style={[{ backgroundColor: 'transparent' }, { justifyContent: "center", alignItems: "center" }]}>
                    <Text style={{ padding: 10, color: "#fff", fontSize: 16 }}>{I18n.t('dang_cho_thanh_toan_vui_long_doi')}</Text>
                    <View style={{ justifyContent: "center", alignItems: "center", width: Metrics.screenWidth * 0.8, height: Metrics.screenWidth * 0.8 }}>
                        <Image source={Images.bg_vn_pay_qr} style={{ position: "absolute", width: "100%", height: "100%" }} />
                        <QRCode
                            size={180}
                            value={dataPaymentPending.QRCode}
                        />
                    </View>
                    <View style={[{ marginTop: 20, justifyContent: "center", flexDirection: "row" }]}>
                        <TouchableOpacity style={[styles.viewButtonCancel, { height: 50 }]} onPress={onClickCancelOrder}>
                            <Text style={[styles.textButtonCancel, { textTransform: "uppercase", color: colors.colorchinh, fontWeight: "bold" }]}>{I18n.t("huy_don_hang")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.viewButtonCancel, { backgroundColor: colors.colorchinh, height: 50, marginLeft: 10 }]} onPress={onClickChangeMethod}>
                            <Text style={[styles.textButtonCancel, { textTransform: "uppercase", color: "#fff", fontWeight: "bold" }]}>{I18n.t("doi_phuong_thuc")}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[{ marginTop: 10, justifyContent: "center", flexDirection: "row" }]}>
                        <TouchableOpacity style={[styles.viewButtonCancel, { height: 50 }]} onPress={onClickBackOrder}>
                            <Text style={[styles.textButtonCancel, { textTransform: "uppercase", color: colors.colorchinh, fontWeight: "bold" }]}>{I18n.t("dong")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
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
                <TouchableOpacity style={styles.buttonCreateQR} onPress={() => onCreateQr(dataPaymentPending.Id)}>
                    <Image source={Images.qrcode} style={styles.iconButton} />
                    <Text style={styles.textCreateQR}>{I18n.t('tao_lai_ma_qr')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreateQR} onPress={onChangeMethod}>
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
                        <Text style={styles.textGray}>VAT</Text>
                        <Text style={styles.textBoldRed}>{dataJsonContent && dataJsonContent.VATRates ? dataJsonContent.VATRates : 0}%</Text>
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
                        <Text style={styles.textBoldBlue}>{0} đ</Text>
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