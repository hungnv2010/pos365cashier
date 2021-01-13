import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct';
import { Constant } from '../../../common/Constant';
import RetailCustomerOrder from './retailForTablet/retailCustomerOrder';
import RetailCustomerOrderForPhone from './retailForPhone/retailCustomerOrderForPhone';
import RetailToolbar from './retailToolbar';
import { ApiPath } from '../../../data/services/ApiPath';
import { HTTPService } from '../../../data/services/HttpService';
import realmStore from '../../../data/realm/RealmStore';
import { Colors } from '../../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import I18n from "../../../common/language/i18n";
import dataManager from '../../../data/DataManager';
import { ScreenList } from '../../../common/ScreenList';


const MainRetail = (props) => {

    // const [listProducts, setListProducts] = useState([])
    const [text, setText] = useState("")
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "gia_niem_yet", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "khach_hang", Id: 0 })
    const [jsonContent, setJsonContent] = useState({})
    const { orientaition, deviceType } = useSelector(state => {
        return state.Common
    });
    const listPriceBookRef = useRef()
    const currentCommodity = useRef()



    useEffect(() => {
        const getCommodityWaiting = async () => {

            serverEvents = await realmStore.queryServerEvents()
            let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
            newServerEvents = Object.values(newServerEvents)
            console.log('newServerEvents', newServerEvents);
            // setNumberNewOrder(newServerEvents.length)
            if (newServerEvents.length == 0) {
                let newSE = await createNewServerEvent()
                currentCommodity.current = (newSE)
                setJsonContent(JSON.parse(newSE.JsonContent))
            } else {
                currentCommodity.current = (newServerEvents[0])
                let jsonContent = JSON.parse(newServerEvents[0].JsonContent)
                if (jsonContent.Partner) setCurrentCustomer(jsonContent.Partner)
                if (jsonContent.PriceBook) setCurrentPriceBook(jsonContent.PriceBook)


                setJsonContent({ ...jsonContent })
            }

            serverEvents.addListener((collection, changes) => {
                if (changes.insertions.length || changes.modifications.length) {
                    // setNumberNewOrder(serverEvents.length)
                }
            })
        }
        getCommodityWaiting()
    }, [])

    useEffect(() => {
        const getOtherPrice = async () => {
            if (currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": jsonContent.OrderDetails.map((product) => product.ProductId) }
                console.log('getOtherPrice params', params);
                let res = await new HTTPService().setPath(apiPath).POST(params)
                if (res && res.PriceList && res.PriceList.length > 0) {
                    console.log('getOtherPrice res', res);
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
                    // updateServerEvent()
                }
                // jsonContent.OrderDetails = [...listProducts]
                dataManager.calculatateJsonContent(jsonContent)
                currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
                realmStore.insertServerEventForRetail(currentCommodity.current)
                setJsonContent({ ...jsonContent })
            }
        }

        const getBasePrice = () => {
            jsonContent.OrderDetails.map((product) => {
                product.DiscountRatio = 0.0
                let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                product.Price = basePrice + product.TotalTopping
            })
            // updateServerEvent()
            // jsonContent.OrderDetails = [...listProducts]
            dataManager.calculatateJsonContent(jsonContent)
            currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
            realmStore.insertServerEventForRetail(currentCommodity.current)
            setJsonContent({ ...jsonContent })
        }
        if (JSON.stringify(jsonContent) != "{}") {
            if (currentPriceBook && currentPriceBook.Id) {
                jsonContent.PriceBook = currentPriceBook
                jsonContent.PriceBookId = currentPriceBook.Id
                getOtherPrice()
            }
            else {
                jsonContent.PriceBookId = null
                getBasePrice()
            }
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
                            dataManager.calculatateJsonContent(jsonContent)
                            currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
                            realmStore.insertServerEventForRetail(currentCommodity.current)
                            setJsonContent({ ...jsonContent })
                        }
                    })

            } else {
                jsonContent.Partner = null
                jsonContent.PartnerId = null
                jsonContent.Discount = 0
                dataManager.calculatateJsonContent(jsonContent)
                currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
                realmStore.insertServerEventForRetail(currentCommodity.current)
                setJsonContent({ ...jsonContent })
            }
        }
    }, [currentCustomer])


    const createNewServerEvent = async () => {
        let newServerEvent = await dataManager.createSeverEvent(Date.now(), "A")
        newServerEvent.JsonContent = JSON.stringify(dataManager.createJsonContentForRetail(newServerEvent.RoomId))
        console.log('newServerEvent', newServerEvent);
        return realmStore.insertServerEventForRetail(newServerEvent)
    }

    const outputSelectedProduct = async (product, type = 1) => {
        switch (type) {
            case 1:
                let isExist = false
                if (product.SplitForSalesOrder) {
                    product = await getOtherPrice(product)
                    jsonContent.OrderDetails.push(product)
                } else {
                    jsonContent.OrderDetails.forEach(elm => {
                        if (elm.ProductId == product.ProductId) {
                            isExist = true
                            elm.Quantity += product.Quantity
                            elm.Quantity = Math.round(elm.Quantity * 1000) / 1000
                            return;
                        }
                    })
                    if (!isExist) {
                        product = await getOtherPrice(product)
                        jsonContent.OrderDetails.push(product)
                    }
                }
                dataManager.calculatateJsonContent(jsonContent)
                currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
                realmStore.insertServerEventForRetail(currentCommodity.current)
                setJsonContent({ ...jsonContent })
                break;


            case 2:
                let newProduct = product.filter(prod => prod.Quantity > 0)
                jsonContent.OrderDetails = newProduct
                dataManager.calculatateJsonContent(jsonContent)
                currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
                realmStore.insertServerEventForRetail(currentCommodity.current)
                setJsonContent({ ...jsonContent })
                break;
            default:
                break;
        }
    }


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

    const onCLickQR = () => {
        props.navigation.navigate("QRCode", { _onSelect: onCallBack })
    }

    const onCLickNoteBook = () => {
        props.navigation.navigate("NoteBook", { _onSelect: onCallBack })
    }

    const onClickSync = () => {
        console.log('onClickSync');
        props.syncForRetail()
    }

    const outputTextSearch = (text) => {
        console.log('outputTextSearch', text);
        setText(text.trim())
    }

    const onCallBack = async (newList, type) => {

        let allPromise = newList.map(async item => {
            let products = await realmStore.queryProducts()
            let productWithId = products.filtered(`Id ==${item.Id}`)
            productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
            return { ...productWithId, ...item, exist: false }
        })
        let list = await Promise.all(allPromise)
        jsonContent.OrderDetails.forEach(item => {
            list.forEach(elm => {
                if (item.Id == elm.Id && !item.SplitForSalesOrder) {
                    item.Quantity += elm.Quantity
                    elm.exist = true
                }
            })
        })
        list = list.filter((newItem) => !newItem.exist)
        // setListProducts([...list, ...listProducts])
        jsonContent.OrderDetails = [...list, ...jsonContent.OrderDetails]
        dataManager.calculatateJsonContent(jsonContent)
        currentCommodity.current.JsonContent = JSON.stringify(jsonContent)
        realmStore.insertServerEventForRetail(currentCommodity.current)
        setJsonContent({ ...jsonContent })

    }

    const onCallBackPriceCustomer = (data, type) => {
        switch (type) {
            case 1:
                if (data) setCurrentPriceBook(data)
                break;
            case 2:
                if (data) setCurrentCustomer(data)
                break;
            case 3:
                currentCommodity.current = data
                let jsonContent = JSON.parse(data.JsonContent)
                setJsonContent(jsonContent)
                if (jsonContent.Partner) setCurrentCustomer(jsonContent.Partner)
                else setCurrentCustomer({ Name: "khach_hang", Id: 0 })
                if (jsonContent.PriceBook) setCurrentPriceBook(jsonContent.PriceBook)
                else setCurrentPriceBook({ Name: "gia_niem_yet", Id: 0 })
                break;
            default:
                break;
        }
    }

    const onClickListedPrice = () => {
        console.log('onClickListedPrice');
        props.navigation.navigate(ScreenList.PriceBook, { _onSelect: onCallBackPriceCustomer, currentPriceBook: currentPriceBook })
    }

    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBackPriceCustomer, currentCustomer: currentCustomer })
    }

    const onClickNewOrder = async () => {
        if (JSON.stringify(jsonContent) != "{}" && jsonContent.OrderDetails.length == 0) {
            // setToastDescription(I18n.t("moi_chon_mon_truoc"))
            // setShowToast(true)
            return
        }
        let newSE = await createNewServerEvent()
        currentCommodity.current = (newSE)
        setJsonContent(JSON.parse(newSE.JsonContent))
        setCurrentCustomer({ Name: "khach_hang", Id: 0 })
        setCurrentPriceBook({ Name: "gia_niem_yet", Id: 0 })
    }

    const onCLickCommodity = () => {
        props.navigation.navigate(ScreenList.CommodityWaiting, {
            _onSelect: onCallBackPriceCustomer
        });
    }


    return (
        <View style={{ flex: 1 }}>
            {
                deviceType == Constant.TABLET ?
                    <View style={{ flex: 1 }}>
                        <RetailToolbar
                            {...props}
                            onCLickQR={onCLickQR}
                            onCLickNoteBook={onCLickNoteBook}
                            onClickSync={onClickSync}
                            outputTextSearch={outputTextSearch} />
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <View style={{ flex: 6 }}>
                                <SelectProduct
                                    valueSearch={text}
                                    numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
                                    listProducts={jsonContent.OrderDetails ? jsonContent.OrderDetails : []}
                                    outputSelectedProduct={outputSelectedProduct} />
                            </View>
                            <View style={{ flex: 4, marginLeft: 2 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center" }}
                                        onPress={onClickListedPrice}>
                                        <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={Colors.colorchinh} />
                                        <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentPriceBook.Id == 0 ? I18n.t(currentPriceBook.Name) : currentPriceBook.Name}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center" }}
                                        onPress={onClickRetailCustomer}>
                                        <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentCustomer.Id == 0 ? I18n.t(currentCustomer.Name) : currentCustomer.Name}</Text>
                                        <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                                    </TouchableOpacity>
                                </View>
                                <RetailCustomerOrder
                                    {...props}
                                    jsonContent={jsonContent}
                                    outputSelectedProduct={outputSelectedProduct}
                                    onCLickCommodity={onCLickCommodity}
                                    onClickNewOrder={onClickNewOrder} />
                            </View>
                        </View>
                    </View>
                    :
                    <RetailCustomerOrderForPhone
                        {...props} />
            }
        </View>
    );
};

export default MainRetail;
