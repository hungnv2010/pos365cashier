import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Modal, ImageBackground, FlatList, StyleSheet, Image } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { Constant } from '../../../../common/Constant';
import { currencyToString, randomUUID } from '../../../../common/Utils';
import I18n from "../../../../common/language/i18n";
import { Snackbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { ScreenList } from '../../../../common/ScreenList';
import useDebounce from '../../../../customHook/useDebounce';
import useInterval from '../../../../customHook/useInterval';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail'
import DialogProductUnit from '../../../../components/dialog/DialogProductUnit'
import dialogManager from '../../../../components/dialog/DialogManager';
import dataManager from '../../../../data/DataManager';
import { ReturnProduct } from '../../ReturnProduct';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../../data/fileStore/FileStorage';
import { HTTPService } from '../../../../data/services/HttpService';
import { ApiPath } from '../../../../data/services/ApiPath';
import { useDispatch } from 'react-redux';
import colors from '../../../../theme/Colors';
import realmStore from '../../../../data/realm/RealmStore';
import moment from 'moment';
import NetInfo from "@react-native-community/netinfo";
var Sound = require('react-native-sound');



const TYPE_MODAL = {
    UNIT: 1,
    DETAIL: 2,
    RETURN: 3
}

const CustomerOrder = (props) => {

    const CASH = {
        Id: 0,
        UUID: randomUUID(),
        Name: I18n.t('tien_mat'),
        Value: "",
    }

    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState(() =>
        (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0)
            ? props.jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
    )
    const [listMethod, setListMethod] = useState([CASH])
    const [itemOrder, setItemOrder] = useState({})
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [IsLargeUnit, setIsLargeUnit] = useState(false)
    const typeModal = useRef(TYPE_MODAL.UNIT)
    const [expand, setExpand] = useState(false)
    const [waitingList, setWaitingList] = useState([])
    const debouceWaitingList = useDebounce(waitingList)
    const [vendorSession, setVendorSession] = useState({});
    const [QuantitySubtract, setQuantitySubtract] = useState(0)
    const [quickPay, setQuickPay] = useState(false)
    const { isFNB, orientaition } = useSelector(state => {
        return state.Common
    });
    const settingObject = useRef()
    const dispatch = useDispatch();

    const [delay, setDelay] = useState(1);
    useInterval(() => {//60s kiem tra va tinh lai hang hoa tính gio
        if (delay == 1) setDelay(60)
        let reload = dataManager.calculateProductTime(listOrder)
        if (reload) props.outPutSetNewOrderDetail(listOrder)
    }, delay * 1000)

    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('ReturnProduct data', JSON.parse(data));
            setVendorSession(JSON.parse(data))
        }

        getVendorSession()
        const getObjectSetting = async () => {
            settingObject.current = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            settingObject.current = JSON.parse(settingObject.current)
            console.log("settingObject.current ", settingObject.current);
            if ('quickPay' in settingObject.current) {
                setQuickPay(settingObject.current.quickPay)
            }
        }
        getObjectSetting()
        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    const _keyboardDidShow = () => {
        if (orientaition != Constant.PORTRAIT)
            setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    useEffect(() => {
        listOrder.forEach((elm, index) => elm.index = index)
    }, [listOrder])

    useEffect(() => {
        setItemOrder(props.itemOrder)
    }, [props.itemOrder])


    useEffect(() => {
        props.outputPosition(props.Position)
    }, [props.Position])

    useEffect(() => {
        if (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0) {
            let listOrder = props.jsonContent.OrderDetails.filter(item => item.ProductId > 0)
            setListOrder(listOrder)
        } else setListOrder([])
    }, [props.jsonContent.OrderDetails])

    useEffect(() => {
        console.log(props.listTopping, 'props.listTopping');
        console.log(props.itemOrder, 'props.itemOrder');

        const getInfoTopping = (listTopping) => {
            let description = '';
            let totalPrice = 0;
            let topping = []
            listTopping.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -${item.Name} x${item.Quantity} = ${currencyToString(item.Quantity * item.Price)};\n `
                    totalPrice += item.Quantity * item.Price
                    topping.push({ ExtraId: item.ExtraId, QuantityExtra: item.Quantity, Price: item.Price, Quantity: item.Quantity })
                }
            })
            return [description, totalPrice, topping]
        }
        let [description, totalPrice, topping] = getInfoTopping(props.listTopping)
        let indexFind = -1
        listOrder.forEach((element, index) => {
            if (element.ProductId == props.itemOrder.ProductId && index == props.itemOrder.index) {
                indexFind = index
                element.Description = description
                element.Topping = JSON.stringify(topping)
                element.TotalTopping = totalPrice
                element.Price += totalPrice
            }
        });
        setListOrder([...listOrder])
        if (indexFind >= 0 && listOrder.length >= indexFind) mapDataToList(listOrder[indexFind])

    }, [props.listTopping])

    useEffect(() => {
        if (debouceWaitingList.length > 0) {
            debouceWaitingList.forEach(product => props.outputSelectedProduct(product, true))
            setWaitingList([])
        }
    }, [debouceWaitingList])

    const applyDialogDetail = (product) => {
        console.log('applyDialogDetail product ', product);

        if (itemOrder.Quantity > product.Quantity) {
            setTimeout(() => {
                setQuantitySubtract(itemOrder.Quantity - product.Quantity)
                typeModal.current = TYPE_MODAL.RETURN
                setShowModal(true)
            }, 300);
        } else {
            let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.UnitPrice
            let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
            discount = discount > price ? price : discount
            discount = price - product.Price > 0 ? price - product.Price : discount
            let discountRatio = product.Percent ? product.Discount : product.Discount / price * 100
            listOrder.forEach((elm, index, arr) => {
                if (elm.ProductId == product.ProductId && index == product.index) {
                    elm.DiscountRatio = +discountRatio
                    elm.Quantity = +product.Quantity
                    elm.Name = product.Name
                    elm.Description = product.Description
                    elm.Discount = +discount
                    elm.Price = +product.Price
                    elm.IsLargeUnit = product.IsLargeUnit
                    props.outputSelectedProduct(elm, true)
                }
            })
        }
    }

    const mapDataToList = (product, isNow = true) => {
        console.log("mapDataToList product isNow ", product, isNow);

        if (isNow) props.outputSelectedProduct(product, true)
        else {
            let isExist = false
            waitingList.forEach(elm => {
                if (elm.ProductId == product.ProductId) {
                    isExist = true
                    elm = product
                }
            })
            if (!isExist) waitingList.push(product)
            setWaitingList([...waitingList])
        }
    }

    const removeItem = (product) => {
        product.Quantity = 0
        props.outputSelectedProduct(product)

    }

    const onClickReturn = (product, type = 1) => {
        setQuantitySubtract(type != 1 ? 1 : product.Quantity)
        setItemOrder(product)
        if (vendorSession.Settings.ReturnHistory) {
            setQuantitySubtract(type != 1 ? 1 : product.Quantity)
            typeModal.current = TYPE_MODAL.DELETE
            setShowModal(true)
        } else {
            let data = {
                QuantityChange: type == 1 ? product.Quantity : 1,
                Description: "",
            }
            saveOrder(data, product);
        }
    }

    const saveOrder = (data, item) => {
        let itemOrder = item;
        console.log('saveOrder data ', data, vendorSession.Settings.ReturnHistory, itemOrder);
        if (vendorSession.Settings.ReturnHistory) {
            let price = itemOrder.IsLargeUnit ? itemOrder.PriceLargeUnit : itemOrder.UnitPrice
            let params = {
                RoomHistory: {
                    Description: data.Description,
                    Pos: props.Position,
                    Price: price,
                    Printed: false,
                    ProductId: itemOrder.ProductId,
                    Quantity: data.QuantityChange,
                    RoomId: props.route.params.room.Id,
                    Total: data.QuantityChange * price
                }
            }
            new HTTPService().setPath(ApiPath.ROOM_HISTORY).POST(params).then(res => {
                console.log("saveOrder res", res);
            })
                .catch(err => {
                    console.log('saveOrder err', err);
                })
        }

        console.log("saveOrder itemOrder ====: " + JSON.stringify(itemOrder));
        console.log("saveOrder data ====: " + JSON.stringify(data));
        if (itemOrder.Processed > 0 && (((itemOrder.Quantity - itemOrder.Processed) < data.QuantityChange))) {
            let listOrderReturn = [{ ...data, ...itemOrder, Quantity: (itemOrder.Quantity - itemOrder.Processed - data.QuantityChange), Description: data.Description, RoomName: props.route.params.room.Name, Pos: props.jsonContent.Pos }]
            let listTmp = dataManager.getDataPrintCook(listOrderReturn)
            console.log("saveOrder listTmp ====: " + JSON.stringify(listTmp));
            dispatch({ type: 'PRINT_RETURN_PRODUCT', printReturnProduct: JSON.stringify(listTmp) })
        }

        let Quantity = itemOrder.Quantity > data.QuantityChange ? itemOrder.Quantity - data.QuantityChange : 0
        itemOrder.Quantity = Quantity
        if (Quantity < itemOrder.Processed) {
            itemOrder.Processed = Quantity
        }
        props.outputSelectedProduct({ ...itemOrder }, true)

    }


    const onClickTopping = (item) => {
        props.outputItemOrder(item)
    }

    let _menu = null;

    const setMenuRef = ref => { _menu = ref };

    const hideMenu = () => { _menu.hide() };

    const showMenu = () => { _menu.show() };

    const onClickUnit = (item) => {
        if (item.Unit && item.Unit != "" && item.LargeUnit && item.LargeUnit != "") {
            typeModal.current = TYPE_MODAL.UNIT;
            setIsLargeUnit(item.IsLargeUnit)
            setItemOrder(item)
            setShowModal(true)
        }
    }

    const renderForTablet = (item, index) => {
        const isPromotion = !(item.IsPromotion == undefined || (item.IsPromotion == false))
        return (
            <View style={{ paddingHorizontal: 5, paddingTop: 5 }}>
                {
                    isPromotion && item.FisrtPromotion != undefined && item.FisrtPromotion == true ?
                        <View style={{ backgroundColor: "#ffedd6", padding: 7, paddingHorizontal: 10, marginBottom: 5 }}>
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khuyen_mai')}</Text>
                        </View>
                        : null
                }
                <TouchableOpacity key={index} onPress={() => {
                    if (isPromotion) return;
                    if (item.ProductType == 2 && item.IsTimer) {
                        setToastDescription(I18n.t("ban_khong_co_quyen_dieu_chinh_mat_hang_thoi_gian"))
                        setShowToast(true)
                        return
                    }
                    console.log("setItemOrder ", item);
                    typeModal.current = TYPE_MODAL.DETAIL;
                    setItemOrder({ ...item })
                    setShowModal(!showModal)
                }}>
                    <View style={{
                        borderColor: "gray", borderWidth: 0.5,
                        flexDirection: "row", flex: 1, alignItems: "center", padding: 5,
                        backgroundColor: index == props.itemOrder.index ? "#EED6A7" : "white",
                        borderRadius: 10,
                    }}>

                        <TouchableOpacity
                            style={{ marginRight: 5 }}
                            onPress={() => { if (!isPromotion) onClickReturn(item, 1) }}>
                            <Image source={!isPromotion ? Images.icon_trash : Images.icon_gift} style={{ width: 36, height: 36 }} />
                        </TouchableOpacity>

                        <View style={{ flexDirection: "column", flex: 1, alignItems: "flex-start" }}>

                            <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                                <View style={{ flex: 3, flexDirection: 'row' }}>
                                    <View style={{ flexDirection: "column", flex: 1, }}>
                                        <Text style={{ fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                                        <View style={{ flexDirection: "row" }}>
                                            <Text style={{}}>{currencyToString(item.Price)} x <Text style={{ color: Colors.colorchinh }}>{(isPromotion && orientaition != Constant.PORTRAIT) ? item.Quantity : null}</Text></Text>
                                            <View>
                                                {
                                                    orientaition == Constant.PORTRAIT ?
                                                        <Text style={{ color: Colors.colorchinh, }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                                                        :
                                                        <View>
                                                            <Text style={{ color: Colors.colorchinh, }}>{item.IsLargeUnit ? (item.LargeUnit ? "/" + item.LargeUnit : "") : (item.Unit ? "/" + item.Unit : "")}</Text>
                                                        </View>
                                                }
                                            </View>
                                        </View>

                                    </View>
                                    <View style={{}}>
                                        {(item.ProductType == 2 && item.IsTimer) ?
                                            null :
                                            <Icon style={{ alignSelf: "flex-end" }} name="bell-ring" size={20} color={item.Quantity <= item.Processed ? Colors.colorLightBlue : "gray"} />
                                        }
                                        <Text
                                            style={{ color: Colors.colorchinh, alignSelf: "flex-end" }}>
                                            {currencyToString(item.Price * item.Quantity)}
                                        </Text>
                                    </View>
                                </View>
                                {
                                    orientaition == Constant.PORTRAIT ?
                                        null
                                        :
                                        (isPromotion ? null :
                                            <>
                                                <View style={{ marginHorizontal: 5, flex: 2.3, }}>
                                                    {
                                                        item.ProductType == 2 && item.IsTimer ?

                                                            <View style={{
                                                                flex: 1, justifyContent: "center",
                                                                alignItems: "center", paddingVertical: 10,
                                                                shadowColor: "#000",
                                                                shadowOffset: {
                                                                    width: 0,
                                                                    height: 1,
                                                                },
                                                                shadowOpacity: 0.18,
                                                                shadowRadius: 1.00,
                                                                elevation: 2,
                                                                borderRadius: 2
                                                            }}>
                                                                <Text style={{ fontWeight: "bold" }}>{Math.round(item.Quantity * 1000) / 1000}</Text>
                                                            </View>
                                                            :
                                                            <View style={{ alignItems: "center", flexDirection: "row", flex: 1 }}>
                                                                <TouchableOpacity
                                                                    onPress={
                                                                        () => onClickReturn(item, 2)
                                                                    } style={{ paddingVertical: 3, paddingHorizontal: 12, borderWidth: 1, borderRadius: 5, borderColor: colors.colorchinh }}>
                                                                    <Text style={{ color: colors.colorchinh, fontSize: 25, }}>-</Text>
                                                                </TouchableOpacity>
                                                                <View style={{
                                                                    width: 50,
                                                                    height: 35,
                                                                    shadowColor: "#000",
                                                                    shadowOffset: {
                                                                        width: 0,
                                                                        height: 1,
                                                                    },
                                                                    shadowOpacity: 0.18,
                                                                    shadowRadius: 1.00,
                                                                    elevation: 2,
                                                                    borderRadius: 2,
                                                                    justifyContent: "center",
                                                                    alignItems: "center"
                                                                }}>
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 16,
                                                                            fontWeight: "bold",
                                                                        }}>{item.Quantity}</Text>
                                                                </View>
                                                                <TouchableOpacity onPress={() => {
                                                                    item.Quantity++
                                                                    setListOrder([...listOrder])
                                                                    mapDataToList(item, false)
                                                                }} style={{ paddingVertical: 3, paddingHorizontal: 12, borderWidth: 1, borderRadius: 5, borderColor: colors.colorchinh }}>
                                                                    <Text style={{ color: colors.colorchinh, textAlign: 'center', fontSize: 25, }}>+</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                    }
                                                </View>

                                                {
                                                    item.ProductType == 2 && item.IsTimer ?

                                                        <SimpleLineIcons name="clock" size={37} color={Colors.colorchinh} />

                                                        : <TouchableOpacity
                                                            style={{ borderWidth: 1, borderRadius: 20, alignItems: "center", justifyContent: "center", width: 40, height: 40, borderColor: Colors.colorchinh, }}
                                                            onPress={() => {
                                                                props.outputItemOrder(item, index)
                                                            }}>
                                                            <Icon name="puzzle" size={23} color={Colors.colorchinh} />
                                                        </TouchableOpacity>
                                                }
                                            </>
                                        )
                                }

                            </View>

                            <Text
                                style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}>
                                {item.Description}
                            </Text>

                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }


    const changTable = () => {
        hideMenu()
        if (listOrder && listOrder.length > 0) {
            setTimeout(() => {
                props.navigation.navigate(ScreenList.ChangeTable, {
                    FromRoomId: props.route.params.room.Id,
                    FromPos: props.Position,
                    Name: props.route.params.room.Name,
                });
            }, 300);
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }


    const onClickQuickPayment = async () => {
        console.log('onClickQuickPayment', props.jsonContent);
        // let newDate = new Date().getTime();
        // if (timeClickPrevious + 2000 < newDate) {
        //     timeClickPrevious = newDate;
        // } else {
        //     return;
        // }
        // if (checkQRInListMethod()) {
        //     setToastDescription(I18n.t("khong_ho_tro_nhieu_tai_khoan_cho_qr"))
        //     setShowToast(true)
        //     return;
        // }
        // if (customer && customer.Id == 0 && jsonContent.ExcessCash < 0) {
        //     setToastDescription(I18n.t("vui_long_nhap_dung_so_tien_khach_tra"))
        //     setShowToast(true)
        //     return;
        // }
        let json = props.jsonContent
        let total = json && json.Total ? json.Total : 0
        let paramMethod = []
        listMethod.forEach((element, index) => {
            let value = element.Value
            // if (index == 0 && giveMoneyBack && amountReceived > json.Total) {
            value = total
            // }
            paramMethod.push({ AccountId: element.Id, Value: value })
        });
        console.log("onClickPay json.MoreAttributes ", typeof (json.MoreAttributes), json.MoreAttributes);
        let MoreAttributes = json.MoreAttributes ? (typeof (json.MoreAttributes) == 'string' ? JSON.parse(json.MoreAttributes) : json.MoreAttributes) : {}
        // console.log("onClickPay pointUse ", pointUse);

        // MoreAttributes.PointDiscount = pointUse && pointUse > 0 ? pointUse : 0;
        // MoreAttributes.PointDiscountValue = 0;
        // MoreAttributes.TemporaryPrints = [];
        // MoreAttributes.Vouchers = listVoucher;
        MoreAttributes.PaymentMethods = paramMethod
        // if (customer && customer.Id) {
        //     let debt = customer.Debt ? customer.Debt : 0;
        //     MoreAttributes.OldDebt = debt
        //     if (!giveMoneyBack)
        //         MoreAttributes.NewDebt = debt - (amountReceived - json.Total);
        //     else
        //         MoreAttributes.NewDebt = debt
        //     json.Partner = customer
        //     json.PartnerId = customer.Id
        //     json.ExcessCashType = giveMoneyBack ? "0" : "1"
        // }
        json['MoreAttributes'] = JSON.stringify(MoreAttributes);
        json.TotalPayment = total
        json.VATRates = json.VATRates
        json.AmountReceived = total
        json.Status = 2;
        json.SyncStatus = 0;
        json.PurchaseDate = moment().utc().format("YYYY-MM-DD[T]HH:mm:ss.SS[Z]");
        // if (noteInfo != '') {
        //     json.Description = noteInfo;
        // }
        // if (date && dateTmp.current) {
        //     json.PurchaseDate = "" + date;
        // }
        // if (listMethod.length > 0)
        json.AccountId = listMethod[0].Id;
        let params = {
            QrCodeEnable: vendorSession.Settings.QrCodeEnable,
            MerchantCode: vendorSession.Settings.MerchantCode,
            MerchantName: vendorSession.Settings.MerchantName,
            DontSetTime: true,
            ExcessCashType: 0,
            Order: {},
        };
        let tilteNotification = json.RoomName ? json.RoomName : "";
        if (props.route.params.Screen != undefined && props.route.params.Screen == ScreenList.MainRetail) {
            params.DeliveryBy = null;//by retain
            params.ShippingCost = 0;//by retain
            params.LadingCode = "";//by retain
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
                    await printAfterPayment(order.Code)
                    updateServerEvent()
                    if (order.ResponseStatus && order.ResponseStatus.Message && order.ResponseStatus.Message != "") {
                        dialogManager.showPopupOneButton(order.ResponseStatus.Message.replace(/<strong>/g, "").replace(/<\/strong>/g, ""))
                    }
                    // if (order.QRCode != "") {
                    //     qrCode.current = order.QRCode
                    //     typeModal.current = TYPE_MODAL.QRCODE
                    //     setShowModal(true)
                    //     handlerQRCode(order)
                    // }
                } else {
                    onError(json)
                }
            }, err => {
                dialogManager.hiddenLoading()
                console.log("onClickPay err== ", err);
            })
        } else {
            onError(json)
        }
    }

    const onError = (json) => {
        let row_key = `${props.route.params.room.Id}_${props.Position}`
        dialogManager.showPopupOneButton(I18n.t("khong_co_ket_noi_internet_don_hang_cua_quy_khach_duoc_luu_vao_offline"))
        updateServerEvent()
        handlerError({ JsonContent: json, RowKey: row_key })
    }

    const printAfterPayment = async (Code) => {
        let jsonContent = props.jsonContent
        console.log("printAfterPayment jsonContent 1 ", jsonContent, props.route.params);
        if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
            jsonContent.RoomName = props.route.params.Name
        }
        jsonContent.PaymentCode = Code;
        // if (noteInfo != '') {
        //     jsonContent.Description = noteInfo;
        // }
        // if (date && dateTmp.current) {
        //     jsonContent.PurchaseDate = "" + date;
        // }
        console.log("printAfterPayment jsonContent 2 ", jsonContent);
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: false } })
    }

    const updateServerEvent = async () => {
        let json = dataManager.createJsonContent(props.route.params.room.Id, props.Position, moment(), [], props.route.params.room.Name);
        props.updateServerEvent(json, 10)
        if (settingObject.current.am_bao_thanh_toan == true)
            playSound()
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

    const handlerError = (data) => {
        console.log("handlerError data ", data);
        dialogManager.hiddenLoading()
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

    const onClickPayment = () => {
        if (!props.jsonContent.OrderDetails || props.jsonContent.OrderDetails.length == 0) {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        } else {
            if (quickPay) {
                onClickQuickPayment()
            } else {
                props.navigation.navigate(ScreenList.Payment, { RoomId: props.route.params.room.Id, Name: props.route.params.room.Name, Position: props.Position });
            }
        }
    }


    const printKitchen = () => {
        let jsonContent = props.jsonContent;
        console.log("printKitchen jsonContent :: ", jsonContent);
        if (jsonContent.OrderDetails.length > 0) {
            if (!checkProcessedQuantityProduct(jsonContent)) {
                jsonContent.OrderDetails.forEach(element => {
                    element.RoomName = props.route.params.room.Name;
                    element.Pos = jsonContent.Pos;
                });
                let data = dataManager.getDataPrintCook(jsonContent.OrderDetails)
                console.log("printKitchen data ====: " + JSON.stringify(data));
                dispatch({ type: 'LIST_PRINT', listPrint: JSON.stringify(data) })
                jsonContent.OrderDetails.forEach(element => {
                    element.Processed = element.Quantity
                });
                console.log("printKitchen jsonContent ::: ", jsonContent);
                props.handlerProcessedProduct(jsonContent)
                notification(I18n.t("bao_che_bien_thanh_cong"));
            } else {
                notification(I18n.t("cac_mon_ban_chon_dang_duoc_nha_bep_chuan_bi"));
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const notification = (content) => {
        setToastDescription(content);
        setShowToast(true)
    }

    const changeToQuickPay = async () => {
        console.log('changeToQuickPay', settingObject.current);
        if ('quickPay' in settingObject.current) {
            settingObject.current.quickPay = !settingObject.current.quickPay
        } else {
            settingObject.current.quickPay = true
        }
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify(settingObject.current))
        setQuickPay(settingObject.current.quickPay)
    }

    const checkProcessedQuantityProduct = (jsonContent) => {
        let isProcessed = true;
        jsonContent.OrderDetails.forEach(element => {
            if (element.Processed < element.Quantity) {
                isProcessed = false;
            }
        });
        return isProcessed;
    }

    const onClickProvisional = async () => {
        hideMenu()
        let jsonContent = props.jsonContent;
        console.log("onClickProvisional props.route.params ", props.route.params);
        if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
            jsonContent.RoomName = props.route.params.room.Name
        }

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
        let row_key = `${props.route.params.room.Id}_${props.Position}`
        let serverEvents = await realmStore.queryServerEvents()
        serverEvents = serverEvents.filtered(`RowKey == '${row_key}'`)[0]
        if (serverEvents) {
            let serverEvent = JSON.parse(JSON.stringify(serverEvents));
            dataManager.calculatateJsonContent(jsonContent)
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            serverEvent.Version += 1
            dataManager.updateServerEventNow(serverEvent, true, isFNB);
        }

        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: true } })
    }

    const splitTable = () => {
        hideMenu()
        if (listOrder && listOrder.length > 0) {
            props.jsonContent.RoomName = props.route.params.room.Name
            props.navigation.navigate(ScreenList.SplitTable, props.jsonContent);
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white', paddingBottom: 5 }}>
                {listOrder.length > 0 ?
                    <FlatList
                        data={listOrder}
                        extraData={listOrder}
                        renderItem={({ item, index }) => renderForTablet(item, index)}
                        keyExtractor={(item, index) => '' + index}
                    />
                    :
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 3 }}>
                        </ImageBackground>
                    </View>
                }
            </View>

            <View style={{}}>
                <TouchableOpacity
                    onPress={() => { setExpand(!expand) }}
                    style={{ borderTopWidth: .5, borderTopColor: colors.colorchinh, paddingVertical: 5, backgroundColor: "white", }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                        <Text style={{ fontWeight: "bold", paddingLeft: 10 }}>{I18n.t('tong_thanh_tien')}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{currencyToString(props.jsonContent.Total - (props.jsonContent.VAT ? props.jsonContent.VAT : 0) + props.jsonContent.Discount)} đ</Text>
                            {expand ?
                                <Icon style={{}} name="chevron-up" size={30} color="black" />
                                :
                                <Icon style={{}} name="chevron-down" size={30} color="black" />
                            }
                        </View>
                    </View>
                    {expand ?
                        <View style={{ paddingLeft: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>{I18n.t('tong_chiet_khau')}</Text>
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {currencyToString(props.jsonContent.Discount)} đ</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>VAT ({props.jsonContent.VATRates}%)</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(props.jsonContent.VAT ? props.jsonContent.VAT : 0)} đ</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(props.jsonContent.Total)} đ</Text>
                                </View>
                            </View>
                        </View>
                        :
                        null
                    }
                </TouchableOpacity>
            </View>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: colors.colorchinh, alignItems: "center" }}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 10 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={() => splitTable()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="call-split" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('tach_ban')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={changTable} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="transform" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('chuyen_ban')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickProvisional()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 7 }} name="printer" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_tam_tinh')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={changeToQuickPay} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                {
                                    quickPay ?
                                        <Icon style={{ paddingHorizontal: 7 }} name="checkbox-marked" size={28} color={Colors.colorLightBlue} />
                                        :
                                        <Icon style={{ paddingHorizontal: 7 }} name="close-box-outline" size={28} color="grey" />
                                }
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('thanh_toan_nhanh')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={printKitchen} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('bao_che_bien')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onClickPayment()} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{quickPay ? I18n.t('thanh_toan_nhanh') : I18n.t('thanh_toan')}</Text>
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
                        onPress={() => { setShowModal(false) }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }, { backgroundColor: 'rgba(0,0,0,0.5)' }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 0,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8,
                            marginBottom: Platform.OS == 'ios' ? marginModal : 0
                        }}>
                            {
                                typeModal.current == TYPE_MODAL.DETAIL ?
                                    <DialogProductDetail
                                        onClickTopping={() => onClickTopping(itemOrder)}
                                        item={itemOrder}
                                        priceBookId={props.jsonContent.PriceBookId}
                                        onClickSubmit={(data) => {
                                            applyDialogDetail(data)
                                        }}
                                        setShowModal={() => {
                                            setShowModal(false)
                                        }}
                                    />
                                    :
                                    <ReturnProduct
                                        Name={itemOrder.Name}
                                        Quantity={itemOrder.Quantity}
                                        QuantitySubtract={QuantitySubtract}
                                        vendorSession={vendorSession}
                                        getDataOnClick={(data) => saveOrder(data, itemOrder)}
                                        setShowModal={() => {
                                            setShowModal(false)
                                        }
                                        } />
                            }
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
    )
}

const styles = StyleSheet.create({
    headerModal: {
        backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4,
    },
    headerModalText: {
        margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, marginVertical: 10, color: "#fff"
    },
    button: {
        borderColor: Colors.colorchinh,
        borderWidth: 1,
        color: Colors.colorchinh,
        fontWeight: "bold",
        paddingHorizontal: 17,
        paddingVertical: 10,
        borderRadius: 5
    },
    wrapAllButtonModal: {
        alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 15
    },
    wrapButtonModal: {
        alignItems: "center",
        margin: 2,
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.colorchinh,
        padding: 5,
        borderRadius: 4,
        backgroundColor: "#fff"
    },
    buttonModal: {
        color: Colors.colorchinh, textTransform: "uppercase"
    },
});


export default React.memo(CustomerOrder)

