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
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "khach_hang", Id: 0 })
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const [promotions, setPromotions] = useState([])
    const toolBarTabletServedRef = useRef();
    const listPriceBookRef = useRef({})
    const orientaition = useSelector(state => {
        return state.Common.orientaition
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
            serverEventPos = JSON.parse(JSON.stringify(serverEventPos[0]))
            let jsonContentObj = JSON.parse(serverEventPos.JsonContent)
            if (JSON.stringify(serverEventPos) != "{}" && jsonContentObj && jsonContentObj.OrderDetails && jsonContentObj.OrderDetails.length > 0) {
                item.status = true
            }
        })
        setListPosition([...listPosition])
    };

    useEffect(() => {

        const getDataRealm = async () => {
            let promotions = await realmStore.querryPromotion();
            console.log("promotions === ", promotions);
            setPromotions(promotions)
        }
        getDataRealm();
    }, [])

    useLayoutEffect(() => {
        const getListPos = async () => {
            let serverEvent = await realmStore.queryServerEvents()

            const row_key = `${props.route.params.room.Id}_${position}`
            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)
            currentServerEvent.current = JSON.stringify(serverEvent) != '{}' ? JSON.parse(JSON.stringify(serverEvent[0]))
                : await dataManager.createSeverEvent(props.route.params.room.Id, position)
            console.log('currentServerEvent.current', currentServerEvent.current, JSON.parse(currentServerEvent.current.JsonContent));
            let jsonContentObject = JSON.parse(currentServerEvent.current.JsonContent)

            setJsonContent(jsonContentObject)


            serverEvent.addListener((collection, changes) => {
                if ((changes.insertions.length || changes.modifications.length) && serverEvent[0].FromServer) {
                    currentServerEvent.current = JSON.parse(JSON.stringify(serverEvent[0]))
                    setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                }
            })
        }

        getListPos()
        return () => {
            if (serverEvent) serverEvent.removeAllListeners()
        }
    }, [position])

    useEffect(() => {
        console.log('jsonContent.Partner', jsonContent.Partner);
        if (jsonContent.Partner && jsonContent.Partner.Id) {
            if (jsonContent.Partner.Id == currentCustomer.Id) return
            setCurrentCustomer(jsonContent.Partner)
        }
        else setCurrentCustomer({ Name: "khach_hang", Id: 0 })

    }, [jsonContent.Partner])

    useEffect(() => {
        console.log('jsonContent.PriceBook', jsonContent.PriceBook);
        if (jsonContent.PriceBook && jsonContent.PriceBook.Id) {
            if (jsonContent.PriceBook.Id == currentPriceBook.Id) return
            setCurrentPriceBook(jsonContent.PriceBook)
        }
        else setCurrentPriceBook({ Name: "gia_niem_yet", Id: 0 })
    }, [jsonContent.PriceBook])



    const getOtherPrice = async (product) => {
        if (currentPriceBook.Id) {
            let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
            let params = { "pricebookId": currentPriceBook.Id, "ProductIds": [product.ProductId] }
            let res = await new HTTPService().setPath(apiPath).POST(params)
            if (res && res.PriceList && res.PriceList.length > 0) {
                res.PriceList.forEach((priceBook) => {
                    if (priceBook.ProductId == product.ProductId) {
                        product.DiscountRatio = 0.0
                        if (!priceBook.PriceLargeUnit) priceBook.PriceLargeUnit = product.PriceLargeUnit
                        if (!priceBook.Price) priceBook.Price = product.UnitPrice
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
        let { RoomId, Position } = currentServerEvent.current
        let jsonContentTmp = JSON.stringify(jsonContent) == "{}" ? dataManager.createJsonContent(RoomId, Position, moment()) : jsonContent
        if (product.Quantity > 0 && !replace) {
            if (jsonContentTmp.OrderDetails.length == 0) {
                let title = props.route.params.Name ? props.route.params.Name : ""
                let body = I18n.t('gio_khach_vao') + moment().format('HH:mm dd/MM')
                dataManager.sentNotification(title, body)
            }
            if (product.SplitForSalesOrder) {
                product = await getOtherPrice(product)
                jsonContentTmp.OrderDetails.push(product)
            } else {
                let isExist = false
                jsonContentTmp.OrderDetails.forEach(elm => {
                    if (elm.ProductId == product.ProductId) {
                        isExist = true
                        elm.Quantity += product.Quantity
                        return;
                    }
                })
                if (!isExist) {
                    product = await getOtherPrice(product)
                    jsonContentTmp.OrderDetails.push(product)
                }
            }
        } else if (replace) {
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
        jsonContentTmp.OrderDetails = await addPromotion(jsonContentTmp.OrderDetails);
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


        checkHasItemOrder(newList)
        checkRoomProductId(newList, props.route.params.room.ProductId)
        updateServerEvent({ ...jsonContent })
    }

    const addPromotion = async (list) => {
        console.log("addPromotion list ", list);
        console.log("addPromotion promotions ", promotions);
        let listProduct = await realmStore.queryProducts()
        console.log("addPromotion listProduct:::: ", listProduct);
        let listNewOrder = list.filter(element => (element.IsPromotion == undefined || (element.IsPromotion == false)))
        let listOldPromotion = list.filter(element => (element.IsPromotion != undefined && (element.IsPromotion == true)))
        console.log("listNewOrder listOldPromotion ==:: ", listNewOrder, listOldPromotion);

        var DataGrouper = (function () {
            var has = function (obj, target) {
                return _.any(obj, function (value) {
                    return _.isEqual(value, target);
                });
            };

            var keys = function (data, names) {
                return _.reduce(data, function (memo, item) {
                    var key = _.pick(item, names);
                    if (!has(memo, key)) {
                        memo.push(key);
                    }
                    return memo;
                }, []);
            };

            var group = function (data, names) {
                var stems = keys(data, names);
                return _.map(stems, function (stem) {
                    return {
                        key: stem,
                        vals: _.map(_.where(data, stem), function (item) {
                            return _.omit(item, names);
                        })
                    };
                });
            };

            group.register = function (name, converter) {
                return group[name] = function (data, names) {
                    return _.map(group(data, names), converter);
                };
            };

            return group;
        }());

        DataGrouper.register("sum", function (item) {
            console.log("register item ", item);

            return _.extend({ ...item.vals[0] }, item.key, {
                Quantity: _.reduce(item.vals, function (memo, node) {
                    return memo + Number(node.Quantity);
                }, 0)
            });
        });

        let listGroupByQuantity = DataGrouper.sum(listNewOrder, ["Id", "IsLargeUnit"])

        console.log("listGroupByQuantity === ", listGroupByQuantity);

        let listPromotion = [];
        let index = 0;
        listGroupByQuantity.forEach(element => {
            promotions.forEach(async (item) => {
                if ((element.IsPromotion == undefined || (element.IsPromotion == false)) && element.Id == item.ProductId && checkEndDate(item.EndDate) && (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition)) {
                    let promotion = listProduct.filtered(`Id == ${item.ProductPromotionId}`)
                    promotion = JSON.parse(JSON.stringify(promotion[0]));
                    // let promotion = JSON.parse(item.Promotion)
                    console.log("addPromotion item:::: ", promotion);
                    if (index == 0) {
                        promotion.FisrtPromotion = true;
                    }

                    let quantity = Math.floor(element.Quantity / item.QuantityCondition)
                    promotion.Quantity = quantity

                    if (listOldPromotion.length > 0) {
                        let oldPromotion = listOldPromotion.filter(el => promotion.Id == el.Id)
                        if (oldPromotion.length == 1) {
                            promotion = oldPromotion[0];
                            promotion.Quantity = quantity;
                        }
                    }

                    promotion.Price = item.PricePromotion;
                    promotion.IsLargeUnit = item.ProductPromotionIsLargeUnit;
                    promotion.IsPromotion = true;
                    promotion.ProductId = promotion.Id
                    promotion.Description = element.Quantity + " " + element.Name + ` ${I18n.t('khuyen_mai_')} ` + Math.floor(element.Quantity / item.QuantityCondition);

                    console.log("addPromotion promotion ", promotion, index);
                    listPromotion.push(promotion)
                    index++;
                }
            });
        });
        console.log("addPromotion listPromotion:: ", listPromotion);
        listNewOrder = listNewOrder.concat(listPromotion);
        console.log("addPromotion listNewOrder:::: ", listNewOrder);
        return listNewOrder;
    }

    const checkEndDate = (date) => {
        let endDate = new Date(date)
        let currentDate = new Date();
        console.log("currentDate endDate ", currentDate, endDate);
        if (endDate.getTime() > currentDate.getTime()) {
            return true;
        }
        return true;
    }

    const updateServerEvent = (jsonContent) => {
        console.log('updateServerEvent currentPriceBook', currentPriceBook);
        if (currentServerEvent.current) {
            let serverEvent = currentServerEvent.current
            dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({ ...jsonContent })
            serverEvent.Version += 1
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            console.log('updateServerEvent serverEvent', jsonContent);

            dataManager.updateServerEvent(serverEvent)
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
                                            product.DiscountRatio = 0.0
                                            if (!priceBook.PriceLargeUnit) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                            if (!priceBook.Price) priceBook.Price = product.UnitPrice
                                            let newBasePrice = (product.IsLargeUnit) ? priceBook.PriceLargeUnit : priceBook.Price
                                            product.Price = newBasePrice + product.TotalTopping
                                        }
                                    })
                                })

                            } else {
                                jsonContent.OrderDetails.forEach((product) => {
                                    product.DiscountRatio = 0.0
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
                    console.log('jsonContentjsonContent',jsonContent);
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

    const onClickProvisional = (res) => {
        if (res && res != "") {
            let html = data.replace("width: 76mm", "")
            setData(res)
        }
        setTimeout(() => {
            viewPrintRef.current.clickCaptureRef();
        }, 500);
    }
    const viewPrintRef = useRef();

    const handlerProcessedProduct = (jsonContent) => {
        console.log("handlerProcessedProduct jsonContent ", jsonContent);
        updateServerEvent(jsonContent)
    }

    return (
        <View style={{ flex: 1 }}>
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
                            numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
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
                <View style={{ flex: 4, marginLeft: 2 }}>
                    <View style={{ flex: 1, backgroundColor: "#fff" }}>

                        <View style={{ backgroundColor: colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderTopColor: "#EAECEE", borderTopWidth: 1.5, height: 35 }}>
                            <View style={{ flex: 1, justifyContent: "center", }}>
                                <Text style={{ paddingLeft: 20, textTransform: "uppercase", color: "white", fontWeight: "bold" }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                            </View>
                            <TouchableOpacity onPress={showMenu} style={{ flex: 1, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                                <Menu
                                    style={{ width: 50 }}
                                    ref={setMenuRef}
                                    button={<Text style={{ color: "white", fontWeight: "bold" }} onPress={showMenu}>{position}</Text>}
                                >
                                    {
                                        listPosition.map(item => <MenuItem key={item.name} onPress={() => hideMenu(item.name)}>{item.name} {item.status ? <Text style={{ color: Colors.colorchinh }}>*</Text> : null}</MenuItem>)
                                    }
                                </Menu>
                                <Icon style={{}} name="chevron-down" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={onClickListedPrice}>
                                <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={colors.colorchinh} />
                                <Text style={{ color: Colors.colorchinh, fontWeight: "bold", textTransform: "uppercase" }}>{currentPriceBook.Id == 0 ? I18n.t(currentPriceBook.Name) : currentPriceBook.Name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={onClickRetailCustomer}>
                                <Text style={{ color: Colors.colorchinh, fontWeight: "bold", textTransform: "uppercase" }}>{currentCustomer.Id == 0 ? I18n.t(currentCustomer.Name) : currentCustomer.Name}</Text>
                                <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                            </TouchableOpacity>
                        </View>

                        <CustomerOrder
                            {...props}
                            itemOrder={meMoItemOrder}
                            jsonContent={jsonContent}
                            onClickProvisional={(res) => onClickProvisional(res)}
                            outputItemOrder={outputItemOrder}
                            outputPosition={outputPosition}
                            outputSelectedProduct={outputSelectedProduct}
                            listTopping={listTopping}
                            Position={position}
                            handlerProcessedProduct={(jsonContent) => handlerProcessedProduct(jsonContent)} />
                    </View >

                </View>
            </View>
        </View>
    );
}

export default React.memo(Served)