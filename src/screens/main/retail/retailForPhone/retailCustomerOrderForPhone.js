import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, Modal, ImageBackground, Platform, Keyboard, Image } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TextTicker from 'react-native-text-ticker';
import { currencyToString } from '../../../../common/Utils'
import I18n from "../../../../common/language/i18n"
import { Snackbar } from 'react-native-paper';
import { ScreenList } from '../../../../common/ScreenList';
import Entypo from 'react-native-vector-icons/Entypo';
import realmStore from '../../../../data/realm/RealmStore';
import dataManager from '../../../../data/DataManager';
import RetailToolbar from '../retailToolbar';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail';
import { ApiPath } from '../../../../data/services/ApiPath';
import { HTTPService } from '../../../../data/services/HttpService';
import _, { map } from 'underscore';
import dialogManager from '../../../../components/dialog/DialogManager';

export default (props) => {


    const [currentCommodity, setCurrentCommodity] = useState({})
    const [numberNewOrder, setNumberNewOrder] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState([])
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [expand, setExpand] = useState(false)
    const [isQuickPayment, setIsQuickPayment] = useState(false)
    const [itemOrder, setItemOrder] = useState({})
    const [jsonContent, setJsonContent] = useState({})
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "Giá niêm yết", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "Khách hàng", Id: 0 })
    const [promotions, setPromotions] = useState([])

    let serverEvents = null;

    useEffect(() => {
        getCommodityWaiting()
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
        listOrder.forEach((elm, index) => elm.index = index)
    }, [listOrder])

    useEffect(() => {
        let jsonObject = currentCommodity.JsonContent ? JSON.parse(currentCommodity.JsonContent) : {}
        setJsonContent({ ...jsonObject })
    }, [currentCommodity])

    useEffect(() => {
        const getOtherPrice = async () => {
            if (listOrder && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": listOrder.map((product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                console.log('getOtherPrice res', res);
                if (res && res.PriceList && res.PriceList.length > 0) {
                    listOrder.map((product) => {
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
                    // updateServerEvent()
                    // setListOrder([...listOrder])
                    setDataOrder([...listOrder])
                }
            }
        }

        const getBasePrice = () => {
            listOrder.map((product) => {
                product.DiscountRatio = 0.0
                let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                product.Price = basePrice + product.TotalTopping
            })
            // updateServerEvent()
            // setListOrder([...listOrder])
            setDataOrder([...listOrder])
        }
        if (listOrder) {
            if (currentPriceBook && currentPriceBook.Id) getOtherPrice()
            else getBasePrice()
        }
    }, [currentPriceBook])


    const getOtherPrice = async (list) => {
        console.log('getOtherPrice');
        if (currentPriceBook.Id) {
            if (jsonContent.OrderDetails && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": list.map((product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                console.log('getOtherPrice list', res);
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

    const getCommodityWaiting = async () => {
        serverEvents = await realmStore.queryServerEvents()
        let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
        newServerEvents = Object.values(newServerEvents)
        setNumberNewOrder(newServerEvents.length)
        if (newServerEvents.length == 0) {
            let newSE = await createNewServerEvent()
            setCurrentCommodity(newSE)
        } else {
            setCurrentCommodity(newServerEvents[0])
            let jsonContent = JSON.parse(newServerEvents[0].JsonContent)
            // setListOrder(jsonContent.OrderDetails)
            setDataOrder(jsonContent.OrderDetails)
        }

        // serverEvents.addListener((collection, changes) => {
        //     if (changes.insertions.length || changes.modifications.length) {
        //         let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
        //         newServerEvents = Object.values(newServerEvents)
        //         // setCurrentCommodity(newServerEvents[newServerEvents.length - 1])
        //         setNumberNewOrder(newServerEvents.length)
        //     }
        // })
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
        listOrder.splice(index, 1)
        setDataOrder([...listOrder])
    }

    const setDataOrder = async (listOrder) => {
        let list = [];
        if (listOrder != undefined && listOrder.length > 0)
            list = await addPromotion([...listOrder])
        console.log("setDataOrder listOrder list ", listOrder, list);

        setListOrder([...list])
        updateServerEvent([...list])
    }

    const addPromotion = async (list) => {
        console.log("addPromotion list ", list);
        console.log("addPromotion promotions ", promotions);
        let listProduct = await realmStore.queryProducts()
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
                console.log("addPromotion item1:::: ", element.Id, item.ProductId);
                console.log("addPromotion item2:::: ", (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition));
                if ((element.IsPromotion == undefined || (element.IsPromotion == false)) && element.Id == item.ProductId && checkEndDate(item.EndDate) && (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition)) {
                    let promotion = listProduct.filtered(`Id == ${item.ProductPromotionId}`)
                    promotion = JSON.parse(JSON.stringify(promotion[0]));
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
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khuyen_mai')}</Text>
                        </View>
                        : null
                }
                <TouchableOpacity key={index} onPress={() => {
                    if (isPromotion) return;
                    setItemOrder(item)
                    setShowModal(!showModal)
                }}>
                    <View style={styles.mainItem}>
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5 }}
                            onPress={() => { if (!isPromotion) removeItem(item, index) }}>
                            <Icon name={!isPromotion ? "trash-can-outline" : "gift"} size={40} color={!isPromotion ? "black" : Colors.colorLightBlue} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, }}>
                            <TextTicker
                                style={{ fontWeight: "bold", marginBottom: 7 }}
                                duration={6000}
                                marqueeDelay={1000}>
                                {item.Name}
                            </TextTicker>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{}}>{isPromotion ? currencyToString(item.Price) : (item.IsLargeUnit ? currencyToString(item.PriceLargeUnit) : item.Discount > 0 ? currencyToString(item.PriceWithDiscount) : currencyToString(item.Price))} x </Text>
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
                            {/* <Icon style={{ paddingHorizontal: 5 }} name="bell-ring" size={20} color="grey" />
                            <Text
                                style={{ color: Colors.colorchinh, marginRight: 5 }}>
                                {isPromotion ? currencyToString(item.Price * item.Quantity) : (item.IsLargeUnit ? currencyToString(item.PriceLargeUnit * item.Quantity) : currencyToString(item.Price * item.Quantity))}
                            </Text> */}
                        </View>
                    </View>
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
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBack })
    }

    const onClickPrint = () => {

    }

    const onClickOptionQuickPayment = () => {
        setIsQuickPayment(!isQuickPayment)
    }

    const onCLickQR = () => {
        props.navigation.navigate("QRCode", { _onSelect: onCallBackQRCode })
    }

    const onCLickNoteBook = () => {
        props.navigation.navigate("NoteBook", { _onSelect: onCallBack })
    }

    const onClickSync = () => {
        console.log('onClickSync', props);
        props.syncForRetail()
    }

    const outputTextSearch = (text) => {
        console.log('outputTextSearch', text);
    }

    const onClickSelect = () => {
        props.navigation.navigate(ScreenList.RetailSelectProduct, { _onSelect: onCallBack, listProducts: listOrder })
    }

    const onCallBackQRCode = (data, type) => {

    }

    const onCallBack = async (data, type) => {
        console.log('onCallBackonCallBack , data, type ', data, type);
        switch (type) {
            case 1: //from listPrice
                if (data) setCurrentPriceBook(data)
                break

            case 2: //from customer
                if (data) setCurrentCustomer(data)
                break

            case 3: //from commodity
                console.log('onCallBackonCallBack', data);
                setCurrentCommodity(data)
                let jsonContent = JSON.parse(data.JsonContent)
                setListOrder(jsonContent.OrderDetails)
                break
            case 4: //from select products
                data = await getOtherPrice(data)
                setDataOrder(data)
                break;
            case 5:
                break
            default:
                break;
        }
    }

    const updateServerEvent = (data) => {
        if (!currentCommodity.JsonContent) return
        console.log('updateServerEvent', data, currentCommodity);
        let jsonContent = JSON.parse(currentCommodity.JsonContent)
        jsonContent.OrderDetails = [...data]
        dataManager.calculatateJsonContent(jsonContent)
        currentCommodity.JsonContent = JSON.stringify(jsonContent)
        realmStore.insertServerEventForRetail(currentCommodity)
        setCurrentCommodity({ ...currentCommodity })
    }

    const onClickNewOrder = async () => {
        if (listOrder.length == 0) {
            setToastDescription(I18n.t("moi_chon_mon_truoc"))
            setShowToast(true)
            return
        }
        let newSE = await createNewServerEvent()
        setCurrentCommodity(newSE)
        setListOrder([])
        // setDataOrder([])
    }

    const onCallBackPayment = (data) => {
        console.log("onCallBackPayment data ", data);
        setListOrder([])
    }

    const onClickPayment = () => {
        if (isQuickPayment) {

        } else {
            console.log('onClickPayment jsonContent ', jsonContent);
            if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
                props.navigation.navigate(ScreenList.Payment, { onCallBack: onCallBackPayment, Screen: ScreenList.MainRetail, RoomId: jsonContent.RoomId, Name: jsonContent.RoomName ? jsonContent.RoomName : I18n.t('app_name'), Position: jsonContent.Pos });
            } else {
                dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
            }
        }
    }

    const applyDialogDetail = (product) => {
        console.log('applyDialogDetail listOrder ', product, listOrder);
        let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.Price
        let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
        listOrder.forEach((elm, index) => {
            if (elm.ProductId == product.ProductId && index == product.index) {
                elm.Quantity = product.Quantity
                elm.Description = product.Description
                elm.Discount = discount - price > 0 ? price : discount
                elm.PriceWithDiscount = product.PriceWithDiscount
            }
        })
        // setListOrder([...listOrder])
        setDataOrder([...listOrder].filter(item => item.Quantity > 0))
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickListedPrice}>
                    <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={Colors.colorchinh} />
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentPriceBook.Name ? currentPriceBook.Name : I18n.t('gia_niem_yet')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickRetailCustomer}>
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentCustomer.Name ? currentCustomer.Name : I18n.t('khach_hang')}</Text>
                    <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                {listOrder != undefined && listOrder.length > 0 ?
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
                    style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white", marginLeft: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                        <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{currencyToString(jsonContent.Total)}đ</Text>
                            {expand ?
                                <Icon style={{}} name="chevron-up" size={30} color="black" />
                                :
                                <Icon style={{}} name="chevron-down" size={30} color="black" />
                            }
                        </View>
                    </View>
                    {expand ?
                        <View style={{ marginLeft: 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>{I18n.t('tong_chiet_khau')}</Text>
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {currencyToString(jsonContent.Discount)}đ</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>VAT ({jsonContent.VATRates}%)</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.VAT ? jsonContent.VAT : 0)}đ</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.AmountReceived)}đ</Text>
                                </View>
                            </View>
                        </View>
                        :
                        null
                    }
                </TouchableOpacity>
            </View>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
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
                            {/* <TouchableOpacity onPress={() => onClickOptionQuickPayment()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name={isQuickPayment ? "check-box-outline" : "close-box-outline"} size={26} color={isQuickPayment ? Colors.colorchinh : "#000"} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('thanh_toan_nhanh')}</Text>
                            </TouchableOpacity> */}
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.navigation.navigate(ScreenList.CommodityWaiting, { _onSelect: onCallBack })
                }} style={{ flex: .5, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%", flexDirection: 'row' }}>
                    <Icon name="file-document-edit-outline" size={30} color="white" />
                    <View style={{ backgroundColor: Colors.colorchinh, borderRadius: 40, position: "absolute", right: 10, top: -5 }}>
                        <Text style={{ fontWeight: "bold", padding: 4, color: "white", fontSize: 14 }}>{numberNewOrder}</Text>
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
        borderBottomColor: "#ddd", borderBottomWidth: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 10,
        borderBottomColor: "#ABB2B9",
        borderBottomWidth: 0.5,
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

