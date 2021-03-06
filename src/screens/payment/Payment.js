import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Keyboard, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback, NativeModules } from "react-native";
import { Snackbar, Surface, RadioButton } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import { currencyToString, dateToStringFormatUTC, randomUUID } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import Calculator from './calculator';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import PointVoucher from './pointVoucher';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Fontisto from 'react-native-vector-icons/Fontisto';
import ToolBarPayment from '../../components/toolbar/ToolbarPayment';
import SearchVoucher from './SearchVoucher';
import { ApiPath } from '../../data/services/ApiPath';
import { HTTPService, URL } from '../../data/services/HttpService';
import dialogManager from '../../components/dialog/DialogManager';
import dataManager from '../../data/DataManager';
import QRCode from 'react-native-qrcode-svg';
import ViewPrint, { TYPE_PRINT } from '../more/ViewPrint';
import DatePicker from 'react-native-date-picker';
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';
import { Subject } from 'rxjs';
import { handerDataPrintTemp } from '../tempPrint/ServicePrintTemp';
const { Print } = NativeModules;
var Sound = require('react-native-sound');
let timeClickPrevious = 1000;

const TYPE_MODAL = { FILTER_ACCOUNT: "FILTER_ACCOUNT", QRCODE: "QRCODE", DATE: "DATE" }

const CUSTOMER_DEFAULT = { Id: 0, Name: 'khach_le' };

const METHOD = {
    discount: { name: 'chiet_khau' },
    vat: { name: "vat" },
    pay: { name: 'tien_khach_tra' }
}

export default (props) => {

    const CASH = {
        Id: 0,
        UUID: randomUUID(),
        Name: I18n.t('tien_mat'),
        Value: "",
    }
    const dispatch = useDispatch();
    const [totalPrice, setTotalPrice] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [isShowDetailCustomer, setIsShowDetailCustomer] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [choosePoint, setChoosePoint] = useState(0)
    const [percent, setPercent] = useState(true)
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
    const [sendMethod, setSendMethod] = useState({ ...CASH, ...METHOD.pay })
    const [date, setDate] = useState(new Date());
    const [noteInfo, setNoteInfo] = useState("");
    const [showDateTime, setShowDateTime] = useState(false);
    const [marginModal, setMargin] = useState(0)
    const [detailCustomer, setDetailCustomer] = useState("");
    const [selection, setSelection] = useState({
        start: 0,
        end: 0
    })
    const [inputDiscount, setInputDiscount] = useState("");
    const [inputVAT, setInputVAT] = useState("");
    const provisional = useRef();
    const dateTmp = useRef(new Date())
    const toolBarPaymentRef = useRef();
    const itemAccountRef = useRef();
    const typeModal = useRef();
    const qrCode = useRef();
    const currentServerEvent = useRef();
    const viewPrintRef = useRef();
    const settingObject = useRef();
    const resPayment = useRef({});
    const jsonContentPayment = useRef({});
    const changeMethodQRPay = useRef(false);
    const indexPayment = useRef(0);
    const imageQr = useRef(0);
    const percentRef = useRef()
    const debounceTimeInput = useRef(new Subject());
    const qrCodeRealm = useRef()
    const [listSuggestions, setListSuggestions] = useState([])
    let row_key = "";

    const { deviceType, isFNB } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        const getRoom = async () => {
            row_key = `${props.route.params.RoomId}_${props.route.params.Position}`
            let serverEvents = await realmStore.queryServerEvents()
            currentServerEvent.current = serverEvents.filtered(`RowKey == '${row_key}'`)[0]
            let orderDetails = JSON.parse(currentServerEvent.current.JsonContent).OrderDetails;
            let jsonContentTmp = JSON.parse(currentServerEvent.current.JsonContent)
            console.log("useEffect serverEvent ", currentServerEvent.current);
            console.log("useEffect jsonContentTmp ", jsonContentTmp);
            jsonContentTmp.ExcessCash = 0;
            if (jsonContentTmp.Partner && jsonContentTmp.Partner.Id) {
                setCustomer(jsonContentTmp.Partner)
            }
            setJsonContent(jsonContentTmp)
            setListSuggestions(listSuggestTotal(jsonContentTmp.Total))
            let total = getTotalOrder(orderDetails);
            setTotalPrice(total);
            CASH.Value = jsonContentTmp.Total;
            setPercentVAT(jsonContentTmp.VATRates && jsonContentTmp.VATRates < 100 ? true : false)
            setInputVAT(jsonContentTmp.VATRates)
            let isVnd = !(jsonContentTmp.DiscountRatio > 0 || jsonContentTmp.DiscountValue == 0)
            console.log("useEffect isVnd == ", isVnd);
            if (!isVnd) {
                setInputDiscount(jsonContentTmp.DiscountRatio)
                setPercent(true)
            } else {
                setInputDiscount(jsonContentTmp.DiscountValue)
                setPercent(false)
            }
        }

        const getVendorSession = async () => {
            provisional.current = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('provisional ', provisional.current);
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('setVendorSession ', data);
            setVendorSession(JSON.parse(data));
        }

        const getObjectSetting = async () => {
            settingObject.current = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (settingObject.current)
                settingObject.current = JSON.parse(settingObject.current)
            console.log("settingObject.current ", settingObject.current);
        }

        // debounceTimeInput.current.debounceTime(300)
        //     .subscribe(value => {
        //         console.log("debounceTimeInput value ", value);
        //         if (value != "0" && currentServerEvent.current) {
        //             let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current));
        //             dataManager.calculatateJsonContent(jsonContent)
        //             serverEvent.JsonContent = JSON.stringify(jsonContent)
        //             dataManager.updateServerEventNow(serverEvent, true, isFNB);
        //         }
        //     })

        getRoom()
        getVendorSession()
        getObjectSetting()

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
        if (percentRef.current != undefined) {
            onTouchInput(METHOD.discount)
        }
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

    const onBlurInput = () => {
        console.log("onBlurInput ============= jsonContent ", jsonContent);
        setSendMethod("")
        if (currentServerEvent.current) {
            let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current));
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            serverEvent.Version += 1
            dataManager.updateServerEventNow(serverEvent, true, isFNB);
        }
    }

    const handleNumber = () => {

    }

    const convertMoneyToNumber = (text) => {
        text = text.replace(/,/g, "");
        return text;
    }

    const onChangeTextInput = (text, type, update = false) => {
        // debounceTimeInput.current.next(text)
        console.log("onChangeTextInput text ", text);
        text = text.replace(/,/g, "");
        if (isNaN(text)) return;
        let value = text;
        if (value.indexOf(".") == (value.length - 1) && value.length != 0) {
            value = currencyToString(value.split(".")[0]) + "."
        } else {
            value = currencyToString(value, true)
        }
        let json = { ...jsonContent }
        console.log("onChangeTextInput value ", value);
        switch (type) {
            case 2:
                setInputVAT(value)
                json['VATRates'] = convertMoneyToNumber(value);
                calculatorPrice(json, totalPrice, update)
                break;
            case 1:
                console.log("onChangeTextInput value: ", value);
                if (!percent) {
                    json['DiscountValue'] = convertMoneyToNumber(value);
                    if (json['DiscountValue'] < totalPrice) {
                        setInputDiscount(value);
                    }
                } else {
                    json['DiscountRatio'] = convertMoneyToNumber(value);
                    if (json['DiscountRatio'] < 100) {
                        setInputDiscount(value);
                    }
                }
                calculatorPrice(json, totalPrice, update)
                break;
            default:
                break;
        }
    }

    const addAccount = () => {
        let newDate = new Date().getTime();
        if (timeClickPrevious + 500 < newDate) {
            let list = listMethod;
            list.push({ ...CASH, UUID: randomUUID(), Value: list.length > 0 ? "" : jsonContent.Total })
            setListMethod([...list])
            timeClickPrevious = newDate;
            console.log("addAccount [...list] ", [...list]);

        }
    }

    const deleteMethod = (item) => {
        let total = listMethod.reduce(getSumValue, 0);
        setListMethod([...listMethod.filter(el => (el.UUID != item.UUID))])
        let json = jsonContent;
        json.ExcessCash = total - item.Value - jsonContent.Total;
        setJsonContent(json)
    }

    const onCallBack = (data) => {
        console.log("onCallBack data ", data);
        setListVoucher(data.listVoucher)
        setPointUse(data.pointUse)
        setPoint((data.rewardPoints + data.sumVoucher))
        calculatorPrice(jsonContent, totalPrice)
    }

    const onCallBackCustomer = (data) => {
        console.log("onCallBackCustomer data : ", data);
        if (data.Id != 0) {
            let apiPath = `${ApiPath.SYNC_PARTNERS}/${data.Id}`
            new HTTPService().setPath(apiPath).GET()
                .then(result => {
                    if (result) {
                        console.log('onCallBackCustomer result', result, jsonContent);
                        let discount = dataManager.totalProducts(jsonContent.OrderDetails) * result.BestDiscount / 100
                        console.log('discount', discount);
                        jsonContent.Discount = discount
                        jsonContent.Partner = data
                        jsonContent.PartnerId = data.Id
                        jsonContent.DiscountRatio = result.BestDiscount
                        console.log('jsonContentjsonContent', jsonContent);
                        setDetailCustomer(result)
                        calculatorPrice(jsonContent, totalPrice)
                    }
                    setCustomer(data);
                }).catch(err => {
                    console.log("onCallBackCustomer err ", err);
                    setCustomer(data);
                })
        } else {
            jsonContent.Discount = 0
            delete jsonContent.Partner
            jsonContent.PartnerId = ""
            jsonContent.DiscountRatio = 0
            console.log('jsonContentjsonContent', jsonContent);
            calculatorPrice(jsonContent, totalPrice)
            setCustomer(data);
        }
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

    const onClickShowListMethod = (item, index) => {
        console.log("onClickShowListMethod ", item);
        itemAccountRef.current = { ...item, index: index };
        setItemMethod({ ...item, index: index })
        typeModal.current = TYPE_MODAL.FILTER_ACCOUNT
        setShowModal(true)
    }

    const onClickCancelFilter = () => {
        setShowModal(false)
        if (changeMethodQRPay.current != false) {
            setTimeout(() => {
                typeModal.current = TYPE_MODAL.QRCODE
                setShowModal(true)
            }, 200);
        }
    }

    useEffect(() => {
        if (changeMethodQRPay.current == true) {
            console.log("onClickOkFilter onClickPay ");
            realmStore.deleteQRCode(resPayment.current.Id);
            qrCodeRealm.current.removeAllListeners()
            // onClickPay();
            sendServerChangePayment();
            changeMethodQRPay.current = false;
        }
    }, [listMethod])

    const sendServerChangePayment = () => {
        // {AccountId: "", Id: 118194382}
        let params = { Id: resPayment.current.Id, AccountId: itemMethod.Id == 0 ? "" : itemMethod.Id }
        console.log("sendServerChangePayment params ", params);
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.CHANGE_PAYMENT.replace("{Id}", resPayment.current.Id)).POST(params).then(async res => {
            console.log("sendServerChangePayment res ", res);
            dialogManager.hiddenLoading()
            if (res) {
                dataManager.sentNotification((isFNB ? jsonContent.RoomName : I18n.t('don_hang')), I18n.t('khach_thanh_toan') + " " + currencyToString(jsonContent.Total))
                await printAfterPayment(res.Code)
                updateServerEvent(true)
                if (!isFNB) {
                    jsonContentPayment.current["RoomName"] = I18n.t('don_hang');
                    jsonContentPayment.current["Pos"] = "A"
                }
            }
        }, err => {
            dialogManager.hiddenLoading()
            console.log("sendServerChangePayment err== " + JSON.stringify(err));
        })
    }

    const onClickOkFilter = () => {
        console.log("onClickOkFilter 1 ", listMethod);
        console.log("onClickOkFilter 2 ", itemAccountRef.current);
        console.log("onClickOkFilter 3 ", itemMethod);
        setShowModal(false)
        if (changeMethodQRPay.current == true) {
            setListMethod([itemMethod])
        } else {
            // onChangeTextPaymentPaid(jsonContent.Total, itemAccountRef.current)
            onChangeTextPaymentPaid((itemAccountRef.current.index == 0) ? jsonContent.Total : "0", itemAccountRef.current)
            let list = [];
            listMethod.forEach((element, index) => {
                if (itemAccountRef.current.Id == element.Id && itemAccountRef.current.UUID == element.UUID) {
                    list.push({ ...itemAccountRef.current, ...itemMethod, Value: element.Value })
                } else
                    list.push(element)
            });
            setListMethod([...list])
        }
    }

    const onSelectMethod = (item) => {
        console.log("onSelectMethod ", item, itemMethod);
        setItemMethod({ ...item });
    }

    const getSumValue = (total, num) => {
        return total + Math.round(num.Value);
    }

    const setListVoucherTemp = (item, value) => {
        listMethod.forEach(element => {
            if (item.Id == element.Id && item.UUID == element.UUID) {
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
        console.log("onChangeTextPaymentPaid text ", text);
        text = text.toString();
        if (text == "") return;

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
        console.log("onChangeTextPaymentPaid text==:: ", text);
        listMethod.forEach(element => {
            if (item.Id == element.Id && item.UUID == element.UUID) {
                element.Value = text
                total += +text;
            } else {
                total += +element.Value;
            }
        });
        console.log("onChangeTextPaymentPaid listMethod==:: ", listMethod);
        setListMethod([...listMethod])
        json.ExcessCash = total - jsonContent.Total;
        setJsonContent(json)
    }

    const setValuePercent = (value) => {
        setPercentVAT(value == 0 ? false : true)
    }

    const onSelectExcess = (type) => {
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
            if (noteInfo != '') {
                jsonContent.Description = noteInfo;
            }

            if (settingObject.current.in_tam_tinh == false) {
                dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
                return;
            }
            dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: true } })
            let MoreAttributes = jsonContent.MoreAttributes ? (typeof (jsonContent.MoreAttributes) == 'string' ? JSON.parse(jsonContent.MoreAttributes) : jsonContent.MoreAttributes) : {}
            console.log("onClickProvisional MoreAttributes ", MoreAttributes);
            if (MoreAttributes.toString() == '{}') {
                MoreAttributes['TemporaryPrints'] = [{ CreatedDate: moment().utc().format("YYYY-MM-DD[T]HH:mm:ss.SS[Z]"), Total: jsonContent.Total }]
            } else {
                if (MoreAttributes.TemporaryPrints) {
                    MoreAttributes.TemporaryPrints.push({ CreatedDate: moment().utc().format("YYYY-MM-DD[T]HH:mm:ss.SS[Z]"), Total: jsonContent.Total })
                } else {
                    MoreAttributes['TemporaryPrints'] = [{ CreatedDate: moment().utc().format("YYYY-MM-DD[T]HH:mm:ss.SS[Z]"), Total: jsonContent.Total }]
                }
            }
            console.log("onClickProvisional MoreAttributes == ", MoreAttributes);
            jsonContent.MoreAttributes = JSON.stringify(MoreAttributes);
            if (currentServerEvent.current) {
                let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current));
                // dataManager.calculatateJsonContent(jsonContent)
                serverEvent.JsonContent = JSON.stringify(jsonContent)
                serverEvent.Version += 1
                dataManager.updateServerEventNow(serverEvent, true, isFNB);
            }
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
        return check;
    }

    const onClickPay = async () => {
        indexPayment.current = 0;
        console.log("onClickPay jsonContent ", jsonContent);
        console.log("onClickPay vendorSession.Settings ", vendorSession.Settings);
        let newDate = new Date().getTime();
        if (timeClickPrevious + 2000 < newDate) {
            timeClickPrevious = newDate;
        } else {
            return;
        }

        let net = await NetInfo.fetch();
        if (net.isConnected == false || net.isInternetReachable == false) {
            if (checkQRInListMethod()) {
                setToastDescription(I18n.t("chuc_nang_qr_code_chi_su_dung_khi_co_internet"))
                setShowToast(true)
                return;
            }
        }
        if (checkQRInListMethod() && listMethod.length > 1) {
            setToastDescription(I18n.t("khong_ho_tro_nhieu_tai_khoan_cho_qr"))
            setShowToast(true)
            return;
        }
        if (checkQRInListMethod() && (!vendorSession.Settings.QrCodeEnable || vendorSession.Settings.MerchantCode == '' || vendorSession.Settings.MerchantName == '')) {
            setToastDescription(I18n.t("vui_long_kich_hoat_thanh_toan_qrcode"))
            setShowToast(true)
            return;
        }
        if (customer && customer.Id == 0 && jsonContent.ExcessCash < 0) {
            setToastDescription(I18n.t("vui_long_nhap_dung_so_tien_khach_tra"))
            setShowToast(true)
            return;
        }
        let json = { ...jsonContent }
        let duplicate = randomUUID()
        let amountReceived = listMethod.reduce(getSumValue, 0);
        let paramMethod = []
        console.log("onClickPay amountReceived ", amountReceived);
        listMethod.forEach((element, index) => {
            let value = element.Value
            if (index == 0 && giveMoneyBack && amountReceived > json.Total) {
                value = (amountReceived - value) > json.Total ? 0 : json.Total - (amountReceived - value)
            }
            paramMethod.push({ AccountId: element.Id, Value: value != "" ? value : 0 })
        });
        console.log("onClickPay json.MoreAttributes ", typeof (json.MoreAttributes), json.MoreAttributes);
        let MoreAttributes = json.MoreAttributes ? (typeof (json.MoreAttributes) == 'string' ? JSON.parse(json.MoreAttributes) : json.MoreAttributes) : {}

        MoreAttributes.PointDiscount = pointUse && pointUse > 0 ? pointUse : 0;
        MoreAttributes.PointDiscountValue = 0;
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
        jsonContent.AmountReceived = amountReceived;
        json.Status = 2;
        json.SyncStatus = 0;
        if (noteInfo != '') {
            json.Description = noteInfo;
        }
        console.log("onClickPay date ", date);
        console.log("onClickPay dateTmp.current ", dateTmp.current);
        if (date && dateTmp.current) {
            let PurchaseDate = moment(date).utc().format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
            console.log("onClickPay PurchaseDate ", PurchaseDate);
            json.PurchaseDate = PurchaseDate;
            jsonContent.PurchaseDate = PurchaseDate;
        }
        if (listMethod.length > 0)
            json.AccountId = listMethod[0].Id;
        let params = {
            QrCodeEnable: vendorSession.Settings.QrCodeEnable,
            MerchantCode: vendorSession.Settings.MerchantCode,
            MerchantName: vendorSession.Settings.MerchantName,
            DontSetTime: (date && dateTmp.current) ? false : true,
            ExcessCashType: 0,
            Order: {},
        };
        jsonContentPayment.current = json;
        let tilteNotification = jsonContent.RoomName;
        if (props.route.params.Screen != undefined && props.route.params.Screen == ScreenList.MainRetail) {
            params.DeliveryBy = null;//by retain
            params.ShippingCost = 0;//by retain
            params.LadingCode = "";//by retain
            tilteNotification = I18n.t('don_hang')
            delete json.Pos;
            delete json.RoomName;
            delete json.RoomId;
        }
        params.Order = json;
        params.Duplicate = duplicate;
        console.log("onClickPay params== ", params);
        if (net.isConnected == true && net.isInternetReachable == true) {
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.ORDERS).POST(params).then(async order => {
                console.log("onClickPay order== ", order);
                dialogManager.hiddenLoading()
                if (order) {
                    resPayment.current = order;
                    dataManager.sentNotification(tilteNotification, I18n.t('khach_thanh_toan') + " " + currencyToString(jsonContent.Total))
                    if (order.QRCode && order.QRCode != "") {
                        qrCode.current = order.QRCode
                        typeModal.current = TYPE_MODAL.QRCODE
                        setShowModal(true)
                        handlerQRCode(order, json)
                    } else {
                        await printAfterPayment(order.Code)
                        updateServerEvent(true)
                    }
                    if (!isFNB) {
                        jsonContentPayment.current["RoomName"] = I18n.t('don_hang');
                        jsonContentPayment.current["Pos"] = "A"
                    }
                }
            }, err => {
                if (err && err.config && err.config.timeoutErrorMessage && err.config.timeoutErrorMessage == "TIMEOUT")
                    onError(json, duplicate)
                dialogManager.hiddenLoading()
                console.log("onClickPay err== " + JSON.stringify(err.config.timeoutErrorMessage));
            })
        } else {
            let isCheckStockControlWhenSelling = await dataManager.checkStockControlWhenSelling(json.OrderDetails)
            if (isCheckStockControlWhenSelling) {
                return;
            } else {
                onError(json, duplicate)
            }
        }
    }

    const onError = (json, duplicate) => {
        dialogManager.showPopupOneButton(I18n.t("khong_co_ket_noi_internet_don_hang_cua_quy_khach_duoc_luu_vao_offline"))
        if (!isFNB) {
            json["RoomName"] = I18n.t('don_hang');
            json["Pos"] = "A"
        }
        handlerError({ JsonContent: json, Duplicate: duplicate, RowKey: row_key })
        updateServerEvent(true)
        // props.navigation.pop()
    }

    const updateServerEvent = (isBack = true) => {
        let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current));
        let json = dataManager.createJsonContent(props.route.params.RoomId, props.route.params.Position, moment(), [], props.route.params.Name);
        setJsonContent(json)
        serverEvent.JsonContent = json;
        if (isFNB) serverEvent.Version += 10
        console.log("updateServerEvent serverEvent ", serverEvent);
        dataManager.updateServerEventNow(serverEvent, true, isFNB);
        if (settingObject.current.am_bao_thanh_toan == true && isBack)
            playSound()
        if (isBack)
            setTimeout(() => {
                if (!isFNB)
                    props.route.params.onCallBack(1, json)
                props.navigation.pop()
            }, 500);
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

    const printAfterPayment = async (Code) => {
        console.log("printAfterPayment jsonContent 1 ", jsonContent, props.route.params);
        if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
            jsonContent.RoomName = props.route.params.Name
        }
        jsonContent.PaymentCode = Code;
        if (noteInfo != '') {
            jsonContent.Description = noteInfo;
        }
        if (date && dateTmp.current) {
            jsonContent.PurchaseDate = date.toString();
        }
        console.log("printAfterPayment jsonContent 2 ", jsonContent);
        if (isFNB && settingObject.current.in_tem_truoc_thanh_toan && settingObject.current.in_tem_truoc_thanh_toan == true && !(resPayment.current.QRCode && resPayment.current.QRCode != "")) {
            console.log("printAfterPayment settingObject.current ", settingObject.current);
            settingObject.current.Printer.forEach(async element => {
                if (element.key == Constant.KEY_PRINTER.StampPrintKey && element.ip != "") {
                    let value = await handerDataPrintTemp(jsonContent)
                    console.log("printAfterPayment value  ", value);
                    console.log("printAfterPayment element  ", element);
                    Print.PrintTemp(value, element.ip, element.size)
                }
            });
            resPayment.current = {};
        }
        setTimeout(() => {
            dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: false } })
        }, 500);
    }

    const handlerQRCode = async (order, jsonContent) => {
        let params = {
            Id: order.Id,
            JsonContent: JSON.stringify(jsonContent),
            Messenger: order.Messenger,
            Status: false,
            HostName: URL.link,
            BranchId: vendorSession.CurrentBranchId,
            Code: order.Code,
            QRCode: order.QRCode
        }
        console.log("handlerQRCode params ", params);
        dataManager.syncQRCode([params]);

        if (isFNB && settingObject.current.in_tem_truoc_thanh_toan && settingObject.current.in_tem_truoc_thanh_toan == true) {
            console.log("printAfterPayment settingObject.current ", settingObject.current);
            settingObject.current.Printer.forEach(async element => {
                if (element.key == Constant.KEY_PRINTER.StampPrintKey && element.ip != "") {
                    let value = await handerDataPrintTemp(jsonContent)
                    console.log("printAfterPayment value  ", value);
                    console.log("printAfterPayment element  ", element);
                    Print.PrintTemp(value, element.ip, element.size)
                }
            });
        }

        qrCodeRealm.current = await realmStore.queryQRCode()
        qrCodeRealm.current.addListener((collection, changes) => {
            if (changes.insertions.length || changes.modifications.length) {
                console.log("handlerQRCode qrCode.addListener collection changes ", collection, changes);
                let QRCodeItem = qrCodeRealm.current.filtered(`Id == '${order.Id}'`);
                console.log("QRCodeItem == ", QRCodeItem);
                QRCodeItem = JSON.parse(JSON.stringify(QRCodeItem))[0];
                console.log("QRCodeItem ", QRCodeItem);
                if (QRCodeItem && QRCodeItem.Status == true) {
                    qrCodeRealm.current.removeAllListeners()
                    realmStore.deleteQRCode(order.Id);
                    printAfterPayment(resPayment.current.Code);
                    updateServerEvent(true)
                    setShowModal(false);
                }
            }
        })
    }

    const handlerError = (data) => {
        console.log("handlerError data ", data);
        dialogManager.hiddenLoading()
        let params = {
            Id: "OFFLINEIOS" + Math.floor(Math.random() * 9999999),
            Duplicate: data.Duplicate,
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
        value = "" + value;
        console.log("outputResult value :: ", value);
        console.log("outputResult typeof value :: ", typeof (value));
        if (value && value != "") {
            console.log("outputResult ::: ", value);
            if (sendMethod == METHOD.discount) {
                console.log("outputResult discount :: ", value);
                onChangeTextInput(value, 1, true)
            } else if (sendMethod == METHOD.vat) {
                onChangeTextInput(value, 2, true)
            } else {
                onChangeTextPaymentPaid(currencyToString(value, true), sendMethod)
            }
        }
    }

    const onTouchInput = (value, reset = true) => {
        console.log("onTouchInput value ", value);

        setChoosePoint(0);
        if (value != sendMethod || percentRef.current != undefined) {
            setSendMethod(value)
            if (value.name == METHOD.pay.name) {
                setListSuggestions(listSuggestTotal(jsonContent.Total))
                listMethod.forEach(element => {
                    if (value.Id == element.Id && element.UUID == value.UUID) {
                        element.Value = 0;
                        onChangeTextPaymentPaid("0", element)
                    }
                });
            } else {
                if (value == METHOD.discount && percentRef.current == true) {
                    setListSuggestions([5, 10, 15, 20, 25, 50, 100])
                } else {
                    setListSuggestions([])
                }
                if (reset)
                    onChangeTextInput("0", value == METHOD.vat ? 2 : 1)
            }
        }
        percentRef.current = undefined
    }
    const listSuggestTotal = (total) => {
        let list = [(total % 1000) == 0 ? total : Math.floor(total / 1000) * 1000 + 1000]
        if (total % 1000000 == 0) {
            return list
        } else {
            if (total % 100000 == 0) {
                if (Math.floor(total / 100000) > 5) {
                    list.push((Math.floor(total / 1000000) * 1000000) + 100000)
                } else if (Math.floor(total / 100000) == 5) {
                    list.push((Math.floor(total / 1000000) * 1000000) + 600000)
                }
                else if (Math.floor(total / 100000) > 2 && Math.floor(total / 100000) < 5) {
                    list.push((Math.floor(total / 1000000) * 1000000) + 500000)
                } else if (Math.floor(total / 100000) < 2)
                    list.push((Math.floor(total / 1000000) * 1000000) + 200000)
            } else {
                if (total % 10000 == 0) {
                    let sum = (Math.floor(total / 100000) * 100000)
                    setListSuggest(list, total, sum, 10000)
                } else {
                    if (total % 1000 == 0) {
                        let sum = (Math.floor(total / 10000) * 10000)
                        setListSuggest(list, total, sum, 1000)
                    } else {
                        let sum = (Math.floor((Math.floor(total / 1000) * 1000 + 1000) / 10000) * 10000)
                        setListSuggest(list, (Math.floor(total / 1000) * 1000 + 1000), sum, 1000)
                    }
                    setItemSuggest(list, total, 100000)
                }
                setItemSuggest(list, total, 1000000)

            }
        }
        return list
    }
    const setItemSuggest = (list, total, value) => {
        if (total % value < (value / 10)) {
            list.push(Math.floor(total / value) * value + (value / 10))
        }
        if ((total % value) < 2 * (value / 10)) {
            list.push(Math.floor(total / value) * value + 2 * (value / 10))
        }
        if ((total % value) > 2 * (value / 10) && (total % value) < 3 * (value / 10)) {
            list.push(Math.floor(total / value) * value + 3 * (value / 10))
        }
        if ((total % value) / (value / 10) < 4 && (total % value) / (value / 10) > 2) {
            list.push(Math.floor(total / value) * value + 4 * (value / 10))
        }
        if ((total % value) / (value / 10) < 5) {
            list.push(Math.floor(total / value) * value + 5 * (value / 10))
        }
        if ((total % value) > 4 * (value / 10) && (total % value) < 5 * (value / 10)) {
            list.push((Math.floor(total / value) * value) + 6 * (value / 10))
        }
        if (total % value > 5 * (value / 10) && (total % value) / (value / 10) < 7) {
            list.push((Math.floor(total / value) * value) + 7 * (value / 10))
        }
        if ((total % (value)) > (6 * (value / 10)) && total % (value) < (8 * (value / 10))) {
            list.push(Math.floor(total / (value)) * value + (8 * (value / 10)))
        }
        if ((total % value) > (7 * (value / 10)) && total % value < 9 * (value / 10)) {
            list.push(Math.floor(total / value) * value + 9 * (value / 10))
        }
        return list
    }

    const setListSuggest = (list, total, sum, value) => {
        if ((total - sum) / value == 1) {
            list.push(sum + (value * 2))
            list.push(sum + (value * 5))
        } else if ((total - sum) / value == 2) {
            list.push(sum + (value * 5))
        } else if ((total - sum) / value == 3) {
            list.push(sum + (value * 4))
            list.push(sum + (value * 5))
        }
        else if ((total - sum) / value >= 4) {
            list.push(sum + ((total - sum) / value + 1) * value)
        }
        return list
    }

    const calculatorPrice = (jsonContent, totalPrice, update = true) => {
        console.log("calculator totalPrice jsonContent ==  ", totalPrice, jsonContent);
        if (totalPrice == undefined || totalPrice == 0 || jsonContent == "{}") return;
        let realPriceValue = totalPrice;
        let disCountValue = 0;
        if (!percent) {
            disCountValue = jsonContent.DiscountValue ? (jsonContent.DiscountValue > realPriceValue ? realPriceValue : jsonContent.DiscountValue) : 0;
            jsonContent.DiscountRatio = 0
            if (jsonContent.DiscountValue >= realPriceValue) {
                setInputDiscount(currencyToString(realPriceValue, true))
            }
            // setInputDiscount(jsonContent.DiscountValue > realPriceValue ? realPriceValue : jsonContent.DiscountValue)
        } else {
            jsonContent.DiscountRatio = jsonContent.DiscountRatio > 100 ? 100 : jsonContent.DiscountRatio
            if (jsonContent.DiscountRatio >= 100) {
                setInputDiscount("100")
            }
            // setInputDiscount(jsonContent.DiscountRatio)
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
        jsonContent.Discount = totalDiscount > realPriceValue ? realPriceValue : totalDiscount;
        jsonContent.DiscountValue = disCountValue > realPriceValue ? realPriceValue : disCountValue;
        jsonContent.VAT = vat
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
        console.log("jsonContent ============== ", jsonContent);
        if (currentServerEvent.current && update == true) {
            let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current));
            // dataManager.calculatateJsonContent(jsonContent)
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            serverEvent.Version += 1
            dataManager.updateServerEventNow(serverEvent, true, isFNB);
        }
    }

    const onChangeDate = (selectedDate) => {
        const currentDate = dateTmp.current;
        let date = selectedDate.getDate();
        let month = selectedDate.getMonth();
        let year = selectedDate.getFullYear();
        currentDate.setDate(date)
        currentDate.setMonth(month)
        currentDate.setFullYear(year)
        console.log("onChangeTime Date ", currentDate);
        dateTmp.current = currentDate;
    };

    const onChangeTime = (selectedDate) => {
        const currentDate = dateTmp.current;
        let hours = selectedDate.getHours();
        let minutes = selectedDate.getMinutes();
        currentDate.setHours(hours)
        currentDate.setMinutes(minutes)
        console.log("onChangeTime Date ", currentDate);
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

    const showDetailCustomer = () => {
        setIsShowDetailCustomer(!isShowDetailCustomer)
        console.log("showDetailCustomer Customer ", customer);
        if (customer.Id != 0) {
            let apiPath = `${ApiPath.SYNC_PARTNERS}/${customer.Id}`
            new HTTPService().setPath(apiPath).GET()
                .then(result => {
                    if (result) {
                        console.log('showDetailCustomer result', result);
                        setDetailCustomer(result)
                    }
                }).catch(err => {
                    console.log("showDetailCustomer err ", err);
                })
        }
    }

    const totalNumberProduct = () => {
        let number = 0;
        if (jsonContent.OrderDetails) {
            jsonContent.OrderDetails.forEach(element => {
                number += element.Quantity;
            });
        }
        return (Math.round(number * 1000) / 1000);
    }

    const onFocusVAT = () => {
        jsonContent.VATRates = 0;
        calculatorPrice(jsonContent, totalPrice)
        setInputVAT("")
    }

    const onFocusDiscount = () => {
        jsonContent.DiscountValue = 0;
        jsonContent.DiscountRatio = 0;
        calculatorPrice(jsonContent, totalPrice)
    }

    const setSelectionInput = (value) => {
        let length = value.length;
        if (length == undefined) length = 1;
        setSelection({ start: length, end: length })
    }

    const onClickRePrint = () => {
        console.log("onClickRePrint resPayment ", resPayment.current);
        jsonContentPayment.current.PaymentCode = resPayment.current.Code;
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContentPayment.current, provisional: false, imgQr: imageQr.current } })
    }

    const onClickChangeMethod = () => {
        setShowModal(false)
        setTimeout(() => {
            changeMethodQRPay.current = true;
            typeModal.current = TYPE_MODAL.FILTER_ACCOUNT
            setShowModal(true)
        }, 200);
    }

    const onClickCancelOrder = () => {
        updateServerEvent(false)
        console.log('onClickCancelOrder resPayment.current', resPayment.current);
        let id = resPayment.current && resPayment.current.Id ? resPayment.current.Id : ""
        new HTTPService().setPath(ApiPath.DELETE_ORDER.replace("{orderId}", id)).DELETE()
            .then(result => {
                console.log('onClickCancelOrder result', result);
                if (result) {
                    qrCodeRealm.current.removeAllListeners()
                    realmStore.deleteQRCode(resPayment.current.Id);
                    props.navigation.pop()
                }
            }).catch(err => {
                console.log("onClickCancelOrder err ", err);
            })
    }

    const onClickBackOrder = () => {
        qrCodeRealm.current.removeAllListeners()
        setShowModal(false);
        updateServerEvent(true)
        // props.navigation.pop()
    }

    const callback = async (dataURL) => {
        console.log("Data getRef QrCode  ============ ", dataURL);
        let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        if (setting && setting != "") {
            setting = JSON.parse(setting);
        }
        console.log("callback setting ", setting);
        if (dataURL != "" && indexPayment.current == 0 && setting.PrintInvoiceBeforePaymentVNPayQR == true) {
            imageQr.current = `<img id='barcode'
            src="data:image/png;base64,${dataURL}"
            width="150"
            height="150" />`
            console.log("Data getRef QrCode  ============  image ", indexPayment.current, imageQr.current);
            jsonContentPayment.current.PaymentCode = resPayment.current.Code;
            dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContentPayment.current, provisional: false, imgQr: imageQr.current } })
        }
        indexPayment.current++;
    }
    
    const getOutputPercent = (value) => {
        if (value.Type == 'discount') {
            onChangeTextInput(value.Value.toString(), 1)
        }
        else {
            onChangeTextInput(value.Value.toString())
        }
    }

    const renderFilter = () => {
        if (typeModal.current == TYPE_MODAL.FILTER_ACCOUNT) {
            let listAccount = changeMethodQRPay.current == false ? vendorSession.Accounts : vendorSession.Accounts.filter(item => item.Id != Constant.ID_VNPAY_QR); //.filter(item => item.Id != Constant.ID_VNPAY_QR)
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
                                        {
                                            item.Id != Constant.ID_VNPAY_QR ?
                                                <Text style={{}}>{item.Name}</Text>
                                                : <Image source={Images.vnpay_qr} style={{ width: 109, height: 30 }} />
                                        }
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
                            value={qrCode.current}
                            getRef={(c) => {
                                if (c)
                                    c.toDataURL((dataURL) => callback(dataURL))
                            }}
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
                            <Text style={[styles.textButtonCancel, { textTransform: "uppercase", color: colors.colorchinh, fontWeight: "bold" }]}>{I18n.t("quay_lai")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.viewButtonCancel, { backgroundColor: "#fff", height: 50, marginLeft: 10 }]} onPress={onClickRePrint}>
                            <Text style={[styles.textButtonCancel, { textTransform: "uppercase", color: colors.colorchinh, fontWeight: "bold" }]}>{I18n.t("in_lai")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        if (typeModal.current == TYPE_MODAL.DATE) {
            if (showDateTime)
                return (
                    <View style={{ alignItems: "center", backgroundColor: "#fff" }}>
                        <DatePicker date={date}
                            onDateChange={onChangeDate}
                            mode={'date'}
                            display="default"
                            locale="vi-VN" />
                        <View style={styles.line}></View>
                        <DatePicker date={date}
                            onDateChange={onChangeTime}
                            mode={'time'}
                            display="default"
                            locale="vi-VN" />
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
                                    returnKeyType='done'
                                    editable={false}
                                    onTouchStart={() => onShowDateTime(true)}
                                    value={"" + dateToStringFormatUTC(date)}
                                    style={{ padding: 6, flex: 1, color: "#000" }} />
                                <Fontisto style={{ marginTop: -2 }} name="date" size={20} color={colors.colorchinh} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.viewNote}>
                            <Text style={styles.textInfo}>{I18n.t('ghi_chu')}</Text>
                            <TextInput
                                returnKeyType='done'
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
                    <TouchableOpacity onPress={() => onClickShowListMethod(item, index)} style={styles.viewNameMethod}>
                        <Text style={styles.textNameMethod}>{item.Name}</Text>
                        <Image source={Images.arrow_down} style={styles.iconArrowDown} />
                    </TouchableOpacity>
                    <View style={styles.viewCalculatorMethod}>
                        <TouchableOpacity onPress={() => checkExcessCash(item)} style={styles.buttonCaculatorMothod}>
                            <Fontisto name="calculator" size={20} color={colors.colorchinh} />
                        </TouchableOpacity>
                    </View>
                    {
                        item.Id == Constant.ID_VNPAY_QR ?
                            <Text style={[styles.inputListMethod, { opacity: 0.2 }]}>{item.Value == "" ? "0" : "" + currencyToString(item.Value, true)}</Text>
                            :
                            <TextInput
                                returnKeyType='done'
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor="#808080"
                                onFocus={() => setSelectionInput(currencyToString(item.Value, true))}
                                value={item.Value == "" ? "" : "" + currencyToString(item.Value, true)}
                                onTouchStart={() => onTouchInput({ ...item, ...METHOD.pay })}
                                editable={deviceType == Constant.TABLET ? false : true}
                                onChangeText={(text) => onChangeTextPaymentPaid(text, item, index)}
                                style={[styles.inputListMethod, { borderColor: (sendMethod.Id == item.Id && item.UUID == sendMethod.UUID) ? colors.colorchinh : "gray" }]} />
                    }
                </View>
            )
        })
    }

    const renderTablet = () => {
        if (deviceType == Constant.TABLET) {
            if (choosePoint == 0) {
                return <Calculator
                    method={sendMethod}
                    outputResult={outputResult}
                    listSuggest={listSuggestions}
                    outputPercent={getOutputPercent} />
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
            <ToolBarPayment
                ref={toolBarPaymentRef}
                {...props}
                clickLeftIcon={() => {
                    if (!isFNB)
                        props.route.params.onCallBack(0, { ...jsonContent })
                    props.navigation.pop()
                }}
                clickRightIcon={(data) => { setTextSearch(data); }}
                onClickBackSearch={() => { setChoosePoint(1) }}
                clickNote={onClickNote}
                title={I18n.t('thanh_toan')} />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <KeyboardAwareScrollView style={{ flexGrow: 1 }}>
                        <Surface style={styles.surface}>
                            <View style={styles.viewCustomer}>
                                <Text style={{ flex: 3 }}>{I18n.t('khach_hang')}</Text>
                                <TouchableOpacity onPress={addCustomer} style={styles.viewNameMethod}>
                                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ marginLeft: 5, flex: 1 }}>{customer.Name == 'khach_le' ? I18n.t(customer.Name) : customer.Name} {customer.Phone ? "-" : ""} {customer.Phone}</Text>
                                    <SimpleLineIcons style={{ marginRight: 5 }} name="user" size={15} color="gray" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={showDetailCustomer} style={{ padding: 10, marginRight: -10 }} >
                                    <Image source={isShowDetailCustomer ? Images.arrow_down : Images.icon_up} style={[styles.iconArrowDown, { marginRight: 0 }]} />
                                </TouchableOpacity>
                            </View>
                            {isShowDetailCustomer ?
                                <View>
                                    <View style={styles.rowCustomerDetai}>
                                        <View style={styles.viewLeftCustomer}>
                                            <Text style={{}}>{I18n.t('ma_khach_hang')} : </Text>
                                            <Text ellipsizeMode="tail" numberOfLines={1} style={{ flex: 1 }}>{detailCustomer.Code}</Text>
                                        </View>
                                        <View style={styles.viewRightCustomer}>
                                            <Text style={{}}>{I18n.t('chiet_khau')} : </Text>
                                            <Text style={{}}>{detailCustomer.BestDiscount ? detailCustomer.BestDiscount : 0}%</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rowCustomerDetai}>
                                        <View style={styles.viewLeftCustomer}>
                                            <Text style={{}}>{I18n.t('du_no')} : </Text>
                                            <Text style={{}}>{currencyToString(detailCustomer.TotalDebt)}</Text>
                                        </View>
                                        <View style={styles.viewRightCustomer}>
                                            <Text style={{}}>{I18n.t('diem_thuong')} : </Text>
                                            <Text style={{}}>{detailCustomer.Point ? detailCustomer.Point : 0}</Text>
                                        </View>
                                    </View>
                                </View>
                                : null}
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={[styles.viewTextExcessCash]}>
                                <Text style={{ flex: 3.5 }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={styles.textQuantity}>{totalNumberProduct()}</Text>
                                <Text style={{ flex: 5.3, textAlign: "right" }}>{currencyToString(totalPrice)}</Text>
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={styles.viewDiscount}>
                                <Text style={{ flex: 2 }}>{I18n.t('tong_chiet_khau')}</Text>
                                <Text style={{ flex: 3, textAlign: "right" }}>{currencyToString(jsonContent.Discount)}</Text>
                            </View>
                            <View style={styles.viewDiscount}>
                                <Text style={{ flex: 3 }}>{I18n.t('chiet_khau')}</Text>
                                <View style={{ flexDirection: "row", flex: 3, marginLeft: 5 }}>
                                    <TouchableOpacity onPress={() => {
                                        percentRef.current = false
                                        jsonContent.DiscountValue = jsonContent.DiscountRatio * (totalPrice / 100);
                                        setInputDiscount(jsonContent.DiscountValue)
                                        selectPercent(false)
                                    }} style={[styles.selectPecent, { backgroundColor: !percent ? colors.colorchinh : "#fff" }]}>
                                        <Text style={{ color: !percent ? "#fff" : '#000' }}>VNĐ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        percentRef.current = true
                                        jsonContent.DiscountRatio = jsonContent.DiscountValue / totalPrice * 100
                                        setInputDiscount(jsonContent.DiscountRatio)
                                        selectPercent(true)
                                    }} style={[styles.viewSelectVAT, { backgroundColor: !percent ? "#fff" : colors.colorchinh }]}>
                                        <Text style={{ color: percent ? "#fff" : '#000' }}>%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    onBlur={onBlurInput}
                                    returnKeyType='done'
                                    keyboardType="numbers-and-punctuation"
                                    onFocus={() => onFocusDiscount()}
                                    placeholder="0"
                                    placeholderTextColor="#808080"
                                    value={inputDiscount == "" ? "" : ("" + inputDiscount)}
                                    onTouchStart={() => onTouchInput(METHOD.discount)}
                                    editable={deviceType == Constant.TABLET ? false : true}
                                    onChangeText={(text) => onChangeTextInput(text, 1)}
                                    style={{ borderColor: sendMethod == METHOD.discount ? colors.colorchinh : "gray", textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderWidth: 0.5, borderRadius: 5, padding: 6.8, color: "#000" }} />
                            </View>
                            <View style={styles.viewTextExcessCash}>
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
                            <View style={styles.viewTextExcessCash}>
                                <Text style={{ flex: 3 }}>VAT</Text>
                                <View style={{ flexDirection: "row", flex: 3, marginLeft: 5 }}>
                                    <TouchableOpacity onPress={() => { setInputVAT(0), selectVAT(0) }} style={[styles.selectPecent, { backgroundColor: !percentVAT ? colors.colorchinh : "#fff" }]}>
                                        <Text style={{ color: !percentVAT ? "#fff" : '#000' }}>0%</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setInputVAT(vendorSession.Settings && vendorSession.Settings.VAT ? vendorSession.Settings.VAT : 0)
                                        selectVAT(vendorSession.Settings && vendorSession.Settings.VAT ? vendorSession.Settings.VAT : 0)
                                    }
                                    } style={[styles.viewSelectVAT, { backgroundColor: !percentVAT ? "#fff" : colors.colorchinh }]}>
                                        <Text style={{ color: percentVAT ? "#fff" : "#000" }}>{vendorSession.Settings && vendorSession.Settings.VAT ? vendorSession.Settings.VAT : 0}%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    onBlur={onBlurInput}
                                    returnKeyType='done'
                                    keyboardType="numbers-and-punctuation"
                                    placeholder="0"
                                    placeholderTextColor="#808080"
                                    value={inputVAT == "" ? "" : inputVAT}
                                    onFocus={() => onFocusVAT()}
                                    onTouchStart={() => onTouchInput(METHOD.vat)}
                                    editable={deviceType == Constant.TABLET ? false : true}
                                    onChangeText={(text) => onChangeTextInput(text, 2)}
                                    style={{ borderColor: sendMethod == METHOD.vat ? colors.colorchinh : "gray", textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderWidth: 0.5, borderRadius: 5, padding: 6.8, color: "#000" }} />
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={styles.viewDiscount}>
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
                                <Text style={{ flex: 2 }}>{jsonContent.ExcessCash >= 0 ? !giveMoneyBack ? I18n.t('ghi_no') : I18n.t('tien_thua') : I18n.t('tien_thieu')}</Text>
                                <Text style={{ flex: 4, textAlign: "right", color: jsonContent.ExcessCash > 0 ? "green" : "red" }}>{currencyToString(jsonContent.ExcessCash)}</Text>
                            </View>
                            {
                                (jsonContent.ExcessCash >= 0 && (customer && customer.Id && customer.Id != "") && jsonContent.ExcessCash > 0) ?
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
                            if (!(qrCode.current && qrCode.current != ""))
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
        // backgroundColor: "#fff", 
        borderRadius: 4, marginHorizontal: 20,
        width: Metrics.screenWidth * 0.8
    },
    inputDateTime: { flexDirection: "row", alignItems: "center", paddingRight: 5, width: "70%", backgroundColor: "#eeeeee", marginLeft: 0, borderWidth: 0.5, borderRadius: 5, },
    viewDateTime: { width: "100%", flexDirection: "row", marginTop: 10 },
    viewNote: { width: "100%", flexDirection: "row", marginVertical: 10 },
    textInfo: { width: "30%", paddingVertical: 7 },
    line: { width: "100%", height: 1, backgroundColor: "#eeeeee" },
    inputNote: { width: "70%", height: 70, backgroundColor: "#eeeeee", marginLeft: 0, borderWidth: 0.5, borderRadius: 5, padding: 6, color: "#000" },
    inputListMethod: { textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 0, flex: 4, borderWidth: 0.5, borderRadius: 5, padding: 6.8, color: "#000" },
    buttonCaculatorMothod: { width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh },
    viewCalculatorMethod: { flex: 3, justifyContent: "center", alignItems: "center", },
    iconArrowDown: { width: 14, height: 14, marginHorizontal: 10 },
    textNameMethod: { marginLeft: 5 },
    viewNameMethod: { flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 6, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 },
    viewIconEmpty: { width: 32, height: 32 },
    iconCloseMethod: { marginTop: 3, alignContent: "center" },
    viewIconCloseMethod: { width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh },
    viewListMethod: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", },
    viewPrint: { flex: 1, alignItems: "center", backgroundColor: colors.colorchinh, paddingVertical: 15 },
    textBottom: { color: "#fff", textTransform: "uppercase", fontWeight: "bold" },
    viewButtomPayment: { borderLeftWidth: 2, borderLeftColor: "#fff", flex: 1, alignItems: "center", backgroundColor: colors.colorchinh, paddingVertical: 15 },
    viewBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    viewExcessCash: { flexDirection: "row", justifyContent: "flex-end", marginRight: 10 },
    viewRadioButton: { flexDirection: "row", alignItems: "center", padding: 3 },
    viewFilter: { backgroundColor: "#fff", padding: 15, maxHeight: Metrics.screenHeight * 0.7, borderRadius: 4 },
    titleFilter: { paddingBottom: 10, fontWeight: "bold", textTransform: "uppercase", color: colors.colorLightBlue, textAlign: "left", width: "100%" },
    buttonAddAcount: { flex: 3, padding: 10, paddingTop: 5, color: colors.colorchinh },
    viewBottomFilter: { justifyContent: "center", flexDirection: "row", paddingTop: 10 },
    textButtonCancel: { textAlign: "center", color: "#000" },
    textButtonOk: { textAlign: "center", color: "#fff" },
    viewButtonOk: { marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingVertical: 10, justifyContent: "flex-end" },
    viewButtonCancel: { flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, alignItems: 'center', justifyContent: "center" },
    viewTextExcessCash: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" },
    logoImage: { width: Metrics.screenWidth * 2 / 3, height: Metrics.screenWidth * 2 / 3 },
    rowCustomerDetai: { height: 50, borderTopWidth: 0.5, borderTopColor: "#ccc", justifyContent: "space-between", backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" },
    viewLeftCustomer: { flexDirection: "row", borderRightWidth: 0.5, borderRightColor: "#ccc", height: "100%", alignItems: "center", paddingRight: 10, flex: 1, justifyContent: "space-between" },
    viewRightCustomer: { flexDirection: "row", height: "100%", alignItems: "center", paddingLeft: 10, flex: 1, justifyContent: "space-between" },
    viewCustomer: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" },
    textQuantity: { borderColor: colors.colorchinh, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 5, borderWidth: 0.5 },
    viewDiscount: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", },
    selectPecent: { width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh },
    viewSelectVAT: { width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7 },

})