import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Keyboard, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback, NativeModules } from "react-native";
import { Snackbar, Surface, RadioButton } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import { currencyToString, dateToStringFormatUTC } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import Calculator from './calculator';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import PointVoucher from './pointVoucher';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import ToolBarPayment from '../../components/toolbar/ToolbarPayment';
import SearchVoucher from './SearchVoucher';
import { ApiPath } from '../../data/services/ApiPath';
import { HTTPService, URL } from '../../data/services/HttpService';
import dialogManager from '../../components/dialog/DialogManager';
import dataManager from '../../data/DataManager';
import QRCode from 'react-native-qrcode-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import ViewPrint, { TYPE_PRINT } from '../more/ViewPrint';

let timeClickPrevious = 1000;

const TYPE_MODAL = { FILTER_ACCOUNT: "FILTER_ACCOUNT", QRCODE: "QRCODE", DATE: "DATE" }

const CUSTOMER_DEFAULT = { Id: "", Name: I18n.t('khach_le') };

const METHOD = {
    discount: { name: "Discount" },
    vat: { name: "Vat" },
    pay: { name: "Pay" }
}

export default (props) => {

    const CASH = {
        Id: 0,
        MethodId: 0,
        Name: I18n.t('tien_mat'),
        Value: 0,
    }
    const [totalPrice, setTotalPrice] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [choosePoint, setChoosePoint] = useState(0)
    const [percent, setPercent] = useState(false)
    const [percentVAT, setPercentVAT] = useState(false)
    const [point, setPoint] = useState(0)
    const [listMethod, setListMethod] = useState([CASH])
    const [customer, setCustomer] = useState(CUSTOMER_DEFAULT)
    const [textSearch, setTextSearch] = useState("")
    const [listVoucher, setListVoucher] = useState([])
    const [pointUse, setPointUse] = useState(0)
    const [vendorSession, setVendorSession] = useState({})
    const [jsonContent, setJsonContent] = useState({})
    const [showModal, setShowModal] = useState(false);
    const [giveMoneyBack, setGiveMoneyBack] = useState(true);
    const [itemMethod, setItemMethod] = useState(CASH);
    const [sendMethod, setSendMethod] = useState(METHOD.discount)
    const [date, setDate] = useState(new Date());
    const [noteInfo, setNoteInfo] = useState("");
    const [showDateTime, setShowDateTime] = useState(false);
    const [marginModal, setMargin] = useState(0)
    const [dataHtml, setDataHtml] = useState("");
    const provisional = useRef();
    const dateTmp = useRef("")
    const toolBarPaymentRef = useRef();
    const itemAccountRef = useRef();
    const typeModal = useRef();
    const qrCode = useRef();
    const currentServerEvent = useRef();
    const viewPrintRef = useRef();
    const isClick = useRef(false);
    const { Print } = NativeModules;
    let row_key = "";
    let qrCodeRealm = null

    const { deviceType } = useSelector(state => {
        return state.Common
    });

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });

    useEffect(() => {
        const getRoom = async () => {
            row_key = `${props.route.params.RoomId}_${props.route.params.Position}`
            let serverEvents = await realmStore.queryServerEvents()
            currentServerEvent.current = serverEvents.filtered(`RowKey == '${row_key}'`)[0]
            let orderDetails = JSON.parse(currentServerEvent.current.JsonContent).OrderDetails;
            let jsonContentTmp = JSON.parse(currentServerEvent.current.JsonContent)
            console.log("useEffect serverEvent ", currentServerEvent.current);
            setJsonContent(jsonContentTmp)
            let total = getTotalOrder(orderDetails);
            setTotalPrice(total);
            CASH.Value = total;
            setPercentVAT(jsonContentTmp.VATRates ? true : false)
            if (jsonContentTmp.DiscountToView && jsonContentTmp.DiscountToView.toString().indexOf('%') > -1) {
                setPercent(true)
            } else {
                setPercent(false)
            }
            calculatorPrice(jsonContentTmp, total);
        }

        const getVendorSession = async () => {
            provisional.current = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('provisional ', provisional.current);
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            setVendorSession(JSON.parse(data));
        }

        getRoom()
        getVendorSession()

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    useEffect(() => {
        calculatorPrice(jsonContent, totalPrice)
    }, [point])

    useEffect(() => {
        calculatorPrice(jsonContent, totalPrice)
    }, [percent])

    const _keyboardDidShow = () => {
        setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    const getTotalOrder = (orderDetails) => {
        let total = 0;
        if (orderDetails && orderDetails.length > 0) {
            orderDetails.forEach(item => {
                total += item.Price * item.Quantity
            });
        }
        return total;
    }

    const onChangeTextInput = (text, type) => {
        text = text.replace(/,/g, "");
        text = Number(text);
        let json = { ...jsonContent }
        switch (type) {
            case 2:
                json['VATRates'] = text;
                calculatorPrice(json, totalPrice)
                break;
            case 1:
                if (!percent) {
                    json['DiscountValue'] = text;
                } else {
                    json['DiscountRatio'] = text;
                }
                calculatorPrice(json, totalPrice)
                break;
            default:
                break;
        }
    }

    const addAccount = () => {
        let newDate = new Date().getTime();
        if (timeClickPrevious + 500 < newDate) {
            let list = listMethod;
            list.push({ ...CASH, Id: timeClickPrevious, MethodId: 0, Value: list.length > 0 ? 0 : totalPrice })
            setListMethod([...list])
            timeClickPrevious = newDate;
        }
    }

    const deleteMethod = (item) => {
        let total = listMethod.reduce(getSumValue, 0);
        setListMethod([...listMethod.filter(el => el.Id != item.Id)])
        let json = jsonContent;
        json.ExcessCash = total - item.Value - jsonContent.Total;
        setJsonContent(json)
    }

    const onCallBack = (data) => {
        console.log("onCallBack data ", data);
        setListVoucher(data.listVoucher)
        setPointUse(data.pointUse)
        setPoint((data.rewardPoints + data.sumVoucher))
    }

    const onCallBackCustomer = (data) => {
        console.log("onCallBackCustomer data ", data);
        setCustomer(data);
    }

    const addCustomer = () => {
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBackCustomer })
    }

    const onClickSearch = () => {
        toolBarPaymentRef.current.setStatusSearch(true)
        setTextSearch('');
        setChoosePoint(2)
    }

    const sumVoucher = (listVoucher) => {
        console.log("sumVoucher ", listVoucher);
        let total = 0;
        listVoucher.forEach(it => {
            if (it.IsPercent)
                total += jsonContent.Total / 100 * it.Value
            else
                total += it.Value
        })
        return total;
    }

    const callBackSearch = (data) => {
        console.log('callBackSearch === ', data);
        toolBarPaymentRef.current.setStatusSearch(false)
        if (listVoucher.length > 0) {
            let filterList = listVoucher.filter(item => item.Id == data.Id)
            if (filterList.length == 0) {
                let list = listVoucher;
                list.push(data)
                setListVoucher([...list])
                setPoint(sumVoucher([list]))
            }
        } else {
            setListVoucher([data])
            setPoint(sumVoucher([data]))
        }
        toolBarPaymentRef.current.setStatusSearch(false)
        setChoosePoint(1)
    }

    const deleteVoucher = (list) => {
        setPoint(sumVoucher(list))
    }

    const onChangePointUse = (point) => {
        console.log("onChangePointUse point ", point);
        setPointUse(point)
        let total = vendorSession.Settings && vendorSession.Settings.PointToValue ? vendorSession.Settings.PointToValue * (point != "" ? +point : 0) : 0
        setPoint(sumVoucher(listVoucher) + total);
    }

    const onClickNote = () => {
        console.log("onClickNote dateTmp.current ", dateTmp.current);
        if (dateTmp.current == "") {
            setDate(new Date())
        }
        typeModal.current = TYPE_MODAL.DATE
        setShowModal(true)
    }

    const onClickShowListMethod = (item) => {
        console.log("onClickShowListMethod ", item);
        itemAccountRef.current = item;
        setItemMethod(item)
        typeModal.current = TYPE_MODAL.FILTER_ACCOUNT
        setShowModal(true)
    }

    const onClickCancelFilter = () => {
        setShowModal(false)
    }

    const onClickOkFilter = () => {
        console.log("onClickOkFilter ", listMethod);
        setShowModal(false)
        let list = [];
        listMethod.forEach(element => {
            if (itemAccountRef.current.Id == element.Id) {
                list.push({ ...itemMethod, Value: element.Value })
            } else
                list.push(element)
        });
        setListMethod([...list])
    }

    const onSelectMethod = (item) => {
        console.log("onSelectMethod ", item, itemMethod);
        setItemMethod({ ...item, MethodId: item.Id });
    }

    const getSumValue = (total, num) => {
        return total + Math.round(num.Value);
    }

    const setListVoucherTemp = (item, value) => {
        listMethod.forEach(element => {
            if (item.Id == element.Id) {
                element.Value = value
            }
        });
        setListMethod([...listMethod])
    }

    const checkExcessCash = (item) => {
        let total = listMethod.reduce(getSumValue, 0);
        if (total < jsonContent.Total) {
            setListVoucherTemp(item, jsonContent.Total - total + item.Value)
            jsonContent.ExcessCash = 0;
            setJsonContent(jsonContent)
        }
    }

    const onChangeTextPaymentPaid = (text, item, index = 0) => {

        let amountReceived = 0;

        listMethod.forEach((element, indexArr) => {
            if (indexArr != 0 && index != indexArr) {
                amountReceived += element.Value
            }
        });

        let json = jsonContent;
        let total = 0;
        text = text.replace(/,/g, "");
        text = Number(text);
        console.log("onChangeTextPaymentPaid text== ", text);
        console.log("onChangeTextPaymentPaid json.Total==, amountReceived ", json.Total, amountReceived);
        if (index != 0) {
            if (amountReceived == 0) {
                if (text > json.Total) {
                    text = json.Total
                }
            } else {
                if (json.Total - amountReceived > 0) {
                    if (text > json.Total - amountReceived) {
                        text = json.Total - amountReceived;
                    }
                }
                else {
                    text = 0
                }
            }
        }

        listMethod.forEach(element => {
            if (item.Id == element.Id) {
                element.Value = text
                total += text;
            } else {
                total += element.Value;
            }
        });
        setListMethod([...listMethod])

        json.ExcessCash = total - jsonContent.Total;
        setJsonContent(json)
    }

    const setValuePercent = (value) => {
        setPercentVAT(value == 0 ? false : true)
    }

    const onSelectExcess = (type) => {
        if (type) {
            let total = listMethod.reduce(getSumValue, 0);
            console.log("onSelectExcess total jsonContent.Total ", total, jsonContent.Total);
            let json = jsonContent;
            json.ExcessCash = total - json.Total;
            console.log("onSelectExcess json ", json)
            setJsonContent({ ...json })
        } else {
            jsonContent.ExcessCash = 0;
            setJsonContent(jsonContent)
        }
        setGiveMoneyBack(type)
    }

    const selectVoucher = () => {
        if (deviceType == Constant.TABLET) {
            toolBarPaymentRef.current.setStatusSearch(false)
            setChoosePoint(1)
        }
        else {
            props.navigation.navigate(ScreenList.PointVoucher, { _onSelect: onCallBack, customer: customer, grandTotal: totalPrice, listVoucher: listVoucher, pointUse: pointUse })
        }
    }

    const selectVAT = (value) => {
        setValuePercent(value)
        let json = { ...jsonContent }
        json['VATRates'] = value;
        calculatorPrice(json, totalPrice)
    }

    const selectPercent = (value) => {
        setPercent(value)
    }

    const onClickProvisional = async () => {
        console.log("onClickProvisional props.route.params ", props.route.params);
        let newDate = new Date().getTime();
        if (timeClickPrevious + 2000 < newDate) {
            if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
                jsonContent.RoomName = props.route.params.Name
            }
            // viewPrintRef.current.printProvisionalRef(jsonContent)
            viewPrintRef.current.printKitchenRef(jsonContent)
            timeClickPrevious = newDate;
        }
    }

    const checkQRInListMethod = () => {
        let check = false;
        listMethod.forEach(element => {
            if (element.Id == Constant.ID_VNPAY_QR) {
                check = true;
            }
        });
        return (check && listMethod.length > 1) ? true : false;
    }

    const onClickPay = () => {
        if (checkQRInListMethod()) {
            setToastDescription(I18n.t("khong_ho_tro_nhieu_tai_khoan_cho_qr"))
            setShowToast(true)
            return;
        }
        let json = { ...jsonContent }
        let amountReceived = listMethod.reduce(getSumValue, 0);
        let paramMethod = []
        listMethod.forEach((element, index) => {
            let value = element.Value
            if (index == 0 && giveMoneyBack && amountReceived > json.Total) {
                value = (amountReceived - value) > json.Total ? 0 : json.Total - (amountReceived - value)
            }
            paramMethod.push({ AccountId: element.Id, Value: value })
        });
        let MoreAttributes = json.MoreAttributes ? JSON.parse(json.MoreAttributes) : {}
        MoreAttributes.PointDiscount = 0;
        MoreAttributes.PointDiscountValue = 0;
        MoreAttributes.TemporaryPrints = [];
        MoreAttributes.Vouchers = listVoucher;
        MoreAttributes.PaymentMethods = paramMethod
        if (customer && customer.Id) {
            let debt = customer.Debt ? customer.Debt : 0;
            MoreAttributes.OldDebt = debt
            if (!giveMoneyBack)
                MoreAttributes.NewDebt = debt - (amountReceived - json.Total);
            else
                MoreAttributes.NewDebt = debt
            json.Partner = customer
            json.PartnerId = customer.Id
            json.ExcessCashType = giveMoneyBack ? "0" : "1"
        }
        json['MoreAttributes'] = JSON.stringify(MoreAttributes);
        json.TotalPayment = giveMoneyBack ? json.Total : amountReceived
        json.VATRates = json.VATRates
        json.AmountReceived = amountReceived
        if (noteInfo != '') {
            json.Description = noteInfo;
        }
        if (date && dateTmp.current) {
            json.PurchaseDate = "" + date;
        }
        if (listMethod.length > 0)
            json.AccountId = listMethod[0].Id;
        let params = {
            QrCodeEnable: vendorSession.Settings.QrCodeEnable,
            MerchantCode: vendorSession.Settings.MerchantCode,
            MerchantName: vendorSession.Settings.MerchantName,
            DontSetTime: true,
            ExcessCashType: 0,
            Order: json,
        };
        console.log("onClickPay params ", params);
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.ORDERS).POST(params).then(order => {
            console.log("onClickPay order ", order);
            if (order) {
                let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current));
                dataManager.paymentSetServerEvent(serverEvent, {});
                dataManager.subjectUpdateServerEvent.next(serverEvent)
                dataManager.sentNotification(jsonContent.RoomName, I18n.t('khach_thanh_toan') + " " + currencyToString(jsonContent.Total))
                dialogManager.hiddenLoading()
                if (order.QRCode != "") {
                    qrCode.current = order.QRCode
                    typeModal.current = TYPE_MODAL.QRCODE
                    setShowModal(true)
                    handlerQRCode(order)
                } else
                    props.navigation.pop()
            } else {
                alert("err")
                handlerError({ JsonContent: json, RowKey: row_key })
            }
        }).catch(err => {
            console.log("onClickPay err ", err);
            handlerError({ JsonContent: json, RowKey: row_key })
        });
    }

    const handlerQRCode = async (order) => {
        let params = {
            Id: order.Id,
            JsonContent: JSON.stringify(data.JsonContent),
            Messenger: order.Messenger,
            Status: 0,
            HostName: URL.link,
            BranchId: vendorSession.CurrentBranchId,
            Code: order.Code,
            QRCode: order.QRCode
        }
        console.log("handlerQRCode params ", params);
        dataManager.syncQRCode([params]);

        qrCodeRealm = await realmStore.queryQRCode()
        qrCodeRealm.addListener((collection, changes) => {
            if (changes.insertions.length || changes.modifications.length) {
                console.log("handlerQRCode qrCode.addListener collection changes ", collection, changes);
            }
        })
    }

    const handlerError = (data) => {
        console.log("handlerError data ", data);
        let params = {
            Id: "OFFLINE" + Math.floor(Math.random() * 9999999),
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

    const amountReceived = () => {
        return listMethod.reduce(getSumValue, 0);
    }

    const outputResult = (value) => {
        console.log("outputResult value ", value);
        if (sendMethod == METHOD.discount) {
            onChangeTextInput(currencyToString(value), 1)
        } else if (sendMethod == METHOD.vat) {
            onChangeTextInput(currencyToString(value), 2)
        } else {
            onChangeTextPaymentPaid(currencyToString(value), sendMethod)
        }
    }

    const onTouchInput = (value) => {
        console.log("onTouchInput value ", value);
        setChoosePoint(0);
        setSendMethod(value)
        if (value.name == METHOD.pay.name) {
            listMethod.forEach(element => {
                if (value.Id == element.Id) {
                    element.Value = 0;
                    onChangeTextPaymentPaid("0", element)
                }
            });
        } else {
            onChangeTextInput("0", value == METHOD.vat ? 2 : 1)
        }
    }

    const calculatorPrice = (jsonContent, totalPrice) => {
        let realPriceValue = totalPrice;
        let disCountValue = 0;
        if (!percent) {
            disCountValue = jsonContent.DiscountValue ? jsonContent.DiscountValue : 0;
        } else {
            disCountValue = realPriceValue / 100 * jsonContent.DiscountRatio
        }
        let MoreAttributes = jsonContent.MoreAttributes ? JSON.parse(jsonContent.MoreAttributes) : {};
        let totalDiscount = parseFloat(disCountValue) + (MoreAttributes.PointDiscountValue ? parseFloat(MoreAttributes.PointDiscountValue) : 0) + (point);
        totalDiscount = (totalDiscount >= realPriceValue) ? realPriceValue : totalDiscount;
        let notVat = (realPriceValue - totalDiscount + (jsonContent.SafeShippingCost ? jsonContent.SafeShippingCost : 0))
        let vat = notVat / 100 * parseFloat(jsonContent.VATRates ? jsonContent.VATRates : 0);
        let total = notVat + vat
        if (total < 0) total = 0.0
        let excess = amountReceived() - total
        let excessCash = (excess < 0.0 && excess > -0.001) ? 0 : excess;
        jsonContent.Discount = totalDiscount
        jsonContent.DiscountValue = disCountValue
        jsonContent.Vat = vat
        jsonContent.Total = total
        jsonContent.ExcessCash = excessCash
        if (listMethod.length == 1) {
            listMethod.forEach(element => {
                element.Value = total;
            });
            setListMethod([...listMethod])
            jsonContent.ExcessCash = 0
        }
        setJsonContent({ ...jsonContent })
        console.log("calculator percent ", percent);
        console.log("calculator jsonContent.DiscountValue ", jsonContent.DiscountValue);
        console.log("calculator realPriceValue ", realPriceValue);
        console.log("calculator disCountValue ", disCountValue);
        console.log("calculator totalDiscount ", totalDiscount);
        console.log("calculator totalDiscount ==  ", totalDiscount);
        console.log("calculator notVat ", notVat);
        console.log("calculator VATRates ", jsonContent.VATRates);
        console.log("calculator vat ", vat);
        console.log("calculator totalPrice== ", total);
        console.log("calculator excess ", excess);
        console.log("calculator excessCash ", excessCash);
        console.log("calculator total ", total);
    }

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        console.log("onChange Date ", currentDate);
        dateTmp.current = currentDate;
    };

    const onChangeTextNote = (text) => {
        setNoteInfo(text)
    }

    const onSelectDateTime = () => {
        setDate(dateTmp.current)
        setShowDateTime(false)
    }

    const onShowDateTime = (status) => {
        setShowDateTime(status)
    }

    const onClickOkAddInfo = () => {
        console.log("onClickOkAddInfo date noteInfo ", date, noteInfo);
        setShowModal(false)
    }

    const renderFilter = () => {
        if (typeModal.current == TYPE_MODAL.FILTER_ACCOUNT) {
            let listAccount = vendorSession.Accounts.filter(item=>item.Id != Constant.ID_VNPAY_QR)
            return (
                <View style={styles.viewFilter}>
                    <Text style={styles.titleFilter}>{I18n.t('loai_hinh_thanh_toan')}</Text>
                    <ScrollView style={{ maxHeight: Metrics.screenWidth }}>
                        {
                            listAccount && [CASH].concat(listAccount).map((item, index) => {
                                return (
                                    <TouchableOpacity key={index.toString()} onPress={() => onSelectMethod(item)} style={styles.viewRadioButton}>
                                        <RadioButton.Android
                                            status={itemMethod.MethodId == item.Id ? 'checked' : 'unchecked'}
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
                <View style={[styles.viewFilter, { justifyContent: "center", alignItems: "center" }]}>
                    <QRCode
                        size={250}
                        value={qrCode.current}
                    />
                    <View style={[styles.viewBottomFilter, { marginTop: 20 }]}>
                        <TouchableOpacity style={styles.viewButtonCancel} onPress={onClickCancelFilter}>
                            <Text style={styles.textButtonCancel}>{I18n.t("huy")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        if (typeModal.current == TYPE_MODAL.DATE) {
            if (showDateTime)
                return (
                    <View>
                        <DateTimePicker
                            value={date}
                            mode={'date'}
                            display="default"
                            locale="vi-VN"
                            onChange={onChange}
                        />
                        <View style={styles.line}></View>
                        <DateTimePicker
                            value={date}
                            mode={'time'}
                            display="default"
                            locale="vi-VN"
                            onChange={onChange}
                        />
                        <View style={[styles.viewBottomFilter, { padding: 7, paddingTop: 0 }]}>
                            <TouchableOpacity style={styles.viewButtonCancel} onPress={() => onShowDateTime(false)}>
                                <Text style={styles.textButtonCancel}>{I18n.t("huy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.viewButtonOk} onPress={() => onSelectDateTime()}>
                                <Text style={styles.textButtonOk}>{I18n.t("dong_y")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View >)
            else
                return (
                    <View style={[styles.viewFilter, { justifyContent: "center", alignItems: "center" }]}>
                        <Text style={styles.titleFilter}>{I18n.t('thong_tin_them')}</Text>
                        <View style={styles.viewDateTime}>
                            <Text style={styles.textInfo}>{I18n.t('thoi_gian')}</Text>
                            <TouchableOpacity onPress={() => onShowDateTime(true)} style={styles.inputDateTime}>
                                <TextInput
                                    editable={false}
                                    onTouchStart={() => onShowDateTime(true)}
                                    value={"" + dateToStringFormatUTC(date)}
                                    style={{ padding: 6, flex: 1 }} />
                                <Fontisto style={{ marginTop: -2 }} name="date" size={20} color={colors.colorchinh} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.viewNote}>
                            <Text style={styles.textInfo}>{I18n.t('ghi_chu')}</Text>
                            <TextInput
                                value={noteInfo}
                                onChangeText={onChangeTextNote}
                                multiline
                                style={styles.inputNote} />
                        </View>
                        <View style={styles.viewBottomFilter}>
                            <TouchableOpacity style={styles.viewButtonCancel} onPress={() => setShowModal(false)}>
                                <Text style={styles.textButtonCancel}>{I18n.t("huy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.viewButtonOk} onPress={onClickOkAddInfo}>
                                <Text style={styles.textButtonOk}>{I18n.t("dong_y")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
        }
    }

    const renderListMethod = () => {
        return listMethod.map((item, index) => {
            return (
                <View key={index.toString()} style={styles.viewListMethod}>
                    {
                        index != 0 ?
                            <TouchableOpacity onPress={() => deleteMethod(item)} style={styles.viewIconCloseMethod}>
                                <Icon name="close" size={24} color={colors.colorchinh} style={styles.iconCloseMethod} />
                            </TouchableOpacity>
                            :
                            <View style={styles.viewIconEmpty}>
                            </View>
                    }
                    <TouchableOpacity onPress={() => onClickShowListMethod(item)} style={styles.viewNameMethod}>
                        <Text style={styles.textNameMethod}>{item.Name}</Text>
                        <Image source={Images.arrow_down} style={styles.iconArrowDown} />
                    </TouchableOpacity>
                    <View style={styles.viewCalculatorMethod}>
                        <TouchableOpacity onPress={() => checkExcessCash(item)} style={styles.buttonCaculatorMothod}>
                            <Fontisto name="calculator" size={20} color={colors.colorchinh} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        keyboardType="number-pad"
                        value={"" + currencyToString(item.Value)}
                        onTouchStart={() => onTouchInput({ ...item, ...METHOD.pay })}
                        editable={deviceType == Constant.TABLET ? false : true}
                        onChangeText={(text) => onChangeTextPaymentPaid(text, item, index)}
                        style={[styles.inputListMethod, { borderColor: sendMethod.Id == item.Id ? colors.colorchinh : "gray" }]} />
                </View>
            )
        })
    }

    const renderTablet = () => {
        if (deviceType == Constant.TABLET) {
            if (choosePoint == 0) {
                return <Calculator
                    method={sendMethod}
                    outputResult={outputResult} />
            } else if (choosePoint == 1) {
                return <PointVoucher
                    grandTotal={totalPrice}
                    customer={customer}
                    listVoucher={listVoucher}
                    pointUse={pointUse}
                    onChangePointUse={(point) => onChangePointUse(point)}
                    deleteVoucher={(list) => deleteVoucher(list)}
                    onClickSearch={() => onClickSearch()} />
            } else {
                return <SearchVoucher
                    listVoucher={listVoucher}
                    text={textSearch}
                    callBackSearch={(item) => {
                        callBackSearch(item)
                    }}
                />
            }
        }
    }

    return (
        <View style={styles.conatiner}>
            <ViewPrint
                ref={viewPrintRef}
                html={dataHtml}
            />
            <ToolBarPayment
                ref={toolBarPaymentRef}
                {...props}
                clickRightIcon={(data) => { setTextSearch(data); }}
                onClickBackSearch={() => { setChoosePoint(1) }}
                clickNote={onClickNote}
                title={I18n.t('thanh_toan')} />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <KeyboardAwareScrollView style={{ flexGrow: 1 }}>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('khach_hang')}</Text>
                                <TouchableOpacity onPress={addCustomer} style={{ flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 7, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 }}>
                                    <Text style={{ marginLeft: 5 }}>{customer.Name}</Text>
                                    <Image source={Images.arrow_down} style={styles.iconArrowDown} />
                                </TouchableOpacity>
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={{ borderColor: colors.colorchinh, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 5, borderWidth: 0.5 }}>{jsonContent.OrderDetails ? jsonContent.OrderDetails.length : 0}</Text>
                                <Text style={{ flex: 5.3, textAlign: "right" }}>{currencyToString(totalPrice)}</Text>
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 2 }}>{I18n.t('tong_chiet_khau')}</Text>
                                <Text style={{ flex: 3, textAlign: "right" }}>{currencyToString(jsonContent.Discount)}</Text>
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 3 }}>{I18n.t('chiet_khau')}</Text>
                                <View style={{ flexDirection: "row", flex: 3, marginLeft: 5 }}>
                                    <TouchableOpacity onPress={() => selectPercent(false)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percent ? colors.colorchinh : "#fff" }}>
                                        <Text style={{ color: !percent ? "#fff" : "#000" }}>VNĐ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => selectPercent(true)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percent ? "#fff" : colors.colorchinh }}>
                                        <Text style={{ color: percent ? "#fff" : "#000" }}>%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={"" + currencyToString(!percent ? jsonContent.DiscountValue : jsonContent.DiscountRatio)}
                                    onTouchStart={() => onTouchInput(METHOD.discount)}
                                    editable={deviceType == Constant.TABLET ? false : true}
                                    onChangeText={(text) => onChangeTextInput(text, 1)}
                                    style={{ borderColor: sendMethod == METHOD.discount ? colors.colorchinh : "gray", textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('diem_voucher')}</Text>
                                <View style={{ flexDirection: "row", flex: 3 }}>
                                    <TouchableOpacity onPress={selectVoucher}
                                        style={{ width: 110, borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 7, backgroundColor: colors.colorchinh }}>
                                        <Text style={{ color: "#fff", textAlign: "center", textTransform: "uppercase" }}>{I18n.t('chon')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ textAlign: "right", marginLeft: 10, flex: 3, padding: 6.8, paddingRight: 0 }}>{currencyToString(point)}</Text>
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>VAT</Text>
                                <View style={{ flexDirection: "row", flex: 3, marginLeft: 5 }}>
                                    <TouchableOpacity onPress={() => selectVAT(0)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percentVAT ? colors.colorchinh : "#fff" }}>
                                        <Text style={{ color: !percentVAT ? "#fff" : "#000" }}>0%</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => selectVAT(vendorSession.Settings && vendorSession.Settings.VAT ? vendorSession.Settings.VAT : 0)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percentVAT ? "#fff" : colors.colorchinh }}>
                                        <Text style={{ color: percentVAT ? "#fff" : "#000" }}>{vendorSession.Settings && vendorSession.Settings.VAT ? vendorSession.Settings.VAT : 0}%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={"" + currencyToString(jsonContent.VATRates)}
                                    onTouchStart={() => onTouchInput(METHOD.vat)}
                                    editable={deviceType == Constant.TABLET ? false : true}
                                    onChangeText={(text) => onChangeTextInput(text, 2)}
                                    style={{ borderColor: sendMethod == METHOD.vat ? colors.colorchinh : "gray", textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <View style={{ flex: 3, flexDirection: "row", alignItems: "center", }}>
                                    <IconFeather name="credit-card" size={20} color={colors.colorchinh} />
                                    <Text style={{ fontWeight: "bold", color: colors.colorchinh, marginLeft: 10 }}>{I18n.t('khach_phai_tra')}</Text>
                                </View>
                                <View style={{ flex: 3 }}></View>
                                <Text style={{ flex: 3, textAlign: "right", fontWeight: "bold" }}>{currencyToString(jsonContent.Total)}</Text>

                            </View>
                            <View style={{ backgroundColor: "#fff", flexDirection: "column", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 3, padding: 10, paddingBottom: 0 }}>{I18n.t('tien_khach_tra')}</Text>
                                {
                                    renderListMethod()
                                }
                                <TouchableOpacity onPress={() => addAccount()}>
                                    <Text style={styles.buttonAddAcount}>+ {I18n.t('them_tai_khoan_moi')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.viewTextExcessCash}>
                                <Text style={{ flex: 2 }}>{I18n.t('tien_thua')}</Text>
                                <Text style={{ flex: 4, textAlign: "right", color: jsonContent.ExcessCash > 0 ? "green" : "red" }}>{currencyToString(jsonContent.ExcessCash)}</Text>
                            </View>
                            {
                                (jsonContent.ExcessCash >= 0 && (customer && customer.Id && customer.Id != "")) ?
                                    <View style={styles.viewExcessCash}>
                                        <TouchableOpacity onPress={() => onSelectExcess(true)} style={styles.viewRadioButton}>
                                            <RadioButton.Android
                                                status={giveMoneyBack ? 'checked' : 'unchecked'}
                                                onPress={() => onSelectExcess(true)}
                                                color={colors.colorchinh}
                                            />
                                            <Text style={{ marginLeft: 0 }}>{I18n.t('tra_lai_tien')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onSelectExcess(false)} style={styles.viewRadioButton}>
                                            <RadioButton.Android
                                                status={!giveMoneyBack ? 'checked' : 'unchecked'}
                                                onPress={() => onSelectExcess(false)}
                                                color={colors.colorchinh}
                                            />
                                            <Text style={{ marginLeft: 0 }}>{I18n.t('cong_vao_khoan_no')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    null
                            }
                        </Surface>
                    </KeyboardAwareScrollView>
                    <View style={styles.viewBottom}>
                        <TouchableOpacity onPress={onClickProvisional} style={styles.viewPrint}>
                            <Text style={styles.textBottom}>{I18n.t('tam_tinh')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClickPay} style={styles.viewButtomPayment}>
                            <Text style={styles.textBottom}>{I18n.t('thanh_toan')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    renderTablet()
                }
            </View>
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
                            setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>
                    </TouchableWithoutFeedback>
                    <View style={[styles.viewModalContent, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]}>
                        <View style={styles.viewContentPopup}>
                            {renderFilter()}
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
        </View >
    );
}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    },
    viewModal: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    viewModalContent: { justifyContent: 'center', alignItems: 'center', },
    viewContentPopup: {
        padding: 0,
        backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
        width: Metrics.screenWidth * 0.8
    },
    inputDateTime: { flexDirection: "row", alignItems: "center", paddingRight: 5, width: "70%", backgroundColor: "#eeeeee", marginLeft: 0, borderWidth: 0.5, borderRadius: 5, },
    viewDateTime: { width: "100%", flexDirection: "row", marginTop: 10 },
    viewNote: { width: "100%", flexDirection: "row", marginVertical: 10 },
    textInfo: { width: "30%", paddingVertical: 7 },
    line: { width: "100%", height: 1, backgroundColor: "#eeeeee" },
    inputNote: { width: "70%", height: 70, backgroundColor: "#eeeeee", marginLeft: 0, borderWidth: 0.5, borderRadius: 5, padding: 6 },
    inputListMethod: { textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 0, flex: 3, borderWidth: 0.5, borderRadius: 5, padding: 6.8 },
    buttonCaculatorMothod: { width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh },
    viewCalculatorMethod: { flex: 3, justifyContent: "center", alignItems: "center", },
    iconArrowDown: { width: 14, height: 14, marginHorizontal: 10 },
    textNameMethod: { marginLeft: 5 },
    viewNameMethod: { flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 7, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 },
    viewIconEmpty: { width: 32, height: 32 },
    iconCloseMethod: { marginTop: 3, alignContent: "center" },
    viewIconCloseMethod: { width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh },
    viewListMethod: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", },
    viewPrint: { flex: 1, alignItems: "center", backgroundColor: colors.colorLightBlue, paddingVertical: 15 },
    textBottom: { color: "#fff", textTransform: "uppercase", fontWeight: "bold" },
    viewButtomPayment: { borderLeftWidth: 2, borderLeftColor: "#fff", flex: 1, alignItems: "center", backgroundColor: colors.colorLightBlue, paddingVertical: 15 },
    viewBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    viewExcessCash: { flexDirection: "row", justifyContent: "flex-end", marginRight: 10 },
    viewRadioButton: { flexDirection: "row", alignItems: "center" },
    viewFilter: { backgroundColor: "#fff", padding: 15, },
    titleFilter: { paddingBottom: 10, fontWeight: "bold", textTransform: "uppercase", color: colors.colorLightBlue, textAlign: "left", width: "100%" },
    buttonAddAcount: { flex: 3, padding: 10, paddingTop: 5, color: colors.colorchinh },
    viewBottomFilter: { justifyContent: "center", flexDirection: "row", paddingTop: 10 },
    textButtonCancel: { textAlign: "center", color: "#000" },
    textButtonOk: { textAlign: "center", color: "#fff" },
    viewButtonOk: { marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" },
    viewButtonCancel: { flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" },
    viewTextExcessCash: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" },
    logoImage: { width: Metrics.screenWidth * 2 / 3, height: Metrics.screenWidth * 2 / 3 }
})