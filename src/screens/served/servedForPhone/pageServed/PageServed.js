import React, { useLayoutEffect, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Modal } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import ToolBarPhoneServed from '../../../../components/toolbar/ToolBarPhoneServed';
import I18n from '../../../../common/language/i18n';
import signalRManager from '../../../../common/SignalR';
import { Constant } from '../../../../common/Constant';
import { Snackbar } from 'react-native-paper';
import realmStore from '../../../../data/realm/RealmStore';
import { useDispatch } from 'react-redux';
import colors from '../../../../theme/Colors';
import dataManager from '../../../../data/DataManager';
import { ApiPath } from '../../../../data/services/ApiPath';
import { HTTPService } from '../../../../data/services/HttpService';
import _, { map } from 'underscore';
import { ScreenList } from '../../../../common/ScreenList';
import { currencyToString, dateToString } from '../../../../common/Utils';

export default (props) => {

    let serverEvent = null;
    const currentServerEvent = useRef({})

    const [jsonContent, setJsonContent] = useState({})
    const [promotions, setPromotions] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState('A')
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "Giá niêm yết", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "Khách hàng", Id: 0 })
    const toolBarPhoneServedRef = useRef();
    const listPriceBookRef = useRef({})
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

    useLayoutEffect(() => {
        const getListPos = async () => {

            let serverEvent = await realmStore.queryServerEvents()
            let listPriceBook = await realmStore.queryPricebook()
            listPriceBook = JSON.parse(JSON.stringify(listPriceBook))
            listPriceBookRef.current = listPriceBook
            const row_key = `${props.route.params.room.Id}_${position}`
            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)
            currentServerEvent.current = JSON.stringify(serverEvent) != '{}' && serverEvent[0].JsonContent ? JSON.parse(JSON.stringify(serverEvent[0]))
                : await dataManager.createSeverEvent(props.route.params.room.Id, position)
            console.log('currentServerEvent.current', currentServerEvent.current, JSON.parse(currentServerEvent.current.JsonContent));
            let jsonContentObject = JSON.parse(currentServerEvent.current.JsonContent)

            for (const property in listPriceBook) {
                if (listPriceBook[property].Id == jsonContentObject.PriceBookId) {
                    setCurrentPriceBook(listPriceBook[property])
                }
            }
            setJsonContent(jsonContentObject)

            if (props.route.params.room.ProductId) {
                let ischeck = false;
                jsonContentObject.OrderDetails.forEach(element => {
                    if (element.Id == props.route.params.room.ProductId) {
                        ischeck = true;
                    }
                });
                toolBarPhoneServedRef.current.clickCheckInRef(!ischeck)
            }

            serverEvent.addListener((collection, changes) => {
                if ((changes.insertions.length || changes.modifications.length) && serverEvent[0].FromServer) {
                    currentServerEvent.current = JSON.parse(JSON.stringify(serverEvent[0]))
                    setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                }
            })

        }

        const getDataRealm = async () => {
            let promotions = await realmStore.querryPromotion();
            console.log("promotions === ", promotions);
            setPromotions(promotions)
        }
        getDataRealm();

        getListPos()

        return () => {
            if (serverEvent) serverEvent.removeAllListeners()
        }
    }, [position])


    useEffect(() => {
        console.log('jsonContent.Partner', jsonContent.Partner);
    }, [jsonContent.Partner])

    useEffect(() => {
        const getOtherPrice = async () => {
            if (jsonContent.OrderDetails && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": jsonContent.OrderDetails.map((product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                console.log('getOtherPrice res', res);
                if (res && res.PriceList && res.PriceList.length > 0) {
                    jsonContent.OrderDetails.map((product) => {
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
                    updateServerEvent()
                }
            }
        }

        const getBasePrice = () => {
            jsonContent.OrderDetails.map((product) => {
                product.DiscountRatio = 0.0
                let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                product.Price = basePrice + product.TotalTopping
            })
            updateServerEvent()
        }
        if (jsonContent.OrderDetails) {
            jsonContent.PriceBookId = currentPriceBook.Id
            if (currentPriceBook && currentPriceBook.Id) getOtherPrice()
            else getBasePrice()
        }
    }, [currentPriceBook])

    useEffect(() => {
        if (JSON.stringify(jsonContent) != "{}") {
            if (currentCustomer && currentCustomer.Id) {
                let apiPath = `${ApiPath.SYNC_PARTNERS}/${currentCustomer.Id}`
                new HTTPService().setPath(apiPath).GET()
                    .then(result => {
                        if (result) {
                            console.log('resultresult', result, jsonContent);
                            let discount = dataManager.totalProducts(jsonContent.OrderDetails) * result.BestDiscount / 100
                            console.log('discount', discount);
                            jsonContent.Discount = discount
                            jsonContent.Partner = currentCustomer
                            jsonContent.PartnerId = currentCustomer.Id
                            console.log('jsonContentjsonContent', jsonContent);
                            dataManager.calculatateJsonContent(jsonContent)
                            let serverEvent = currentServerEvent.current
                            serverEvent.Version += 1
                            serverEvent.JsonContent = JSON.stringify(jsonContent)
                            dataManager.updateServerEvent(serverEvent)
                        }
                    })

            } else {
                jsonContent.Partner = null
                jsonContent.PartnerId = null
                jsonContent.Discount = 0
                dataManager.calculatateJsonContent(jsonContent)
                let serverEvent = currentServerEvent.current
                serverEvent.Version += 1
                serverEvent.JsonContent = JSON.stringify(jsonContent)
                dataManager.updateServerEvent(serverEvent)
            }

        }

    }, [currentCustomer])

    const getOtherPrice = async (list) => {
        if (currentPriceBook.Id) {
            if (jsonContent.OrderDetails && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": list.map((product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                if (res && res.PriceList && res.PriceList.length > 0) {
                    list.map((product) => {
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
                    return list
                } else
                    return list
            }
        } else
            return list
    }


    const outputListProducts = async (list) => {
        console.log("outputListProducts ", list);
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
        list = await addPromotion(list);
        console.log("outputListProducts addPromotion list ", list);
        jsonContent.OrderDetails = [...list]
        updateServerEvent()
    }

    const addPromotion = async (list) => {
        console.log("addPromotion list ", list);
        console.log("addPromotion promotions ", promotions);
        let listProduct = await realmStore.queryProducts()
        console.log("addPromotion listProduct:::: ", listProduct);
        // promotion1 = promotion1.filtered(`Id == ${item.ProductId}`)
        // promotion1 = JSON.parse(JSON.stringify(promotion1[0]));
        // console.log("addPromotion promotion1:::: ", promotion1);

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
        console.log("addPromotion listNewOrder::::: ", listNewOrder);
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

    const updateServerEvent = () => {
        console.log('updateServerEvent', currentPriceBook.Id);
        if (currentServerEvent.current) {
            let serverEvent = currentServerEvent.current
            dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({ ...jsonContent })
            serverEvent.Version += 1
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            dataManager.updateServerEvent(serverEvent)
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
        let list = jsonContent.OrderDetails ? jsonContent.OrderDetails.filter(item => (item.ProductId > 0 && (item.IsPromotion == undefined || (item.IsPromotion == false)))) : []
        props.navigation.navigate('SelectProduct', { _onSelect: onCallBack, listProducts: list })
    }

    //type: 1 => from selectProduct
    //type: 2 => from noteBook, QRCode
    const onCallBack = (newList, type) => {
        console.log('onCallBack === ', newList, type);
        switch (type) {
            case 1:
                newList = newList.filter(item => item.Quantity > 0)
                if (newList.length == 0) {
                    newList.push({ Id: -1, Quantity: 1 })
                }
                outputListProducts([...newList])
                break;
            case 2:
                newList.forEach(async (newItem, index, arr) => {
                    let products = await realmStore.queryProducts()
                    let productWithId = products.filtered(`Id ==${newItem.Id}`)
                    productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
                    let ProductImages = productWithId.ProductImages ? productWithId.ProductImages : ""

                    newItem.exist = false
                    newItem.ProductImages = ProductImages
                    newItem.IsPromotion = false
                    newItem.ProductId = newItem.Id
                    if (newItem.ProductType == 2 && newItem.IsTimer) {
                        let checkIn = new Date();
                        newItem.Checkin = checkIn;
                        newItem.Description = `${dateToString(checkIn, "DD/MM HH:mm")} =>  ${dateToString(checkIn, "DD/MM HH:mm")} () ${I18n.t('mot_gio_dau_tien')} = ${currencyToString(newItem.Price)}.`;
                    }
                    if (!jsonContent.OrderDetails) jsonContent.OrderDetails = []
                    jsonContent.OrderDetails.forEach((elm, idx) => {
                        if (newItem.Id == elm.Id && !newItem.SplitForSalesOrder) {
                            elm.Quantity += newItem.Quantity
                            newItem.exist = true
                        }
                    })
                    newList = newList.filter((newItem) => !newItem.exist)
                    console.log('newList', newList);
                    console.log('listProducts', jsonContent.OrderDetails);

                })
                let list = [...newList, ...jsonContent.OrderDetails];
                console.log('listProducts == list ', list);
                outputListProducts(list)
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
        console.log("showMenu listPosition ", listPosition);
        _menu.show();
        let serverEvent = await realmStore.queryServerEvents()
        listPosition.forEach((item, index) => {
            const row_key = `${props.route.params.room.Id}_${item.name}`
            let serverEventPos = serverEvent.filtered(`RowKey == '${row_key}'`)
            if (JSON.stringify(serverEventPos) != "{}" && JSON.parse(serverEventPos[0].JsonContent).OrderDetails.length > 0) {
                item.status = true
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
        props.navigation.navigate(ScreenList.PriceBook, { _onSelect: onCallBackPriceCustomer, currentPriceBook: currentPriceBook, listPriceBook: listPriceBookRef.current })
    }


    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBackPriceCustomer })
    }

    const onCallBackPriceCustomer = (data, type) => {
        switch (type) {
            case 1:
                console.log('onCallBackPriceCustomer ', type, data);
                setCurrentPriceBook(data)
                break;
            case 2:
                console.log('onCallBackPriceCustomer ', type, data);
                setCurrentCustomer(data)
                break;
            default:
                break;
        }
    }

    const handlerProcessedProduct = (jsonContent) => {
        console.log("handlerProcessedProduct jsonContent ", jsonContent);
        if (currentServerEvent.current) {
            let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current))
            // dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({ ...jsonContent })
            serverEvent.Version += 1
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            dataManager.updateServerEvent(serverEvent)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
            <View style={{ backgroundColor: Colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 5 }}>

                <View style={{ flex: 1, justifyContent: "center" }}>
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickListedPrice}>
                    <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={colors.colorchinh} />
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentPriceBook.Name ? currentPriceBook.Name : I18n.t('gia_niem_yet')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickRetailCustomer}>
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentCustomer.Name ? currentCustomer.Name : I18n.t('khach_hang')}</Text>
                    <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={colors.colorchinh} />
                </TouchableOpacity>
            </View>
            <CustomerOrder
                {...props}
                Position={position}
                jsonContent={jsonContent}
                outputListProducts={outputListProducts}
                handlerProcessedProduct={(jsonContent) => handlerProcessedProduct(jsonContent)} />
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
