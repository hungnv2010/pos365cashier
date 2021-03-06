import React, { useLayoutEffect, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Modal, } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import ToolBarPhoneServed from '../../../../components/toolbar/ToolBarPhoneServed';
import I18n from '../../../../common/language/i18n';
import signalRManager from '../../../../common/SignalR';
import { Constant } from '../../../../common/Constant';
import { Snackbar, Surface } from 'react-native-paper';
import realmStore from '../../../../data/realm/RealmStore';
import { useDispatch } from 'react-redux';
import colors from '../../../../theme/Colors';
import dataManager from '../../../../data/DataManager';
import { ApiPath } from '../../../../data/services/ApiPath';
import { HTTPService } from '../../../../data/services/HttpService';
import _, { map } from 'underscore';
import { ScreenList } from '../../../../common/ScreenList';
import { currencyToString, dateToString } from '../../../../common/Utils';
import moment from 'moment';
import { log } from 'react-native-reanimated';
import ProductManager from '../../../../data/objectManager/ProductManager'

export default (props) => {

    let serverEvent = null;
    const currentServerEvent = useRef({})

    const [jsonContent, setJsonContent] = useState({})
    const [promotions, setPromotions] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState('A')
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "gia_niem_yet", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "khach_le", Id: 0 })
    const toolBarPhoneServedRef = useRef();
    const listCooked = useRef([])
    const [listPosition, setListPosition] = useState([
        { name: "A", status: false },
        { name: "B", status: false },
        { name: "C", status: false },
        { name: "D", status: false },
    ])
    const dispatch = useDispatch();


    const reloadTime = () => {
        // alert("ok")
    }

    useEffect(() => {
        let listener = async (collection, changes) => {
            if ((changes.insertions.length || changes.modifications.length) && serverEvent[0].FromServer) {
                currentServerEvent.current = JSON.parse(JSON.stringify(serverEvent[0]))
                let jsonTmp = JSON.parse(serverEvent[0].JsonContent)
                jsonTmp.OrderDetails = await dataManager.addPromotion(jsonTmp.OrderDetails);
                jsonTmp.RoomName = jsonTmp.RoomName ? jsonTmp.RoomName : props.route.params.room.Name
                console.log("jsonTmp ======= ", jsonTmp);
                setJsonContent(jsonTmp)
            }
        }

        const getListPos = async () => {
            serverEvent = await realmStore.queryServerEvents()
            const row_key = `${props.route.params.room.Id}_${position}`
            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)
            let hasServerEvent = JSON.stringify(serverEvent) != "{}"
            currentServerEvent.current = hasServerEvent ? JSON.parse(JSON.stringify(serverEvent[0]))
                : await dataManager.createSeverEvent(props.route.params.room.Id, position)
            console.log('currentServerEvent.current', currentServerEvent.current);

            let jsonContentObject = currentServerEvent.current.JsonContent && currentServerEvent.current.JsonContent != "{}" && JSON.parse(currentServerEvent.current.JsonContent).OrderDetails.length > 0 ? JSON.parse(currentServerEvent.current.JsonContent) : dataManager.createJsonContent(props.route.params.room.Id, position, moment())
            currentServerEvent.current.JsonContent = JSON.stringify(jsonContentObject)
            jsonContentObject.OrderDetails = await dataManager.addPromotion(jsonContentObject.OrderDetails);
            jsonContentObject.RoomName = jsonContentObject.RoomName ? jsonContentObject.RoomName : props.route.params.room.Name
            console.log('jsonContentObject = 2', jsonContentObject);
            setJsonContent(jsonContentObject)
            serverEvent.addListener(listener)
        }

        const getDataRealm = async () => {
            let promotions = await realmStore.querryPromotion();
            console.log("promotions === ", promotions);
            setPromotions(promotions)
        }
        getDataRealm();

        getListPos()

        return () => {
            if (serverEvent) serverEvent.removeListener(listener)
        }
    }, [position])


    useEffect(() => {
        console.log('jsonContent.Partner', jsonContent.Partner);
        if (jsonContent.Partner && jsonContent.Partner.Id != 0) {
            if (jsonContent.Partner.Id == currentCustomer.Id) return
            setCurrentCustomer(jsonContent.Partner)
        }
        else setCurrentCustomer({ Name: "khach_le", Id: 0 })

    }, [jsonContent.Partner])

    // useEffect(() => {
    //     console.log('jsonContent.PriceBook', jsonContent.PriceBook);
    //     if (jsonContent.PriceBook && jsonContent.PriceBook.Id) {
    //         if (jsonContent.PriceBook.Id == currentPriceBook.Id) return
    //         setCurrentPriceBook(jsonContent.PriceBook)
    //     }
    //     else setCurrentPriceBook({ Name: "gia_niem_yet", Id: 0 })
    // }, [jsonContent.PriceBook])

    useEffect(() => {
        if (jsonContent.PriceBookId && jsonContent.PriceBookId != 0) {
            const getPriceBook = async () => {
                let priceBook = null
                let listPriceBook = await realmStore.queryPricebook()
                listPriceBook.forEach(item => {
                    if (item.Id == jsonContent.PriceBookId) priceBook = item
                })
                return priceBook
            }
            const savePriceBook = async () => {
                let pricebook = await getPriceBook()
                if (pricebook) setCurrentPriceBook(pricebook)
            }
            savePriceBook()
        } else {
            setCurrentPriceBook({ Name: "gia_niem_yet", Id: 0 })
        }

    }, [jsonContent.PriceBookId])


    const getOtherPrice = async (list) => {
        console.log('getOtherPrice', list, currentPriceBook, jsonContent);
        if (currentPriceBook.Id) {
            if (list && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": list.map((product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                console.log('resres', res);
                if (res && res.PriceList && res.PriceList.length > 0) {
                    list.map((product) => {
                        res.PriceList.forEach((priceBook) => {
                            if (priceBook.ProductId == product.ProductId) {
                                if (product.Discount == 0) {
                                    product.DiscountRatio = 0.0
                                    product.Discount = 0
                                    if (! 'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                    if (! 'Price' in priceBook) priceBook.Price = product.UnitPrice
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


    const outputListProducts = async (list, replace = true) => {
        console.log('outputListProducts', list, listCooked.current);
        if (props.route.params.room.ProductId) {
            let ischeck = false;
            list.forEach(element => {
                if (element.Id == props.route.params.room.ProductId) {
                    ischeck = true;
                }
            });
            toolBarPhoneServedRef.current.clickCheckInRef(!ischeck)
        }
        list = await getOtherPrice(list)
        list = await dataManager.addPromotion(list);
        if (JSON.stringify(jsonContent) != "{}" && jsonContent.OrderDetails.length > 0) {
            if (replace) {
                jsonContent.OrderDetails = [...list]
                updateServerEvent({ ...jsonContent })
            } else {
                let listTmp = []
                list = await getOtherPrice(list)
                list.forEach(item => {
                    if (item.SplitForSalesOrder || (item.ProductType == 2 && item.IsTimer)) {
                        if (item.IsTimer) ProductManager.getProductTimePrice(item)
                        listTmp.push(item)
                    } else {
                        let pos = listCooked.current.map(elm => elm.Id).indexOf(item.Id);
                        if (pos >= 0) {
                            listCooked.current[pos].Quantity += item.Quantity
                        } else {
                            listTmp.push(item)
                        }

                    }
                })
                let title = props.route.params.room.Name ? props.route.params.room.Name : ""
                jsonContent.OrderDetails = [...listCooked.current, ...listTmp]
                updateServerEvent({ ...jsonContent })
            }

        } else {
            list.forEach(item => {
                if (item.ProductType == 2 && item.IsTimer) ProductManager.getProductTimePrice(item)
            })
            let title = props.route.params.room.Name ? props.route.params.room.Name : ""
            let body = I18n.t('gio_khach_vao') + moment().format('HH:mm DD/MM')
            let { RoomId, Position } = currentServerEvent.current
            let jsonContentObj = JSON.stringify(jsonContent) == "{}" ? dataManager.createJsonContent(RoomId, Position, moment(), title) : jsonContent
            jsonContentObj.OrderDetails = [...list]
            jsonContentObj.ActiveDate = moment()
            updateServerEvent(jsonContentObj)
            dataManager.sentNotification(title, body)

        }
    }

    const setNewOrderDetails = (listProduct) => {
        jsonContent.OrderDetails = [...listProduct]

        checkRoomProductId(listProduct, props.route.params.room.ProductId)

        updateServerEvent({ ...jsonContent }, 0)
    }

    // const addPromotion = async (list = []) => {
    //     console.log("addPromotion list ", list);
    //     console.log("addPromotion promotions ", promotions);
    //     let promotionTmp = promotions
    //     if (promotions.length == 0) {
    //         let promotion = await realmStore.querryPromotion();
    //         // console.log("realmStore promotion === ", promotion);
    //         promotionTmp = promotion
    //         setPromotions(promotion)
    //     }
    //     let listProduct = await realmStore.queryProducts()
    //     let listNewOrder = list.filter(element => (element.IsPromotion == undefined || (element.IsPromotion == false)))
    //     let listOldPromotion = list.filter(element => (element.IsPromotion != undefined && (element.IsPromotion == true)))
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
    //     // let listGroupByQuantity = DataGrouper.sum(listNewOrder, ["Id", "IsLargeUnit"])
    //     let listGroupByQuantity = DataGrouper.sum(listNewOrder, ["ProductId", "IsLargeUnit"])
    //     let listPromotion = [];
    //     let index = 0;
    //     listGroupByQuantity.forEach(element => {
    //         promotionTmp.forEach(async (item) => {
    //             if (item.QuantityCondition > 0 && (element.IsPromotion == undefined || (element.IsPromotion == false)) && element.ProductId == item.ProductId && checkEndDate(item.EndDate) && (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition)) {
    //                 let promotion = listProduct.filtered(`Id == ${item.ProductPromotionId}`)
    //                 promotion = promotion[0] != undefined ? JSON.parse(JSON.stringify(promotion[0])) : {};
    //                 if (JSON.stringify(promotion) == '{}') {
    //                     promotion = JSON.parse(item.Promotion);
    //                 }
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

    const updateServerEvent = (jsonContent, versionIncrease = 1) => {
        if (currentServerEvent.current) {
            let serverEvent = currentServerEvent.current
            dataManager.calculatateJsonContent(jsonContent)
            console.log('jsonContentjsonContent', jsonContent);
            setJsonContent({ ...jsonContent })
            serverEvent.Version += versionIncrease
            dataManager.updateServerEvent(serverEvent, jsonContent)
        }
    }

    const onClickNoteBook = () => {
        props.navigation.navigate('NoteBook', { _onSelect: onCallBack })
    }

    const onClickQRCode = () => {
        props.navigation.navigate('QRCode', { _onSelect: onCallBack })
    }

    const onClickProductService = async () => {
        let results = await realmStore.queryProducts()
        if (results) {
            results = results.filtered(`Id = "${props.route.params.room.ProductId}"`)
            if (results && results.length > 0) {
                results = JSON.parse(JSON.stringify(results))
                console.log("outputClickProductService results ", [results["0"]]);
                results["0"]["Quantity"] = 1;
                toolBarPhoneServedRef.current.clickCheckInRef()
                onCallBack([results["0"]], 2)
            }
        }
    }

    const onClickSelectProduct = () => {
        let listUnCooked = []
        listCooked.current = []
        let list = jsonContent.OrderDetails ? jsonContent.OrderDetails.filter(item => (item.ProductId > 0 && (item.IsPromotion == undefined || (item.IsPromotion == false)))) : []
        list.forEach(item => {
            if (item.Processed > 0) {
                listCooked.current.push({ ...item, Quantity: item.Processed })
            }
            if (item.Quantity > item.Processed) {
                listUnCooked.push({ ...item, Quantity: item.Quantity - item.Processed, Processed: 0 })
            }
        })
        console.log('listUnCooked', listUnCooked, listCooked.current);
        props.navigation.navigate('SelectProduct', { _onSelect: onCallBack, listProducts: listUnCooked })
    }

    //type: 1 => from selectProduct
    //type: 2 => from noteBook, QRCode
    const onCallBack = async (newList, type) => {
        console.log('onCallBack === ', newList, type);
        switch (type) {
            case 1:
                newList = newList.filter(item => item.Quantity > 0)
                // if (newList.length == 0) {
                //     newList.push({ Id: -1, Quantity: 1 })
                // }
                outputListProducts([...newList], false)
                break;
            case 2:
                let allPromise = newList.map(async item => {
                    let products = await realmStore.queryProducts()
                    let productWithId = products.filtered(`Id ==${item.Id}`)
                    productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
                    return { ...productWithId, ...item, exist: false }
                })
                let list = await Promise.all(allPromise)
                if (!jsonContent.OrderDetails) jsonContent.OrderDetails = []
                jsonContent.OrderDetails.forEach(item => {
                    list.forEach(elm => {
                        if (item.Id == elm.Id && !item.SplitForSalesOrder) {
                            item.Quantity += elm.Quantity
                            elm.exist = true
                        }
                    })
                })
                list = list.filter((newItem) => !newItem.exist)
                outputListProducts([...list, ...jsonContent.OrderDetails], false)
                break;
            default:
                break;
        }
        checkRoomProductId(newList, props.route.params.room.ProductId)
    }


    const selectPosition = (position) => {
        setPosition(position)
        setShowModal(false);
    }

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = (position) => {
        _menu.hide();
        selectPosition(position)
    };

    const showMenu = async () => {
        _menu.show();
        let serverEvent = await realmStore.queryServerEvents()
        listPosition.forEach((item, index) => {
            const row_key = `${props.route.params.room.Id}_${item.name}`
            let serverEventPos = serverEvent.filtered(`RowKey == '${row_key}'`)
            if (JSON.stringify(serverEventPos) != "{}" && serverEventPos[0].JsonContent && JSON.parse(serverEventPos[0].JsonContent).OrderDetails && JSON.parse(serverEventPos[0].JsonContent).OrderDetails.length > 0) {
                item.status = true
            } else {
                item.status = false
            }
        })
        setListPosition([...listPosition])
    };

    const checkRoomProductId = (listProduct, Id) => {
        console.log("checkRoomProductId id ", Id);

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.Id == Id })
            console.log("checkRoomProductId listProduct ", list);
            setTimeout(() => {
                list.length > 0 ? toolBarPhoneServedRef.current.clickCheckInRef(false) : toolBarPhoneServedRef.current.clickCheckInRef(true)
            }, 500);
        }
    }

    const onClickListedPrice = () => {
        props.navigation.navigate(ScreenList.PriceBook, { _onSelect: onCallBackPriceCustomer, currentPriceBook: currentPriceBook, })
    }


    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBackPriceCustomer, currentCustomer: currentCustomer })
    }

    const onCallBackPriceCustomer = (data, type) => {
        switch (type) {
            case 1:
                {
                    // if (data) setCurrentPriceBook(data)
                    const getOtherPrice = async () => {
                        if (jsonContent.OrderDetails && data) {
                            let apiPath = ApiPath.PRICE_BOOK + `/${data.Id}/manyproductprice`
                            let params = { "pricebookId": data.Id, "ProductIds": jsonContent.OrderDetails.map((product) => product.ProductId) }
                            let res = await new HTTPService().setPath(apiPath).POST(params)
                            console.log('getOtherPrice res', res);
                            if (res && res.PriceList && res.PriceList.length > 0) {
                                jsonContent.OrderDetails.forEach((product) => {
                                    res.PriceList.forEach((priceBook) => {
                                        if (priceBook.ProductId == product.ProductId) {
                                            product.DiscountRatio = 0.0
                                            product.Discount = 0
                                            if (! 'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                            if (! 'Price' in priceBook) priceBook.Price = product.UnitPrice
                                            let newBasePrice = (product.IsLargeUnit) ? priceBook.PriceLargeUnit : priceBook.Price
                                            product.Price = newBasePrice + product.TotalTopping
                                        }
                                    })
                                })
                            } else {
                                jsonContent.OrderDetails.forEach((product) => {
                                    product.DiscountRatio = 0.0
                                    product.Discount = 0
                                    let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                                    product.Price = basePrice + product.TotalTopping
                                })
                            }
                            updateServerEvent({ ...jsonContent })
                        }
                    }

                    const getBasePrice = () => {
                        console.log('getBasePrice');
                        jsonContent.OrderDetails.forEach((product) => {
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
                    break;
                }
            case 2:
                {
                    // if (data) setCurrentCustomer(data)
                    if (JSON.stringify(jsonContent) != "{}") {
                        if (data && data.Id) {
                            let apiPath = `${ApiPath.SYNC_PARTNERS}/${data.Id}`
                            new HTTPService().setPath(apiPath).GET()
                                .then(result => {
                                    if (result) {
                                        console.log('resultresult', result, jsonContent);
                                        // let discount = dataManager.totalProducts(jsonContent.OrderDetails) * result.BestDiscount / 100
                                        // console.log('discount', discount);
                                        jsonContent.DiscountRatio = result.BestDiscount
                                        jsonContent.Partner = data
                                        jsonContent.PartnerId = data.Id
                                        console.log('jsonContentjsonContent', jsonContent);
                                        updateServerEvent({ ...jsonContent })
                                    }
                                })

                        } else {
                            console.log('no data');
                            jsonContent.Partner = null
                            jsonContent.PartnerId = null
                            jsonContent.DiscountRatio = 0
                            jsonContent.DiscountValue = 0
                            updateServerEvent({ ...jsonContent })
                        }

                    }
                    break;
                }
            default:
                break;
        }
    }

    const handlerProcessedProduct = (jsonContent) => {
        console.log("handlerProcessedProduct jsonContent ", jsonContent);
        if (currentServerEvent.current) {
            let serverEvent = currentServerEvent.current
            dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({ ...jsonContent })
            serverEvent.Version += 1
            dataManager.updateServerEvent(serverEvent, jsonContent)
        }
    }

    return (
        <View style={{ flex: 1, }}>
            <ToolBarPhoneServed
                ref={toolBarPhoneServedRef}
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('don_hang')}
                clickLeftIcon={() => { props.navigation.goBack() }}
                clickNoteBook={onClickNoteBook}
                clickQRCode={onClickQRCode}
                rightIcon="plus"
                clickProductService={onClickProductService}
                clickRightIcon={onClickSelectProduct} />
            <View style={{ flex: 1 }}>
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
                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, }}>
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <Text style={{ paddingLeft: 20, textTransform: "uppercase", fontWeight: "bold" }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                    </View>
                    <TouchableOpacity onPress={showMenu} style={{ flex: 1, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                        <Menu
                            style={{ width: 50 }}
                            ref={setMenuRef}
                            button={<Text style={{ fontWeight: "bold" }} onPress={showMenu}>{I18n.t('vi_tri')} {position}</Text>}
                        >
                            {
                                listPosition.map(item => <MenuItem key={item.name} onPress={() => hideMenu(item.name)}>{item.name} {item.status ? <Text style={{ color: Colors.colorchinh }}>*</Text> : null}</MenuItem>)
                            }

                        </Menu>
                        <Icon style={{}} name="chevron-down" size={20} />
                    </TouchableOpacity>
                </View>
                <CustomerOrder
                    {...props}
                    Position={position}
                    jsonContent={jsonContent}
                    outputListProducts={outputListProducts}
                    handlerProcessedProduct={(jsonContent) => handlerProcessedProduct(jsonContent)}
                    outPutSetNewOrderDetail={setNewOrderDetails}
                    updateServerEvent={updateServerEvent} />
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
        </View >
    );
}
