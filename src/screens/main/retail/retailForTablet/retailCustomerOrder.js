import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Modal, ImageBackground, FlatList, StyleSheet, Image } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Constant } from '../../../../common/Constant';
import { currencyToString, randomUUID } from '../../../../common/Utils';
import I18n from "../../../../common/language/i18n";
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { ScreenList } from '../../../../common/ScreenList';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail'
import realmStore from '../../../../data/realm/RealmStore';
import dataManager from '../../../../data/DataManager';
import _, { map } from 'underscore';
import { ApiPath } from '../../../../data/services/ApiPath';
import { HTTPService, URL } from '../../../../data/services/HttpService';
import Entypo from 'react-native-vector-icons/Entypo';
import dialogManager from '../../../../components/dialog/DialogManager';
import colors from '../../../../theme/Colors';
import { color } from 'react-native-reanimated';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import moment from 'moment';
var Sound = require('react-native-sound');
import NetInfo from "@react-native-community/netinfo";

const TYPE_MODAL = {
    // UNIT: 1,
    DETAIL: 2
}

const RetailCustomerOrder = (props) => {

    const CASH = {
        Id: 0,
        UUID: randomUUID(),
        Name: I18n.t('tien_mat'),
        Value: "",
    }

    const dispatch = useDispatch();
    const [listMethod, setListMethod] = useState([CASH])
    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState(() =>
        (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0)
            ? props.jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
    )
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [numberCommodity, setNumberCommodity] = useState(props.numberCommodity)
    const [expand, setExpand] = useState(false)
    const typeModal = useRef(TYPE_MODAL.DETAIL)
    const [itemOrder, setItemOrder] = useState({})
    const [totalQuantity, setTotalQuantity] = useState(0)
    const [isQuickPayment, setIsQuickPayment] = useState(false)
    const [promotions, setPromotions] = useState([])

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });



    useEffect(() => {
        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
        const getDataRealm = async () => {
            let promotions = await realmStore.querryPromotion();
            console.log("promotions === ", promotions);
            setPromotions(promotions)

        }
        getDataRealm();
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    useEffect(() => {
        setNumberCommodity(props.numberCommodity)
    }, [props.numberCommodity])

    useEffect(() => {
        console.log('props.jsonContent.OrderDetails', props.jsonContent);
        const getPromotion = async () => {
            if (JSON.stringify(props.jsonContent) != "{}") {
                let list = []
                list = await dataManager.addPromotion([...props.jsonContent.OrderDetails])
                setListOrder(list)
            }
        }
        getPromotion()
    }, [props.jsonContent])


    useEffect(() => {
        let totalQuantity = 0
        listOrder.forEach((elm, index) => {
            elm.index = index
            totalQuantity += elm.Quantity
        })
        setTotalQuantity(Math.round(totalQuantity * 1000) / 1000)
    }, [listOrder])





    const syncListProducts = (data) => {
        props.outputSelectedProduct(data, 2)
    }




    const _keyboardDidShow = () => {
        if (orientaition != Constant.PORTRAIT)
            setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    const applyDialogDetail = (product) => {
        console.log('applyDialogDetail', product);
        let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.UnitPrice
        let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
        let discountRatio = product.Percent ? product.Discount : product.Discount / price * 100
        discount = discount > price ? price : discount
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
        syncListProducts([...listOrder])

    }

    const setDataOrder = async (listOrder) => {
        let list = [];
        if (listOrder != undefined && listOrder.length > 0)
            list = await dataManager.addPromotion([...listOrder])
        console.log("setDataOrder listOrder list ", listOrder, list);

        setListOrder([...list])

    }

    const removeItem = (product, index) => {
        console.log('removeItem', index, product);
        listOrder.splice(index, 1)
        syncListProducts(listOrder)
    }

    const onClickNewOrder = async () => {
        if (listOrder.length == 0) {
            setToastDescription(I18n.t("moi_chon_mon_truoc"))
            setShowToast(true)
            return
        }
        props.onClickNewOrder()
    }


    // const addPromotion = async (list = []) => {
    //     console.log("addPromotion list ", list);
    //     console.log("addPromotion promotions ", promotions);
    //     let promotionTmp = promotions
    //     if (promotions.length == 0) {
    //         let promotion = await realmStore.querryPromotion();
    //         console.log("realmStore promotion === ", promotion);
    //         promotionTmp = promotion
    //         setPromotions(promotion)
    //     }
    //     let listProduct = await realmStore.queryProducts()
    //     console.log("addPromotion listProduct:::: ", listProduct);
    //     let listNewOrder = list.filter(element => (element.IsPromotion == undefined || (element.IsPromotion == false)))
    //     let listOldPromotion = list.filter(element => (element.IsPromotion != undefined && (element.IsPromotion == true)))
    //     console.log("listNewOrder listOldPromotion ==:: ", listNewOrder, listOldPromotion);

    //     var DataGrouper = (function () {
    //         var has = function (obj, target) {
    //             return _.any(obj, function (value) {
    //                 return _.isEqual(value, target);
    //             });
    //         };

    //         var keys = function (data, names) {
    //             return _.reduce(data, function (memo, item) {
    //                 var key = _.pick(item, names);
    //                 if (!has(memo, key)) {
    //                     memo.push(key);
    //                 }
    //                 return memo;
    //             }, []);
    //         };

    //         var group = function (data, names) {
    //             var stems = keys(data, names);
    //             return _.map(stems, function (stem) {
    //                 return {
    //                     key: stem,
    //                     vals: _.map(_.where(data, stem), function (item) {
    //                         return _.omit(item, names);
    //                     })
    //                 };
    //             });
    //         };

    //         group.register = function (name, converter) {
    //             return group[name] = function (data, names) {
    //                 return _.map(group(data, names), converter);
    //             };
    //         };

    //         return group;
    //     }());

    //     DataGrouper.register("sum", function (item) {
    //         console.log("register item ", item);

    //         return _.extend({ ...item.vals[0] }, item.key, {
    //             Quantity: _.reduce(item.vals, function (memo, node) {
    //                 return memo + Number(node.Quantity);
    //             }, 0)
    //         });
    //     });

    //     let listGroupByQuantity = DataGrouper.sum(listNewOrder, ["Id", "IsLargeUnit"])

    //     console.log("listGroupByQuantity === ", listGroupByQuantity);
    //     console.log("promotionTmp ===== ", promotionTmp);
    //     let listPromotion = [];
    //     let index = 0;
    //     listGroupByQuantity.forEach(element => {
    //         promotionTmp.forEach(async (item) => {
    //             if (item.QuantityCondition > 0 && (element.IsPromotion == undefined || (element.IsPromotion == false)) && element.ProductId == item.ProductId && checkEndDate(item.EndDate) && (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition)) {
    //                 let promotion = listProduct.filtered(`Id == ${item.ProductPromotionId}`)
    //                 promotion = JSON.parse(JSON.stringify(promotion[0]));
    //                 // let promotion = JSON.parse(item.Promotion)
    //                 console.log("addPromotion item:::: ", promotion);
    //                 if (index == 0) {
    //                     promotion.FisrtPromotion = true;
    //                 }

    //                 let quantity = Math.floor(element.Quantity / item.QuantityCondition) * item.QuantityPromotion
    //                 promotion.Quantity = quantity

    //                 if (listOldPromotion.length > 0) {
    //                     let oldPromotion = listOldPromotion.filter(el => promotion.Id == el.Id)
    //                     if (oldPromotion.length == 1) {
    //                         promotion = oldPromotion[0];
    //                         promotion.Quantity = quantity;
    //                     }
    //                 }

    //                 promotion.Price = item.PricePromotion;
    //                 promotion.IsLargeUnit = item.ProductPromotionIsLargeUnit;
    //                 promotion.IsPromotion = true;
    //                 promotion.ProductId = promotion.Id
    //                 promotion.Description = element.Quantity + " " + element.Name + ` ${I18n.t('khuyen_mai_')} ` + Math.floor(element.Quantity / item.QuantityCondition) * item.QuantityPromotion;

    //                 console.log("addPromotion promotion ", promotion, index);
    //                 listPromotion.push(promotion)
    //                 index++;
    //             }
    //         });
    //     });
    //     console.log("addPromotion listPromotion:: ", listPromotion);
    //     listNewOrder = listNewOrder.concat(listPromotion);
    //     console.log("addPromotion listNewOrder::::: ", listNewOrder);
    //     return listNewOrder;
    // }

    // const checkEndDate = (date) => {
    //     let endDate = new Date(date)
    //     let currentDate = new Date();
    //     console.log("currentDate endDate ", currentDate, endDate);
    //     if (endDate.getTime() > currentDate.getTime()) {
    //         return true;
    //     }
    //     return true;
    // }

    let _menu = null;

    const setMenuRef = ref => { _menu = ref };

    const hideMenu = () => { _menu.hide() };

    const showMenu = () => { _menu.show() };



    const renderForTablet = (item, index) => {
        const isPromotion = !(item.IsPromotion == undefined || (item.IsPromotion == false))
        return (
            <View style={{ paddingHorizontal: 5, paddingTop: 5 }}>
                {
                    isPromotion && item.FisrtPromotion != undefined ?
                        <View style={{ backgroundColor: "#ffedd6", padding: 7, paddingHorizontal: 10 }}>
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khuyen_mai')}</Text>
                        </View>
                        : null
                }
                <TouchableOpacity key={index} onPress={() => {
                    if (isPromotion) return;
                    setItemOrder(item)
                    console.log("setItemOrder ", item);
                    typeModal.current = TYPE_MODAL.DETAIL;
                    setShowModal(!showModal)
                }}>
                    <View style={{
                        borderColor: "gray", borderWidth: 0.5,
                        flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-evenly", padding: 5,
                        backgroundColor: 'white', borderRadius: 10, marginBottom: 2
                    }}>
                        <TouchableOpacity
                            style={{ marginRight: 5 }}
                            onPress={() => { if (!isPromotion) removeItem(item, index) }}>
                            <Image source={!isPromotion ? Images.icon_trash : Images.icon_gift} style={{ width: 36, height: 36 }} />
                            {/* <Icon name={!isPromotion ? "trash-can-outline" : "gift"} size={40} color={!isPromotion ? "black" : Colors.colorLightBlue} /> */}
                        </TouchableOpacity>
                        <View style={{ flexDirection: "column", flex: 1, }}>
                            <Text style={{ fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                            <Text style={{ marginBottom: 7, fontSize: 12 }} >{item.Code}</Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{}}>{currencyToString(item.Price)} x {(isPromotion) ? item.Quantity : null}</Text>
                                <View onPress={() => onClickUnit({ ...item })}>
                                    {/* {
                                        orientaition == Constant.PORTRAIT ?
                                            <Text style={{ color: Colors.colorchinh, }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                                            :
                                            <View>
                                                <Text style={{ color: Colors.colorchinh, }}>{item.IsLargeUnit ? (item.LargeUnit ? "/" + item.LargeUnit : "") : (item.Unit ? "/" + item.Unit : "")}</Text>
                                            </View>
                                    } */}
                                    <Text style={{ color: Colors.colorchinh, }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                                </View>
                            </View>
                            <Text
                                style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}>
                                {item.AttributesName ? `${item.AttributesName} \n` : ""}
                                {item.Description ? `${item.Description}` : ""}
                            </Text>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                            {/* <Icon style={{ paddingHorizontal: 5 }} name="bell-ring" size={20} color="grey" /> */}
                            <Text
                                style={{ color: Colors.colorchinh, marginRight: 5 }}>
                                {currencyToString(item.Price * item.Quantity)}
                            </Text>
                        </View>

                        {
                            orientaition == Constant.PORTRAIT ?
                                null
                                :
                                (isPromotion ? null :
                                    <View style={{ alignItems: "center", flexDirection: "row", }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (item.Quantity == 1) {
                                                    removeItem(item, index)
                                                } else {
                                                    item.Quantity--

                                                    syncListProducts([...listOrder])
                                                }
                                            }} style={{ paddingVertical: 3, paddingHorizontal: 12, borderWidth: 1, borderRadius: 5, borderColor: colors.colorchinh }}>
                                            <Text style={{ color: colors.colorchinh, fontSize: 25, }}>-</Text>
                                        </TouchableOpacity>
                                        <View style={{
                                            width: 60,
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

                                            syncListProducts([...listOrder])
                                        }} style={{ paddingVertical: 3, paddingHorizontal: 12, borderWidth: 1, borderRadius: 5, borderColor: colors.colorchinh }}>
                                            <Text style={{ color: colors.colorchinh, textAlign: 'center', fontSize: 25, }}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                        }

                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    const onCallBackPayment = (type, data) => {
        console.log("onCallBackPayment data ", data);
        // syncListProducts([])
        props.updateServerEvent({ ...data })
    }

    // const onCallBackPayment = (type, data) => {
    //     console.log("onCallBackPayment type ,data ", type, data);
    //     // setJsonContent( { ...data })
    //     props.jsonContent = { ...data }
    // }

    const onClickPayment = () => {

        if (listOrder && listOrder.length > 0) {
            if (isQuickPayment) {
                onClickQuickPayment()
            } else {
                props.navigation.navigate(ScreenList.Payment, { onCallBack: onCallBackPayment, Screen: ScreenList.MainRetail, RoomId: props.jsonContent.RoomId, Name: props.jsonContent.RoomName ? props.jsonContent.RoomName : I18n.t('don_hang'), Position: props.jsonContent.Pos });
            }
        } else {
            console.log('ban_hay_chon_mon_an_truoc');
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const onClickQuickPayment = async () => {
        console.log('onClickQuickPayment', props.jsonContent);
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        vendorSession = JSON.parse(vendorSession)
        let json = JSON.parse(JSON.stringify(props.jsonContent))
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
        json.PurchaseDate = moment().utc().format("YYYY-MM-DD[T]HH:mm:ss.SS[Z]");
        let params = {
            QrCodeEnable: vendorSession.Settings.QrCodeEnable,
            MerchantCode: vendorSession.Settings.MerchantCode,
            MerchantName: vendorSession.Settings.MerchantName,
            DontSetTime: true,
            ExcessCashType: 0,
            Order: {},
        };
        let tilteNotification = json.RoomName ? json.RoomName : I18n.t('don_hang');
        // if (props.route.params.Screen != undefined && props.route.params.Screen == ScreenList.MainRetail) {
        params.DeliveryBy = null;//by retain
        params.ShippingCost = 0;//by retain
        params.LadingCode = "";//by retain
        delete json.Pos;
        delete json.RoomName;
        delete json.RoomId;
        // }
        params.Order = json;

        console.log("onClickPay params ", params);
        let net = await NetInfo.fetch();
        if (net.isConnected == true && net.isInternetReachable == true) {
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.ORDERS).POST(params).then(async order => {
                console.log("onClickPay order ", order);
                dialogManager.hiddenLoading()
                if (order) {
                    if (order.ResponseStatus && order.ResponseStatus.Message && order.ResponseStatus.Message != "") {
                        dialogManager.showPopupOneButton(order.ResponseStatus.Message.replace(/<strong>/g, "").replace(/<\/strong>/g, ""))
                        return
                    }
                    await printAfterPayment(order.Code)
                    updateServerEventForPayment()
                    dataManager.sentNotification(tilteNotification, I18n.t('khach_thanh_toan') + " " + currencyToString(json.Total))
                } else {
                    onError(json, vendorSession)
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
                onError(json, vendorSession)
            }
        }
    }


    const onError = (json, vendorSession) => {
        dialogManager.showPopupOneButton(I18n.t("khong_co_ket_noi_internet_don_hang_cua_quy_khach_duoc_luu_vao_offline"))
        json["RoomName"] = I18n.t('don_hang');
        json["Pos"] = "A"
        updateServerEventForPayment()
        handlerError({ JsonContent: json }, vendorSession)
    }

    const handlerError = (data, vendorSession) => {
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

    const printAfterPayment = async (Code) => {
        let jsonContentObj = JSON.parse(JSON.stringify(props.jsonContent))
        console.log("printAfterPayment jsonContent 1 ", jsonContentObj);
        jsonContentObj.PaymentCode = Code;
        jsonContentObj.RoomName = I18n.t('don_hang');
        jsonContentObj.Pos = "A"
        console.log("printAfterPayment jsonContent 2 ", jsonContentObj);
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContentObj, provisional: false } })
    }

    const updateServerEventForPayment = async () => {
        let settingObject = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        settingObject = JSON.parse(settingObject)
        let json = dataManager.createJsonContent(props.jsonContent.RoomId, props.jsonContent.Pos, moment())
        props.updateServerEvent(json)
        if (settingObject.am_bao_thanh_toan == true)
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

    const onCLickCommodity = () => {

        props.onCLickCommodity()
    }



    const onClickOptionQuickPayment = () => {
        setIsQuickPayment(!isQuickPayment)
    }

    const onClickPrint = async () => {
        hideMenu()
        console.log("onClickProvisional jsonContent ", props.jsonContent);
        if (listOrder && listOrder.length > 0) {
            props.jsonContent.RoomName = I18n.t('don_hang');
            let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (setting && setting != "") {
                setting = JSON.parse(setting);
                if (setting.in_tam_tinh == false) {
                    dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
                    return;
                }
            }
            dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: props.jsonContent, provisional: true } })

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
            let row_key = `${props.jsonContent.RoomId}_${props.jsonContent.Pos}`
            let serverEvents = await realmStore.queryServerEvents()
            serverEvents = serverEvents.filtered(`RowKey == '${row_key}'`)[0]
            if (serverEvents) {
                let serverEvent = JSON.parse(JSON.stringify(serverEvents));
                dataManager.calculatateJsonContent(jsonContent)
                serverEvent.JsonContent = JSON.stringify(jsonContent)
                serverEvent.Version += 1
                dataManager.updateServerEventNow(serverEvent, true, false);
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1, backgroundColor: 'white' }}>
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
            <View>

                <TouchableOpacity
                    onPress={() => { setExpand(!expand) }}
                    style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 5, backgroundColor: "#FFE9CC", }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
                        {/* <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
                         */}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontWeight: "bold", marginRight: 10 }}>{I18n.t('tong_thanh_tien')}</Text>
                            {totalQuantity > 0 ?
                                <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderWidth: 1, borderColor: "#bbbbbb", borderRadius: 9, backgroundColor: "white", }}>
                                    <Text style={{ fontWeight: "bold", }}>{totalQuantity}</Text>
                                </View>
                                : null}
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{currencyToString(props.jsonContent.Total - props.jsonContent.VAT + props.jsonContent.Discount)} đ</Text>
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
                        button={<Icon style={{ paddingHorizontal: 5 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={onClickPrint} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                {/* <MaterialIcons style={{ paddingHorizontal: 7 }} name="printer" size={26} color={Colors.colorchinh} /> */}
                                <Icon style={{ paddingHorizontal: 10 }} name="printer" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_tam_tinh')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickOptionQuickPayment()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name={isQuickPayment ? "checkbox-marked" : "close-box-outline"} size={26} color={isQuickPayment ? Colors.colorLightBlue : "grey"} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('thanh_toan_nhanh')}</Text>
                            </TouchableOpacity>

                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCLickCommodity} style={{ flex: .5, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%", flexDirection: 'row' }}>
                    <Icon name="file-document-edit-outline" size={30} color="white" />
                    {numberCommodity > 0 ?
                        <View style={{ backgroundColor: Colors.colorLightBlue, paddingHorizontal: 3.5, borderRadius: 40, position: "absolute", right: 3, top: -5 }}>
                            <Text style={{ fontWeight: "bold", padding: 4, color: 'white', fontSize: 14 }}>{numberCommodity}</Text>
                        </View> : null}
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickNewOrder} style={{ flex: .8, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('don_hang_moi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickPayment} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", textAlign: "center" }}>{isQuickPayment ? I18n.t('thanh_toan_nhanh') : I18n.t('thanh_toan')}</Text>
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
                            {typeModal.current == TYPE_MODAL.DETAIL ?
                                <DialogProductDetail
                                    fromRetail={true}
                                    item={itemOrder}
                                    priceBookId={props.jsonContent.PriceBookId}
                                    onClickSubmit={data => { applyDialogDetail(data) }}
                                    setShowModal={() => {
                                        setShowModal(false)
                                    }}
                                />
                                :
                                null
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


export default RetailCustomerOrder

