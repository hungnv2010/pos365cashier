import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct';
import { Constant } from '../../../common/Constant';
import RetailCustomerOrder from './retailForTablet/retailCustomerOrder';
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
import dialogManager from '../../../components/dialog/DialogManager';


const MainRetail = (props) => {

    const [text, setText] = useState("")
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "gia_niem_yet", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "khach_le", Id: 0 })
    const [numberCommodity, setNumberCommodity] = useState(1)
    const [jsonContent, setJsonContent] = useState({})
    const { orientaition, deviceType, syncRetail, already } = useSelector(state => {
        return state.Common
    });
    const currentCommodity = useRef()
    const [isDone, setIsDone] = useState(true)

    const dispatch = useDispatch()

    useEffect(() => {
        if (syncRetail != false) {
            onClickSync()
            dispatch({ type: 'SYNCRETAIL', syncRetail: false })
        }
    }, [syncRetail])

    useEffect(() => {
        const getCommodityWaiting = async () => {

            serverEvents = await realmStore.queryServerEvents()
            let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
            newServerEvents = Object.values(newServerEvents)
            console.log('newServerEvents', newServerEvents);
            if (newServerEvents.length == 0) {
                let newSE = await createNewServerEvent()
                currentCommodity.current = (newSE)
            } else {
                setNumberCommodity(newServerEvents.length)
                let lastIndex = newServerEvents.length - 1
                currentCommodity.current = JSON.parse(JSON.stringify(newServerEvents[lastIndex]))
            }
            let jsonContent = JSON.parse(currentCommodity.current.JsonContent)
            setJsonContent(jsonContent)


        }
        getCommodityWaiting()
    }, [])

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

    const createNewServerEvent = async () => {
        let newServerEvent = await dataManager.createSeverEvent(Date.now(), "A")
        // newServerEvent.JsonContent = JSON.stringify(dataManager.createJsonContentForRetail(newServerEvent.RoomId))
        console.log('newServerEvent', newServerEvent);
        return realmStore.insertServerEventForRetail(newServerEvent)
    }

    const outputSelectedProduct = async (product, type = 1) => {
        switch (type) {
            case 1:
                {
                    let isExist = false
                    if (product.SplitForSalesOrder) {
                        product = await getOtherPrice(product)
                        jsonContent.OrderDetails.unshift(product)
                    } else {
                        jsonContent.OrderDetails.forEach(elm => {
                            if (!elm.IsPromotion && elm.ProductId == product.ProductId) {
                                isExist = true
                                elm.Quantity += product.Quantity
                                elm.Quantity = Math.round(elm.Quantity * 1000) / 1000
                                return;
                            }
                        })
                        if (!isExist) {
                            product = await getOtherPrice(product)
                            jsonContent.OrderDetails.unshift(product)
                        }
                    }
                    updateServerEvent({ ...jsonContent })
                    break;
                }

            case 2:
                {
                    let newProduct = product.filter(prod => prod.Quantity > 0)
                    jsonContent.OrderDetails = newProduct
                    updateServerEvent({ ...jsonContent })
                    break;
                }
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
                        if (! 'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
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

    const onCLickQR = () => {
        props.navigation.navigate("QRCode", { _onSelect: onCallBack })
    }

    const onCLickNoteBook = () => {
        props.navigation.navigate("NoteBook", { _onSelect: onCallBack })
    }

    const onClickSync = async () => {
        console.log('onClickSync');
        dialogManager.showLoading()
        setIsDone(false)
        await props.syncForRetail()
        dialogManager.hiddenLoading()
        setIsDone(true)
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
        updateServerEvent({ ...jsonContent })

    }

    const onCallBackPriceCustomer = (data, type, number) => {
        switch (type) {
            case 1:
                // if (data) setCurrentPriceBook(data)
                {
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
                                            console.log('product', product);
                                            product.DiscountRatio = 0.0
                                            product.Discount = 0
                                            if (!'PriceLargeUnit' in priceBook) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                            if (!'Price' in priceBook) priceBook.Price = product.UnitPrice
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
                    break
                }
            case 2:
                {
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
                            jsonContent.Partner = null
                            jsonContent.PartnerId = null
                            jsonContent.DiscountRatio = 0
                            jsonContent.DiscountValue = 0
                            updateServerEvent({ ...jsonContent })
                        }

                    }
                    break
                }
            case 3: //from commodity waiting
                {
                    currentCommodity.current = (data)
                    let jsonContent = JSON.parse(data.JsonContent)
                    setNumberCommodity(number)
                    updateServerEvent(jsonContent)
                    break
                }
            case 5:
                {
                    setNumberCommodity(number)
                }
            default:
                break;
        }
    }

    const updateServerEvent = (jsonContentObj) => {

        if (currentCommodity.current) {
            let serverEvent = currentCommodity.current
            dataManager.calculatateJsonContent(jsonContentObj)
            serverEvent.JsonContent = JSON.stringify(jsonContentObj)
            realmStore.insertServerEventForRetail(serverEvent)
            setJsonContent({ ...jsonContentObj })

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

        let newSE = await createNewServerEvent()
        currentCommodity.current = (newSE)
        setJsonContent(JSON.parse(newSE.JsonContent))
        setNumberCommodity(numberCommodity + 1)
    }

    const onCLickCommodity = () => {
        props.navigation.navigate(ScreenList.CommodityWaiting, {
            _onSelect: onCallBackPriceCustomer
        });
    }


    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1 }}>
                <RetailToolbar
                    {...props}
                    onCLickQR={onCLickQR}
                    onCLickNoteBook={onCLickNoteBook}
                    onClickSync={onClickSync}
                    outputTextSearch={outputTextSearch} />
                {
                    isDone ?
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <View style={{ flex: 6 }}>
                                <SelectProduct
                                    isRetail={true}
                                    valueSearch={text}
                                    numColumns={orientaition == Constant.LANDSCAPE ? 3 : 2}
                                    listProducts={jsonContent.OrderDetails ? jsonContent.OrderDetails : []}
                                    outputSelectedProduct={outputSelectedProduct} />
                            </View>
                            <View style={{ flex: 4, marginLeft: 2, backgroundColor: "#fff" }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                                        onPress={onClickListedPrice}>
                                        <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={Colors.colorchinh} />
                                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ flex: 1, color: Colors.colorchinh, fontWeight: "bold" }}>{currentPriceBook.Id == 0 ? I18n.t(currentPriceBook.Name) : currentPriceBook.Name}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                                        onPress={onClickRetailCustomer}>
                                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ textAlign: "right", flex: 1, color: Colors.colorchinh, fontWeight: "bold" }}>{currentCustomer.Id == 0 ? I18n.t(currentCustomer.Name) : currentCustomer.Name}</Text>
                                        <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                                    </TouchableOpacity>
                                </View>
                                <RetailCustomerOrder
                                    {...props}
                                    updateServerEvent={updateServerEvent}
                                    jsonContent={jsonContent}
                                    numberCommodity={numberCommodity}
                                    outputSelectedProduct={outputSelectedProduct}
                                    onCLickCommodity={onCLickCommodity}
                                    onClickNewOrder={onClickNewOrder} />
                            </View>
                        </View>
                        :
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size="large" style={{}} color={Colors.colorchinh} />
                        </View>
                }
            </View>

        </View>
    );
};

export default MainRetail;
