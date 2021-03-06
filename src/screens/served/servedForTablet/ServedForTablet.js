import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { View, NativeModules, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Menu, { MenuItem } from 'react-native-material-menu';
import { useSelector } from 'react-redux';
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import Topping from './Topping';
import realmStore from '../../../data/realm/RealmStore';
import { Constant } from '../../../common/Constant';
import ViewPrint from '../../more/ViewPrint';
const { Print } = NativeModules;
import dataManager from '../../../data/DataManager'
import moment from 'moment';
import I18n from '../../../common/language/i18n';
import colors from '../../../theme/Colors';
import { Colors } from '../../../theme';
import CustomerOrder from './pageServed/CustomerOrder';
import { ApiPath } from '../../../data/services/ApiPath';
import { HTTPService } from '../../../data/services/HttpService';
import { ScreenList } from '../../../common/ScreenList';
import _, { map } from 'underscore';
import ProductManager from '../../../data/objectManager/ProductManager'
import { getFileDuLieuString, setFileLuuDuLieu } from "../../../data/fileStore/FileStorage";

const Served = (props) => {
    let serverEvent = null;
    const currentServerEvent = useRef({})

    const [position, setPosition] = useState('A')
    const [listPosition, setListPosition] = useState([
        { name: "A", status: false },
        { name: "B", status: false },
        { name: "C", status: false },
        { name: "D", status: false },
    ])
    const [jsonContent, setJsonContent] = useState({})

    const [data, setData] = useState("");
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "gia_niem_yet", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "khach_le", Id: 0 })
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const [promotions, setPromotions] = useState([])
    const [objSetting, setObjSetting] = useState({})
    const toolBarTabletServedRef = useRef();
    const listPriceBookRef = useRef({})
    const {orientaition, orderScreen} = useSelector(state => {
        return state.Common
    });

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = (position) => {
        setPosition(position)
        _menu.hide();
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

    useEffect(() => {
        console.log("param Per",props.route.params.allPer);
        const getDataRealm = async () => {
            let promotions = await realmStore.querryPromotion();
            console.log("promotions === ", promotions);
            setPromotions(promotions)
             let obj = await getFileDuLieuString(Constant.OBJECT_SETTING,true)
             obj = JSON.parse(obj)
             setObjSetting(obj)
        }
        getDataRealm();
    }, [])

    useEffect(() => {
        let listener = async (collection, changes) => {
            if ((changes.insertions.length || changes.modifications.length) && serverEvent[0].FromServer) {
                currentServerEvent.current = JSON.parse(JSON.stringify(serverEvent[0]))
                let jsonTmp = JSON.parse(serverEvent[0].JsonContent)
                jsonTmp.OrderDetails = await dataManager.addPromotion(jsonTmp.OrderDetails);
                jsonTmp.RoomName = jsonTmp.RoomName ? jsonTmp.RoomName : props.route.params.room.Name
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
            let jsonContentObject = currentServerEvent.current.JsonContent && currentServerEvent.current.JsonContent != "{}" && JSON.parse(currentServerEvent.current.JsonContent).OrderDetails.length > 0 ? JSON.parse(currentServerEvent.current.JsonContent) : dataManager.createJsonContent(props.route.params.room.Id, position, moment(), [], props.route.params.room.Name)
            currentServerEvent.current.JsonContent = JSON.stringify(jsonContentObject)
            jsonContentObject.OrderDetails = await dataManager.addPromotion(jsonContentObject.OrderDetails);
            jsonContentObject.RoomName = jsonContentObject.RoomName ? jsonContentObject.RoomName : props.route.params.room.Name
            setJsonContent(jsonContentObject)
            serverEvent.addListener(listener)
        }

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

    const getOtherPrice = async (product) => {
        if (currentPriceBook.Id) {
            let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
            let params = { "pricebookId": currentPriceBook.Id, "ProductIds": [product.ProductId] }
            let res = await new HTTPService().setPath(apiPath).POST(params)
            if (res && res.PriceList && res.PriceList.length > 0) {
                res.PriceList.forEach((priceBook) => {
                    if (priceBook.ProductId == product.ProductId) {
                        product.DiscountRatio = 0.0
                        if (!'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                        if (!'Price' in priceBook) priceBook.Price = product.UnitPrice
                        let newBasePrice = (product.IsLargeUnit) ? priceBook.PriceLargeUnit : priceBook.Price
                        product.Price = newBasePrice + product.TotalTopping
                    }
                })
                return product
            } else
                return product
        } else
            return product
    }

    const outputSelectedProduct = async (product, replace = false) => {
        let jsonContentTmp = JSON.parse(JSON.stringify(jsonContent))
        console.log('outputSelectedProduct', product, jsonContentTmp, props);
        if (product.Quantity > 0 && !replace) {
            if (jsonContentTmp.OrderDetails.length == 0) {
                let title = props.route.params.room.Name ? props.route.params.room.Name : ""
                let body = I18n.t('gio_khach_vao') + moment().format('HH:mm DD/MM')
                jsonContentTmp.ActiveDate = moment()
                dataManager.sentNotification(title, body)
            }
            if (product.SplitForSalesOrder || (product.ProductType == 2 && product.IsTimer)) {
                product = await getOtherPrice(product)
                {
                    if (product.IsTimer) ProductManager.getProductTimePrice(product)
                    jsonContentTmp.OrderDetails.unshift(product)
                }
            } else {
                let isExist = false
                jsonContentTmp.OrderDetails.forEach(elm => {
                    if (!elm.IsPromotion && elm.ProductId == product.ProductId) {
                        isExist = true
                        elm.Quantity += product.Quantity
                        elm.Quantity = Math.round(elm.Quantity * 1000) / 1000
                        return;
                    }
                })
                if (!isExist) {
                    product = await getOtherPrice(product)
                    jsonContentTmp.OrderDetails.unshift(product)
                }
            }
        } else if (product.Quantity > 0 && replace) {
            jsonContentTmp.OrderDetails = jsonContentTmp.OrderDetails.map((elm, index) => {
                if (elm.ProductId == product.ProductId && index == product.index) elm = product
                return elm
            })
        } else {
            jsonContentTmp.OrderDetails = jsonContentTmp.OrderDetails
                .filter((elm, index) => index != product.index)
        }
        checkRoomProductId([product], props.route.params.room.ProductId)

        console.log("outputSelectedProduct jsonContent.OrderDetails ", jsonContentTmp.OrderDetails);
        checkHasItemOrder(jsonContentTmp.OrderDetails)
        jsonContentTmp.OrderDetails = await dataManager.addPromotion(jsonContentTmp.OrderDetails, promotions);
        updateServerEvent({ ...jsonContentTmp })
    }

    const outputListProducts = async (newList, type) => {
        console.log('outputListProducts=======', type, newList);
        newList = newList.filter(item => item.Quantity > 0)
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
        jsonContent.OrderDetails = [...list, ...jsonContent.OrderDetails]


        // checkHasItemOrder(newList)
        checkRoomProductId(newList, props.route.params.room.ProductId)
        updateServerEvent({ ...jsonContent })
    }

    const setNewOrderDetails = (listProduct) => {
        jsonContent.OrderDetails = [...listProduct]

        // checkHasItemOrder(listProduct)
        checkRoomProductId(listProduct, props.route.params.room.ProductId)

        updateServerEvent({ ...jsonContent })
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
    //                 let quantity = Math.floor(element.Quantity / item.QuantityCondition) * item.QuantityPromotion
    //                 promotion.Quantity = quantity
    //                 if (listOldPromotion.length > 0) {
    //                     let oldPromotion = listOldPromotion.filter(el => promotion.Id == el.Id)
    //                     if (oldPromotion.length == 1) {
    //                         promotion = oldPromotion[0];
    //                         promotion.FisrtPromotion = false
    //                         promotion.Quantity = quantity;
    //                     }
    //                 }
    //                 if (index == 0)
    //                     promotion.FisrtPromotion = true
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

    const checkEndDate = (date) => {
        let endDate = new Date(date)
        let currentDate = new Date();
        console.log("currentDate endDate ", currentDate, endDate);
        if (endDate.getTime() > currentDate.getTime()) {
            return true;
        }
        return true;
    }

    const updateServerEvent = (jsonContent, versionIncrease = 1) => {
        if (currentServerEvent.current) {
            let serverEvent = currentServerEvent.current
            dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({ ...jsonContent })
            serverEvent.Version += versionIncrease
            dataManager.updateServerEvent(serverEvent, jsonContent)
        }
    }

    const outputTextSearch = (text) => {
        setValue(text)
    }

    const outputItemOrder = (item) => {
        setItemOrder(item)
    }

    const outputPosition = (position) => {
        setPosition(position)
    }

    const outputListTopping = (listTopping) => {
        setListTopping(listTopping)
    }

    const onClickListedPrice = () => {
        props.navigation.navigate(ScreenList.PriceBook, { _onSelect: onCallBack, currentPriceBook: currentPriceBook })
    }


    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBack, currentCustomer: currentCustomer })
    }

    const onCallBack = (data, type) => {
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
                                            // let basePrice = product.IsLargeUnit ? product.PriceLargeUnit : product.UnitPrice
                                            // let hasDiscount = product.Discount != 0 || product.DiscountRatio != 0
                                            // if (product.Price - product.TotalTopping != basePrice && hasDiscount) {

                                            // }
                                            product.DiscountRatio = 0.0
                                            product.Discount = 0
                                            if (!'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                            if (!'Price' in priceBook) priceBook.Price = product.UnitPrice
                                            let newBasePrice = (product.IsLargeUnit) ? priceBook.PriceLargeUnit : priceBook.Price
                                            console.log('newBasePrice', newBasePrice);
                                            product.Price = newBasePrice + product.TotalTopping
                                            console.log('newBasePrice product', product);
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
                    console.log('jsonContentjsonContent', jsonContent);
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

                    break;
                }

            default:
                break;
        }
    }


    const outputClickProductService = async () => {
        let results = await realmStore.queryProducts()
        if (results) {
            results = results.filtered(`Id = "${props.route.params.room.ProductId}"`)
            if (results && results.length > 0) {
                results = JSON.parse(JSON.stringify(results))
                console.log("outputClickProductService results ", [results["0"]]);
                results["0"]["Quantity"] = 1;
                outputListProducts([results["0"]], 2)
                toolBarTabletServedRef.current.clickCheckInRef()
            }
        }
    }

    const checkRoomProductId = (listProduct, Id) => {

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.ProductId == Id })
            setTimeout(() => {
                list.length > 0 ? toolBarTabletServedRef.current.clickCheckInRef(false) : toolBarTabletServedRef.current.clickCheckInRef(true)
            }, 500);
        }
    }

    const checkHasItemOrder = (newList) => {
        let exist = false
        newList.forEach((item, index) => {
            if (item.ProductId == itemOrder.ProductId && (itemOrder.index == undefined || index == itemOrder.index)) {
                exist = true
            }
        })
        if (!exist) {
            setItemOrder({})
        }
    }

    const viewPrintRef = useRef();

    const handlerProcessedProduct = (jsonContent) => {
        console.log("handlerProcessedProduct jsonContent ", jsonContent);
        updateServerEvent(jsonContent)
    }

    return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 3 }}>
                <ViewPrint
                    ref={viewPrintRef}
                    html={data}
                    callback={(uri) => {
                        console.log("callback uri ", uri)
                        Print.printImageFromClient([uri + ""])
                    }}
                />
                <ToolBarServed
                    {...props}
                    ref={toolBarTabletServedRef}
                    outputClickProductService={outputClickProductService}
                    navigation={props.navigation}
                    outputListProducts={outputListProducts}
                    outputTextSearch={outputTextSearch} />
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 6, }}>
                        <View style={!itemOrder.ProductId ? { flex: 1 } : { width: 0, height: 0 }}>
                            <SelectProduct
                                valueSearch={value}
                                numColumns={orientaition == Constant.LANDSCAPE ? (orderScreen.size ? orderScreen.size : 3) : 2}
                                listProducts={jsonContent.OrderDetails ? [...jsonContent.OrderDetails] : []}
                                outputSelectedProduct={outputSelectedProduct} />
                        </View>

                        <View style={itemOrder.ProductId ? { flex: 1 } : { width: 0, height: 0 }}>
                            <Topping
                                {...props}
                                position={position}
                                itemOrder={meMoItemOrder}
                                onClose={() => { setItemOrder({}) }}
                                outputListTopping={outputListTopping}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ flex: 2, borderLeftWidth: 0.5, borderLeftColor: 'gray' }}>
                <View style={{ backgroundColor: 'white', alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderBottomColor: "gray", borderBottomWidth: 0.5, height: 44 }}>
                    <View style={{ flex: 1, justifyContent: "center", }}>
                        <Text style={{ paddingLeft: 20, textTransform: "uppercase", fontSize: 16, fontWeight: 'bold' }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                    </View>
                    <TouchableOpacity onPress={showMenu} style={{ flex: 1, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                        <Menu
                            style={{ width: 50 }}
                            ref={setMenuRef}
                            button={<Text style={{ fontSize: 16, fontWeight: 'bold' }} onPress={showMenu}>{I18n.t('vi_tri')} {position}</Text>}
                        >
                            {
                                listPosition.map(item => <MenuItem key={item.name} onPress={() => hideMenu(item.name)}>{item.name} {item.status ? <Text style={{ color: Colors.colorchinh }}>*</Text> : null}</MenuItem>)
                            }
                        </Menu>
                        <Icon style={{}} name="chevron-down" size={20} />
                    </TouchableOpacity>
                </View>
                <View style={{ backgroundColor: "white", flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <TouchableOpacity
                        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                        onPress={onClickListedPrice}>
                        <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={colors.colorchinh} />
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ flex: 1, color: Colors.colorchinh, fontWeight: "bold", textTransform: "uppercase" }}>{currentPriceBook.Id == 0 ? I18n.t(currentPriceBook.Name) : currentPriceBook.Name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                        onPress={onClickRetailCustomer}>
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ textAlign: "right", flex: 1, color: Colors.colorchinh, fontWeight: "bold", textTransform: "uppercase" }}>{currentCustomer.Id == 0 ? I18n.t(currentCustomer.Name) : currentCustomer.Name}</Text>
                        <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                    </TouchableOpacity>
                </View>
                <CustomerOrder
                    {...props}
                    itemOrder={meMoItemOrder}
                    jsonContent={jsonContent}
                    outputItemOrder={outputItemOrder}
                    outputPosition={outputPosition}
                    outputSelectedProduct={outputSelectedProduct}
                    listTopping={listTopping}
                    Position={position}
                    updateServerEvent={updateServerEvent}
                    handlerProcessedProduct={(jsonContent) => handlerProcessedProduct(jsonContent)}
                    outPutSetNewOrderDetail={setNewOrderDetails}
                     />
            </View>
        </View>
    );
}

export default React.memo(Served)