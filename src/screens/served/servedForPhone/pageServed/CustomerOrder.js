import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, Modal, ImageBackground, Platform, Keyboard, Image } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TextTicker from 'react-native-text-ticker';
import { currencyToString, randomUUID } from '../../../../common/Utils'
import I18n from "../../../../common/language/i18n"
import { Snackbar, Surface } from 'react-native-paper';
import colors from '../../../../theme/Colors';
import { ScreenList } from '../../../../common/ScreenList';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail'
import dialogManager from '../../../../components/dialog/DialogManager';
import dataManager from '../../../../data/DataManager';
import useInterval from '../../../../customHook/useInterval';
import { useDispatch, useSelector } from 'react-redux';
import { defaultMultiKitchen } from '../../../more/ViewPrint';
import { color } from 'react-native-reanimated';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import { ReturnProduct } from '../../ReturnProduct';
import { HTTPService } from '../../../../data/services/HttpService';
import { ApiPath } from '../../../../data/services/ApiPath';
var Sound = require('react-native-sound');
import moment from 'moment';


const TYPE_MODAL = {
    DETAIL: 0,
    DELETE: 1
}

export default (props) => {

    const CASH = {
        Id: 0,
        UUID: randomUUID(),
        Name: I18n.t('tien_mat'),
        Value: "",
    }

    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState(() =>
        (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0)
            ? props.jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
    )
    const [listMethod, setListMethod] = useState([CASH])
    const [quickPay, setQuickPay] = useState(false)
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [itemOrder, setItemOrder] = useState({})
    const [marginModal, setMargin] = useState(0)
    const [expand, setExpand] = useState(false)
    const [QuantitySubtract, setQuantitySubtract] = useState(0)
    const [vendorSession, setVendorSession] = useState({});
    const typeModal = useRef(TYPE_MODAL.DETAIL)
    const isStartPrint = useRef(-1)
    const settingObject = useRef()

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
        const getObjectSetting = async () => {
            settingObject.current = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            settingObject.current = JSON.parse(settingObject.current)
            console.log("settingObject.current ", settingObject.current);
            if ('quickPay' in settingObject.current) {
                setQuickPay(settingObject.current.quickPay)
            }
        }
        getObjectSetting();
        getVendorSession();

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    const _keyboardDidShow = () => {
        // if (orientaition != Constant.PORTRAIT)
        setMargin(Metrics.screenWidth / 1.5)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    useEffect(() => {
        listOrder.forEach((elm, index) => elm.index = index)
    }, [listOrder])

    useEffect(() => {
        dialogManager.showLoading()
        console.log("CustomerOrder props.jsonContent.OrderDetails :: ", props.jsonContent.OrderDetails);

        if (props.jsonContent.OrderDetails) {
            let listOrder = props.jsonContent.OrderDetails.filter(item => item.ProductId > 0)
            setListOrder(listOrder)
            dialogManager.hiddenLoading()
        }
        
    }, [props.jsonContent])

    const sendOrder = async () => {
        if (quickPay) {
            onClickQuickPayment()
        } else {
            console.log("sendOrder room ", props.route.params.room);
            console.log("sendOrder props ", props);
            if (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0) {
                props.navigation.navigate(ScreenList.Payment, { RoomId: props.route.params.room.Id, Name: props.route.params.room.Name, Position: props.Position });
            } else {
                dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
            }
        }
    }

    const onClickQuickPayment = () => {
        console.log('onClickQuickPayment', props.jsonContent);
        let json = props.jsonContent
        let total = json && json.Total ? json.Total : 0
        let paramMethod = []
        listMethod.forEach((element, index) => {
            let value = element.Value
            value = total
            paramMethod.push({ AccountId: element.Id, Value: value })
        });
        console.log("onClickPay json.MoreAttributes ", typeof (json.MoreAttributes), json.MoreAttributes);
        let MoreAttributes = json.MoreAttributes ? (typeof (json.MoreAttributes) == 'string' ? JSON.parse(json.MoreAttributes) : json.MoreAttributes) : {}
        MoreAttributes.PaymentMethods = paramMethod
        json['MoreAttributes'] = JSON.stringify(MoreAttributes);
        json.TotalPayment = total
        json.VATRates = json.VATRates
        json.AmountReceived = total
        json.Status = 2;
        json.SyncStatus = 0;
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
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.ORDERS, false).POST(params).then(async order => {
            console.log("onClickPay order ", order);
            if (order) {
                dataManager.sentNotification(tilteNotification, I18n.t('khach_thanh_toan') + " " + currencyToString(json.Total))
                dialogManager.hiddenLoading()

                await printAfterPayment(order.Code)

                updateServerEvent()

                if (order.ResponseStatus && order.ResponseStatus.Message && order.ResponseStatus.Message != "") {
                    dialogManager.showPopupOneButton(order.ResponseStatus.Message.replace(/<strong>/g, "").replace(/<\/strong>/g, ""))
                }
            } else {
                onError(json)
            }
        }).catch(err => {
            console.log("onClickPay err ", err);
            onError(json)
        });
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
        console.log("printAfterPayment jsonContent 2 ", jsonContent);
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: false } })
    }

    const updateServerEvent = async () => {
        let json = dataManager.createJsonContent(props.route.params.room.Id, props.Position, moment(), [], props.route.params.room.Name);
        props.updateServerEvent(json)
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

    const checkProcessedQuantityProduct = (jsonContent) => {
        let isProcessed = true;
        jsonContent.OrderDetails.forEach(element => {
            if (element.Processed < element.Quantity) {
                isProcessed = false;
            }
        });
        return isProcessed;
    }

    const onClickReturn = (item) => {
        console.log('onClickReturn ', item.Name, item.index);
        setItemOrder(item)
        // typeModal.current = TYPE_MODAL.DELETE
        // setShowModal(true)
        if (vendorSession.Settings.ReturnHistory) {
            setQuantitySubtract(item.Quantity)
            typeModal.current = TYPE_MODAL.DELETE
            setShowModal(true)
        } else {
            let data = {
                QuantityChange: item.Quantity,
                Description: "",
            }
            saveOrder(data, item);
        }
    }

    const onClickTopping = (item, index) => {
        setItemOrder(item)
        props.navigation.navigate('Topping', { _onSelect: onCallBack, itemOrder: item, Position: props.Position, IdRoom: props.route.params.room.Id })
    }

    const onCallBack = (data) => {
        console.log('onCallBack from topping', data);
        mapToppingToList(data)
    }

    const mapToppingToList = (listTopping) => {
        console.log('mapToppingToList listTopping:', listTopping);
        console.log('mapToppingToList itemOrder ', itemOrder);

        const getInfoTopping = (lt) => {
            let description = '';
            let totalTopping = 0;
            let topping = []
            lt.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -${item.Name} x${item.Quantity} = ${currencyToString(item.Quantity * item.Price)};\n `
                    totalTopping += item.Quantity * item.Price
                    topping.push({ ExtraId: item.ExtraId, QuantityExtra: item.Quantity, Price: item.Price, Quantity: item.Quantity })
                }
            })
            return [description, totalTopping, topping]
        }
        let [description, totalTopping, topping] = getInfoTopping(listTopping)
        listOrder.forEach((element, index) => {
            if (element.ProductId == itemOrder.ProductId && index == itemOrder.index) {
                element.Description = description
                element.Topping = JSON.stringify(topping)
                element.TotalTopping = totalTopping

                element.Price += totalTopping
            }
        });
        // setListOrder([...listOrder])
        props.outputListProducts([...listOrder])
    }

    const mapDataToList = (product) => {
        console.log("mapDataToList itemOrder ", itemOrder);
        console.log("mapDataToList data ", product);
        if (itemOrder.Quantity > product.Quantity) {
            setTimeout(() => {
                setQuantitySubtract(itemOrder.Quantity - product.Quantity)
                typeModal.current = TYPE_MODAL.DELETE
                setShowModal(true)
            }, 300);
        } else {
            // let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.UnitPrice
            // let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
            let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.UnitPrice
            let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
            discount = price - product.Price > 0 ? price - product.Price : discount
            discount = discount > price ? price : discount
            let discountRatio = product.Percent ? product.Discount : product.Discount / price * 100
            listOrder.forEach((elm, index, arr) => {
                if (elm.ProductId == product.ProductId && index == product.index) {
                    if (product.Quantity == 0) {
                        arr.splice(index, 1)
                    }
                    elm.DiscountRatio = +discountRatio
                    elm.Quantity = +product.Quantity
                    elm.Description = product.Description
                    elm.Discount = +discount
                    elm.Name = product.Name
                    elm.Price = +product.Price
                    elm.IsLargeUnit = product.IsLargeUnit

                }
            })
            console.log("mapDataToList listOrder ", listOrder);
            props.outputListProducts([...listOrder])
        }
    }

    const splitTable = () => {
        hideMenu()
        if (listOrder && listOrder.length > 0) {
            props.navigation.navigate(ScreenList.SplitTable, props.jsonContent);
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const onClickProvisional = async () => {
        hideMenu()
        console.log("onClickProvisional props.route.params ", props.route.params);
        if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
            jsonContent.RoomName = props.route.params.room.Name
        }
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: true } })
    }

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = () => {
        _menu.hide();
    };

    const showMenu = () => {
        _menu.show();
    };

    const renderProduct = (item, index) => {

        const isPromotion = !(item.IsPromotion == undefined || (item.IsPromotion == false))
        return (
            <>
                {
                    isPromotion && item.FisrtPromotion != undefined ?
                        <View style={{ backgroundColor: "#ffedd6", padding: 7, paddingHorizontal: 10 }}>
                            <Text style={{ color: colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khuyen_mai')}</Text>
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
                    setItemOrder({ ...item })
                    console.log("onClickProduct item ", item);
                    typeModal.current = TYPE_MODAL.DETAIL
                    setShowModal(!showModal)
                }}>
                    <Surface style={[styles.mainItem, { elevation: 4 }]}>
                        <TouchableOpacity
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                            onPress={() => { if (!isPromotion) onClickReturn(item) }}>
                            {/* <Icon name={!isPromotion ? "trash-can-outline" : "gift"} size={40} color={!isPromotion ? "black" : colors.colorLightBlue} /> */}
                            <Image source={!isPromotion ? Images.icon_trash : Images.icon_gift} style={{ width: 36, height: 36 }} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, }}>
                            <TextTicker
                                style={{ fontWeight: "bold", marginBottom: 7 }}
                                duration={6000}
                                marqueeDelay={1000}>
                                {item.Name}
                            </TextTicker>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{}}>{currencyToString(item.Price)} x </Text>
                                <View>
                                    <Text style={{ color: Colors.colorchinh }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                                </View>
                            </View>

                            {item.Description != "" ?
                                <Text
                                    style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}>
                                    {item.Description}
                                </Text>
                                :
                                null}
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            {(item.ProductType == 2 && item.IsTimer) ?
                                <Icon style={{ paddingHorizontal: 5 }} name="clock" size={20} color={Colors.colorLightBlue} /> :
                                <Icon style={{ paddingHorizontal: 5 }} name="bell-ring" size={20} color={item.Quantity <= item.Processed ? Colors.colorLightBlue : "gray"} />
                            }
                            <Text
                                style={{ color: colors.colorchinh, marginRight: 5 }}>
                                {currencyToString(item.Price * item.Quantity)}
                            </Text>
                        </View>
                        {/* {item.ProductType == 2 && item.IsTimer ?
                        null
                        :
                        !isPromotion ?
                            <TouchableOpacity
                                style={{ marginRight: 5, borderWidth: 1, borderRadius: 50, padding: 3, borderColor: Colors.colorchinh }}
                                onPress={() => onClickTopping(item)}>
                                <Icon name="puzzle" size={25} color={Colors.colorchinh} />
                            </TouchableOpacity>
                            : null
                    } */}
                    </Surface>
                </TouchableOpacity>

            </>
        )
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
        let listOrderReturn = []
        listOrder.forEach((element, index, arr) => {
            if (element.ProductId == itemOrder.ProductId && index == itemOrder.index) {

                console.log("saveOrder itemOrder ====: " + JSON.stringify(itemOrder));
                console.log("saveOrder data ====: " + JSON.stringify(data));
                if (element.Processed > 0 && (((itemOrder.Quantity - itemOrder.Processed) < data.QuantityChange))) {
                    listOrderReturn.push({ ...data, ...element, Quantity: (itemOrder.Quantity - itemOrder.Processed - data.QuantityChange), Description: data.Description, RoomName: props.route.params.room.Name, Pos: jsonContent.Pos })
                    let listTmp = dataManager.getDataPrintCook(listOrderReturn)
                    console.log("saveOrder listTmp ====: " + JSON.stringify(listTmp));
                    dispatch({ type: 'PRINT_RETURN_PRODUCT', printReturnProduct: JSON.stringify(listTmp) })
                }

                let Quantity = element.Quantity > data.QuantityChange ? element.Quantity - data.QuantityChange : 0
                if (Quantity == 0) {
                    arr.splice(index, 1)
                } else {
                    element.Quantity = Quantity
                }
                if (Quantity < element.Processed) {
                    element.Processed = Quantity
                }
            }
        });
        props.outputListProducts([...listOrder])
    }

    const changTable = () => {
        hideMenu()
        if (listOrder && listOrder.length > 0) {
            props.navigation.navigate("ChangeTable", {
                FromRoomId: props.route.params.room.Id,
                FromPos: props.Position,
                Name: props.route.params.room.Name
            });
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
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

    let { jsonContent } = props
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {listOrder.length > 0 ?
                    <FlatList
                        data={listOrder}
                        extraData={listOrder}
                        renderItem={({ item, index }) => renderProduct(item, index)}
                        keyExtractor={(item, index) => '' + index}
                    />
                    :
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 2 }}>
                        </ImageBackground>
                    </View>
                }
            </View>
            <View>

                <TouchableOpacity
                    onPress={() => { setExpand(!expand) }}
                    style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white", marginLeft: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
                        <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: colors.colorchinh }}>{currencyToString(jsonContent.Total - (jsonContent.VAT ? jsonContent.VAT : 0) + jsonContent.Discount)} đ</Text>
                            {expand ?
                                <Icon style={{}} name="chevron-up" size={30} color="black" />
                                :
                                <Icon style={{}} name="chevron-down" size={30} color="black" />
                            }
                        </View>
                    </View>
                    {expand ?
                        <View style={{ marginLeft: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>{I18n.t('tong_chiet_khau')}</Text>
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {currencyToString(jsonContent.Discount)} đ</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>VAT ({jsonContent.VATRates}%)</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.VAT ? jsonContent.VAT : 0)} đ</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.Total)} đ</Text>
                                </View>
                            </View>
                        </View>
                        :
                        null
                    }
                </TouchableOpacity>
            </View>
            <View style={styles.footerMenu}>
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
                            <TouchableOpacity onPress={() => changTable()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="transform" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('chuyen_ban')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickProvisional()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="printer" size={22} color={Colors.colorchinh} />
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
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
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
                            width: Metrics.screenWidth * 0.9,
                            // marginBottom: Platform.OS == 'ios' ? Metrics.screenHeight / 2.5 : 0
                            marginBottom: Platform.OS == 'ios' ? marginModal : 0
                        }}>
                            {
                                typeModal.current == TYPE_MODAL.DETAIL ?
                                    <DialogProductDetail
                                        onClickTopping={() => onClickTopping(itemOrder)}
                                        item={itemOrder}
                                        priceBookId={props.jsonContent.PriceBookId}
                                        onClickSubmit={(data) => {
                                            mapDataToList(data)
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
                            {/* */}
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
        </View>
    )
}

const styles = StyleSheet.create({
    mainItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginVertical: 3,
        backgroundColor: 'white',
        borderRadius: 10, marginHorizontal: 6, padding: 5
    },
    wrapTamTinh: {
        borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white"
    },
    tamTinh: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5
    },
    textTamTinh: {
        fontWeight: "bold"
    },
    totalPrice: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-around"
    },
    footerMenu: {
        height: 40, flexDirection: "row", backgroundColor: colors.colorchinh, alignItems: "center"
    },
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
    textPriceModal: {
        padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4
    },
    wrapTextPriceModal: {
        alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC"
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
    descModal: {
        height: 50,
        flex: 7,
        fontStyle: "italic",
        fontSize: 12,
        borderWidth: 0.5,
        borderRadius: 4,
        backgroundColor: "#D5D8DC",
        padding: 5, color: "#000"
    },
    textQuantityModal: {
        padding: 6,
        textAlign: "center",
        margin: 10,
        flex: 1,
        borderRadius: 4,
        borderWidth: 0.5,
        backgroundColor: "#D5D8DC", color: "#000"
    },
});

