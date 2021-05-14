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
import { ScreenList } from '../../../../common/ScreenList';
import Entypo from 'react-native-vector-icons/Entypo';
import realmStore from '../../../../data/realm/RealmStore';
import dataManager from '../../../../data/DataManager';
import RetailToolbar from '../retailToolbar';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail';
import { ApiPath } from '../../../../data/services/ApiPath';
import { HTTPService, URL } from '../../../../data/services/HttpService';
import _, { map } from 'underscore';
import dialogManager from '../../../../components/dialog/DialogManager';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../../theme/Colors';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import moment from 'moment';
var Sound = require('react-native-sound');
import NetInfo from "@react-native-community/netinfo";

export default (props) => {

    const CASH = {
        Id: 0,
        UUID: randomUUID(),
        Name: I18n.t('tien_mat'),
        Value: "",
    }

    const dispatch = useDispatch();
    const [listMethod, setListMethod] = useState([CASH])
    const currentCommodity = useRef({})
    const [numberNewOrder, setNumberNewOrder] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [expand, setExpand] = useState(false)
    const [isQuickPayment, setIsQuickPayment] = useState(false)
    const [itemOrder, setItemOrder] = useState({})
    const [jsonContent, setJsonContent] = useState({})
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "gia_niem_yet", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "khach_le", Id: 0 })
    const [promotions, setPromotions] = useState([])
    const [listProducts, setListProducts] = useState([])
    const [totalQuantity, setTotalQuantity] = useState(0)
    const { already, syncRetail } = useSelector(state => {
        return state.Common
    });

    let serverEvents = null;


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
            if (serverEvents) serverEvents.removeAllListeners()
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    useEffect(() => {
        const getCommodityWaiting = async () => {
            serverEvents = await realmStore.queryServerEvents()
            let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
            newServerEvents = Object.values(newServerEvents)
            if (newServerEvents.length == 0) {
                let newSE = await createNewServerEvent()
                currentCommodity.current = (newSE)
            } else {
                setNumberNewOrder(newServerEvents.length)
                let lastIndex = newServerEvents.length - 1
                currentCommodity.current = JSON.parse(JSON.stringify(newServerEvents[lastIndex]))

            }
            console.log('currentCommodity.currentcurrentCommodity.current', currentCommodity.current);
            let jsonContent = JSON.parse(currentCommodity.current.JsonContent)
            setJsonContent(jsonContent)

        }
        getCommodityWaiting()
    }, [])

    useEffect(() => {
        if (syncRetail != false) {
            onClickSync()
            dispatch({ type: 'SYNCRETAIL', syncRetail: false })
        }
    }, [syncRetail])

    useEffect(() => {
        console.log('jsonContent.Partner', jsonContent.Partner);
        if (jsonContent.Partner && jsonContent.Partner.Id) {
            if (jsonContent.Partner.Id == currentCustomer.Id) return
            setCurrentCustomer(jsonContent.Partner)
        }
        else setCurrentCustomer({ Name: "khach_le", Id: 0 })

    }, [jsonContent.Partner])

    useEffect(() => {
        console.log('jsonContent.PriceBook', jsonContent.PriceBook);
        if (jsonContent.PriceBook && jsonContent.PriceBook.Id) {
            if (jsonContent.PriceBook.Id == currentPriceBook.Id) return
            setCurrentPriceBook(jsonContent.PriceBook)
        }
        else setCurrentPriceBook({ Name: "gia_niem_yet", Id: 0 })
    }, [jsonContent.PriceBook])


    useEffect(() => {
        const getPromotion = async () => {
            if (jsonContent && jsonContent.OrderDetails) {
                let list = []
                if (jsonContent.OrderDetails.length > 0) list = await dataManager.addPromotion(jsonContent.OrderDetails)
                setListProducts([...list])

            }
        }
        getPromotion()
    }, [jsonContent.OrderDetails])

    useEffect(() => {
        let totalQuantity = 0
        listProducts.forEach((elm, index) => {
            elm.index = index
            totalQuantity += elm.Quantity
        })
        setTotalQuantity(Math.round(totalQuantity * 1000) / 1000)
    }, [listProducts])



    const getOtherPriceList = async (list) => {
        console.log('getOtherPrice');
        if (currentPriceBook.Id) {
            if (list && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": list.map((product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                console.log('getOtherPrice list', res);
                if (res && res.PriceList && res.PriceList.length > 0) {
                    list.map((product) => {
                        res.PriceList.forEach((priceBook) => {
                            if (priceBook.ProductId == product.ProductId) {
                                if (product.Discount == 0) {
                                    product.DiscountRatio = 0.0
                                    product.Discount = 0
                                    if (!'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                    if (!'Price' in priceBook) priceBook.Price = product.UnitPrice
                                    let newBasePrice = (product.IsLargeUnit) ? priceBook.PriceLargeUnit : priceBook.Price
                                    product.Price = newBasePrice + product.TotalTopping
                                }
                            }
                        })
                    })
                    return list
                } else
                    return list
            }
        } else
            return list
    }


    const _keyboardDidShow = () => {
        // if (orientaition != Constant.PORTRAIT)
        setMargin(Metrics.screenWidth / 1.5)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }


    const createNewServerEvent = async () => {
        let newServerEvent = await dataManager.createSeverEvent(Date.now(), "A")
        newServerEvent.JsonContent = JSON.stringify(dataManager.createJsonContentForRetail(newServerEvent.RoomId))
        console.log('newServerEvent', newServerEvent);
        return realmStore.insertServerEventForRetail(newServerEvent)
    }


    // const sendOrder = async () => {
    //     console.log("sendOrder room ", props.route.params.room);
    //     props.navigation.navigate(ScreenList.Payment, { RoomId: props.route.params.room.Id, Name: props.route.params.room.Name, Position: props.Position });
    // }


    const notification = (content) => {
        setToastDescription(content);
        setShowToast(true)
    }


    const removeItem = (item, index) => {
        console.log('removeItem ', item.Name, item.index);
        listProducts.splice(index, 1)
        jsonContent.OrderDetails = [...listProducts]
        updateServerEvent({ ...jsonContent })
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
                        <View style={{ backgroundColor: "#ffedd6", padding: 7, paddingHorizontal: 10, marginVertical: 5 }}>
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khuyen_mai')}</Text>
                        </View>
                        : null
                }
                <TouchableOpacity key={index} onPress={() => {
                    if (isPromotion) return;
                    setItemOrder(item)
                    setShowModal(!showModal)
                }}>
                    <Surface style={[styles.mainItem, { elevation: 4 }]}>
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5 }}
                            onPress={() => { if (!isPromotion) removeItem(item, index) }}>
                            <Image source={!isPromotion ? Images.icon_trash : Images.icon_gift} style={{ width: 36, height: 36 }} />
                            {/* <Icon name={!isPromotion ? "trash-can-outline" : "gift"} size={40} color={!isPromotion ? "black" : Colors.colorLightBlue} /> */}
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <TextTicker
                                style={{ fontWeight: "bold", marginBottom: 7 }}
                                duration={6000}
                                marqueeDelay={1000}>
                                {item.Name}
                            </TextTicker>
                            <Text style={{ marginBottom: 7, fontSize: 12 }} >{item.Code}</Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{}}>{currencyToString(item.Price)} x </Text>
                                <View>
                                    <Text style={{ color: Colors.colorchinh }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
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
                    </Surface>
                </TouchableOpacity>
            </>
        )
    }


    const onClickListedPrice = () => {
        console.log('onClickListedPrice');
        props.navigation.navigate(ScreenList.PriceBook, { _onSelect: onCallBack, currentPriceBook: currentPriceBook })
    }



    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBack, currentCustomer: currentCustomer })
    }

    const onClickPrint = async () => {
        hideMenu()
        console.log("onClickProvisional jsonContent ", jsonContent);
        if (listProducts && listProducts.length > 0) {
            jsonContent.RoomName = I18n.t('don_hang');
            let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (setting && setting != "") {
                setting = JSON.parse(setting);
                if (setting.in_tam_tinh == false) {
                    dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
                    return;
                }
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
            let row_key = `${jsonContent.RoomId}_${jsonContent.Pos}`
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
        // if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
        //     jsonContent.RoomName = I18n.t('app_name');
        // // }
        //     dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContent, provisional: true } })
    }

    const onClickOptionQuickPayment = () => {
        setIsQuickPayment(!isQuickPayment)
    }

    const onCLickQR = () => {
        props.navigation.navigate("QRCode", { _onSelect: onCallBackNoteBookVsQRCode })
    }

    const onCLickNoteBook = () => {
        props.navigation.navigate("NoteBook", { _onSelect: onCallBackNoteBookVsQRCode })
    }

    const onClickSync = () => {
        console.log('onClickSync', props);
        props.syncForRetail()
    }

    const outputTextSearch = (text) => {
        console.log('outputTextSearch', text);
    }

    const onClickSelect = () => {
        let list = listProducts ? listProducts.filter(item => (item.ProductId > 0 && (item.IsPromotion == undefined || (item.IsPromotion == false)))) : []

        props.navigation.navigate(ScreenList.RetailSelectProduct, { _onSelect: onCallBack, listProducts: list })
    }



    const onCallBackNoteBookVsQRCode = async (newList, type) => {

        let allPromise = newList.map(async item => {
            let products = await realmStore.queryProducts()
            let productWithId = products.filtered(`Id ==${item.Id}`)
            productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
            return { ...productWithId, ...item, exist: false }
        })
        let list = await Promise.all(allPromise)
        listProducts.forEach(item => {
            list.forEach(elm => {
                if (item.Id == elm.Id && !item.SplitForSalesOrder) {
                    item.Quantity += elm.Quantity
                    elm.exist = true
                }
            })
        })
        list = list.filter((newItem) => !newItem.exist)
        // setListProducts([...list, ...listProducts])
        jsonContent.OrderDetails = [...list, ...listProducts]
        updateServerEvent({ ...jsonContent })

    }

    const onCallBack = async (data, type, numberCommodity) => {
        console.log('onCallBackonCallBack , data, type ', data, type);
        switch (type) {
            case 1: //from listPrice
                {
                    const getOtherPrice = async () => {
                        if (listProducts && data) {
                            let apiPath = ApiPath.PRICE_BOOK + `/${data.Id}/manyproductprice`
                            let params = { "pricebookId": data.Id, "ProductIds": listProducts.map((product) => product.ProductId) }
                            let res = await new HTTPService().setPath(apiPath).POST(params)
                            console.log('getOtherPrice res', res);
                            if (res && res.PriceList && res.PriceList.length > 0) {
                                listProducts.forEach((product) => {
                                    res.PriceList.forEach((priceBook) => {
                                        if (priceBook.ProductId == product.ProductId) {
                                            product.DiscountRatio = 0.0
                                            if (!'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                            if (!'Price' in priceBook) priceBook.Price = product.UnitPrice
                                            let newBasePrice = (product.IsLargeUnit) ? priceBook.PriceLargeUnit : priceBook.Price
                                            product.Price = newBasePrice + product.TotalTopping
                                        }
                                    })
                                })
                            } else {
                                listProducts.forEach((product) => {
                                    product.DiscountRatio = 0.0
                                    let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                                    product.Price = basePrice + product.TotalTopping
                                })
                            }
                            updateServerEvent({ ...jsonContent })
                        }
                    }

                    const getBasePrice = () => {
                        listProducts.forEach((product) => {
                            product.DiscountRatio = 0.0
                            let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                            product.Price = basePrice + product.TotalTopping
                        })
                        updateServerEvent({ ...jsonContent })
                    }
                    if (JSON.stringify(jsonContent) != "{}") {
                        if (data && data.Id) {
                            jsonContent.PriceBook = data
                            jsonContent.PriceBookId = data.Id
                            getOtherPrice()
                        } else {
                            jsonContent.PriceBookId = null
                            jsonContent.PriceBook = null
                            getBasePrice()
                        }
                    }
                    break
                }
            case 2: //from customer
                {
                    if (JSON.stringify(jsonContent) != "{}") {
                        if (data && data.Id) {
                            let apiPath = `${ApiPath.SYNC_PARTNERS}/${data.Id}`
                            new HTTPService().setPath(apiPath).GET()
                                .then(result => {
                                    if (result) {
                                        console.log('resultresult', result, jsonContent);
                                        // let discount = dataManager.totalProducts(listProducts) * result.BestDiscount / 100
                                        // console.log('discount', discount);
                                        jsonContent.DiscountRatio = result.BestDiscount
                                        jsonContent.Partner = data
                                        jsonContent.PartnerId = data.Id
                                        console.log('jsonContentjsonContent', jsonContent);
                                        updateServerEvent({ ...jsonContent })
                                    }
                                })

                        } else {
                            jsonContent.Partner = null
                            jsonContent.PartnerId = null
                            jsonContent.DiscountRatio = 0
                            jsonContent.DiscountValue = 0
                            updateServerEvent({ ...jsonContent })
                        }

                    }
                    break
                }

            case 3: //from commodity
                {
                    console.log('asdasdasdasdasd', data, type, numberCommodity);
                    currentCommodity.current = (data)
                    let jsonContent = JSON.parse(data.JsonContent)
                    setNumberNewOrder(numberCommodity)
                    updateServerEvent(jsonContent)
                    break
                }
            case 4: //from select products
                {
                    let newData = await getOtherPriceList(data)
                    jsonContent.OrderDetails = newData
                    updateServerEvent({ ...jsonContent })
                    break;
                }
            case 5:
                {
                    setNumberNewOrder(numberCommodity)
                    break;
                }
            default:
                break;
        }
    }

    const updateServerEvent = (jsonContentObj) => {

        if (currentCommodity.current) {
            let serverEvent = currentCommodity.current
            dataManager.calculatateJsonContent(jsonContentObj)
            currentCommodity.current.JsonContent = JSON.stringify(jsonContentObj)
            realmStore.insertServerEventForRetail(serverEvent)
            setJsonContent({ ...jsonContentObj })

        }
    }

    const onClickNewOrder = async () => {
        if (listProducts.length == 0) {
            setToastDescription(I18n.t("moi_chon_mon_truoc"))
            setShowToast(true)
            return
        }
        let newSE = await createNewServerEvent()
        currentCommodity.current = (newSE)
        setJsonContent(JSON.parse(newSE.JsonContent))
        setNumberNewOrder(numberNewOrder + 1)
    }

    const onCallBackPayment = (type, data) => {
        console.log("onCallBackPayment type ,data ", type, data);
        // setJsonContent(type == 1 ? { ...jsonContent, OrderDetails: [] } : { ...data })
        // setListOrder([])

        updateServerEvent({ ...data })
    }

    const onClickPayment = () => {
        if (listProducts && listProducts.length > 0) {
            if (isQuickPayment) {
                onClickQuickPayment()
            } else {
                props.navigation.navigate(ScreenList.Payment, { onCallBack: onCallBackPayment, Screen: ScreenList.MainRetail, RoomId: jsonContent.RoomId, Name: jsonContent.RoomName ? jsonContent.RoomName : I18n.t('don_hang'), Position: jsonContent.Pos });
            }
        } else {
            console.log('ban_hay_chon_mon_an_truoc');
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const onClickQuickPayment = async () => {
        console.log('onClickQuickPayment', jsonContent);
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        vendorSession = JSON.parse(vendorSession)
        let json = JSON.parse(JSON.stringify(jsonContent))
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
                if (order) {
                    dialogManager.hiddenLoading()

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
        let jsonContentObj = JSON.parse(JSON.stringify(jsonContent))
        console.log("printAfterPayment jsonContent 1 ", jsonContent);
        jsonContentObj.PaymentCode = Code;
        jsonContentObj.RoomName = I18n.t('don_hang');
        jsonContentObj.Pos = "A"
        console.log("printAfterPayment jsonContent 2 ", jsonContent);
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: jsonContentObj, provisional: false } })
    }

    const updateServerEventForPayment = async () => {
        let settingObject = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        settingObject = JSON.parse(settingObject)
        let json = dataManager.createJsonContent(jsonContent.RoomId, jsonContent.Pos, moment());
        updateServerEvent(json)
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

    const applyDialogDetail = (product) => {
        let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.UnitPrice
        let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
        discount = discount > price ? price : discount
        let discountRatio = product.Percent ? product.Discount : product.Discount / price * 100
        listProducts.forEach((elm, index, arr) => {
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
        // setListOrder([...listOrder])
        // setDataOrder([...listOrder].filter(item => item.Quantity > 0))
        listProducts.filter(item => item.Quantity > 0)
        jsonContent.OrderDetails = [...listProducts]
        updateServerEvent({ ...jsonContent })
    }

    return (
        <View style={{ flex: 1 }}>
            <RetailToolbar
                {...props}
                onClickSelect={onClickSelect}
                onCLickQR={onCLickQR}
                onCLickNoteBook={onCLickNoteBook}
                onClickSync={onClickSync}
                outputTextSearch={outputTextSearch} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 5 }}>
                <Surface style={{ marginRight: 5, elevation: 4, flex: 1, borderRadius: 5 }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'column', alignItems: "center", backgroundColor: 'white', paddingTop: 5, borderRadius: 5 }}
                        onPress={onClickListedPrice}>
                        <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} />
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ padding: 5 }}>{currentPriceBook.Id == 0 ? I18n.t(currentPriceBook.Name) : currentPriceBook.Name}</Text>
                    </TouchableOpacity>
                </Surface>
                <Surface style={{ marginLeft: 5, elevation: 4, flex: 1, borderRadius: 5 }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'column', alignItems: "center", backgroundColor: 'white', paddingTop: 5, borderRadius: 5 }}
                        onPress={onClickRetailCustomer}>
                        <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} />
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ textAlign: "right", padding: 5 }}>{currentCustomer.Id == 0 ? I18n.t(currentCustomer.Name) : currentCustomer.Name}</Text>

                    </TouchableOpacity>
                </Surface>
            </View>
            <View style={{ flex: 1, paddingVertical: 5 }}>
                {listProducts != undefined && listProducts.length > 0 ?
                    <FlatList
                        data={listProducts}
                        extraData={listProducts}
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
                    style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "#FFE9CC", marginLeft: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontWeight: "bold", marginRight: 10 }}>{I18n.t('tong_thanh_tien')}</Text>
                            <View style={{ padding: 5, borderWidth: 1, borderColor: "black", borderRadius: 10, backgroundColor: "white", }}>
                                <Text style={{ fontWeight: "bold", }}>{totalQuantity}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{currencyToString(jsonContent.Total + jsonContent.Discount - jsonContent.VAT)} đ</Text>
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
            <View style={{ height: 40, flexDirection: "row", backgroundColor: colors.colorchinh, alignItems: "center" }}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        style={{ width: 220 }}
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 5 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5
                        }}>
                            <TouchableOpacity onPress={() => onClickPrint()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="printer" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16, flex: 1 }}>{I18n.t('in_tam_tinh')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickOptionQuickPayment()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name={isQuickPayment ? "checkbox-marked" : "close-box-outline"} size={26} color={isQuickPayment ? Colors.colorLightBlue : "grey"} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('thanh_toan_nhanh')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.navigation.navigate(ScreenList.CommodityWaiting, { _onSelect: onCallBack })
                }} style={{ flex: .5, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%", flexDirection: 'row' }}>
                    <Icon name="file-document-edit-outline" size={30} color="white" />
                    <View style={{ backgroundColor: colors.colorLightBlue, borderRadius: 40, position: "absolute", right: 10, top: -5 }}>
                        <Text style={{ fontWeight: "bold", padding: 4, color: 'white', fontSize: 14 }}>{numberNewOrder}</Text>
                    </View>
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
                            // marginBottom: Platform.OS == 'ios' ? Metrics.screenHeight / 2.5 : 0
                            marginBottom: Platform.OS == 'ios' ? marginModal : 0
                        }}>
                            <DialogProductDetail
                                fromRetail={true}
                                priceBookId={jsonContent.PriceBookId ? jsonContent.PriceBookId : null}
                                item={itemOrder}
                                onClickSubmit={data => { applyDialogDetail(data) }}
                                setShowModal={() => {
                                    setShowModal(false)
                                }}
                            />
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
        height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center"
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

