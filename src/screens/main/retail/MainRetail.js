import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text } from 'react-native';
import { useSelector } from 'react-redux';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct';
import { Constant } from '../../../common/Constant';
import RetailCustomerOrder from './retailForTablet/retailCustomerOrder';
import RetailCustomerOrderForPhone from './retailForPhone/retailCustomerOrderForPhone';
import RetailToolbar from './retailToolbar';
import { ScreenList } from '../../../common/ScreenList';
import { ApiPath } from '../../../data/services/ApiPath';
import { HTTPService } from '../../../data/services/HttpService';


const MainRetail = (props) => {

    const [listProducts, setListProducts] = useState([])
    const [text, setText] = useState("")
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "Giá niêm yết", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "Khách hàng", Id: 0 })
    const { orientaition, deviceType } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        const getOtherPrice = async () => {
            if (listProducts && currentPriceBook) {
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = { "pricebookId": currentPriceBook.Id, "ProductIds": listProducts.map((product) => product.ProductId) }
                console.log('getOtherPrice params', params);
                let res = await new HTTPService().setPath(apiPath).POST(params)
                if (res && res.PriceList && res.PriceList.length > 0) {
                    console.log('getOtherPrice res', res);
                    listProducts.map((product) => {
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
                    setListProducts([...listProducts])
                }
            }
        }

        const getBasePrice = () => {
            listProducts.map((product) => {
                product.DiscountRatio = 0.0
                let basePrice = (product.IsLargeUnit) ? product.PriceLargeUnit : product.UnitPrice
                product.Price = basePrice + product.TotalTopping
            })
            // updateServerEvent()
            setListProducts([...listProducts])
        }
        if (listProducts) {
            if (currentPriceBook && currentPriceBook.Id) getOtherPrice()
            else getBasePrice()
        }
    }, [currentPriceBook])

    const outputSelectedProduct = async (product, type = 1) => {
        switch (type) {
            case 1:
                let isExist = false
                if (product.SplitForSalesOrder) {
                    product = await getOtherPrice(product)
                    listProducts.push(product)
                } else {
                    listProducts.forEach(elm => {
                        if (elm.ProductId == product.ProductId) {
                            isExist = true
                            elm.Quantity += product.Quantity
                            elm.Quantity = Math.round(elm.Quantity * 1000) / 1000
                            return;
                        }
                    })
                    if (!isExist) {
                        product = await getOtherPrice(product)
                        listProducts.push(product)
                    }
                }
                setListProducts([...listProducts])
                break;


            case 2:
                let newProduct = product.filter(prod => prod.Quantity > 0)
                setListProducts(newProduct)
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

    const onCallBack = (data, type) => {

    }

    const outputCurrentPriceBook = (data) => {
        setCurrentPriceBook(data)
    }

    const outputCurrentCustomer = (data) => {
        setCurrentCustomer(data)
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
                                    listProducts={[...listProducts]}
                                    outputSelectedProduct={outputSelectedProduct} />
                            </View>
                            <View style={{ flex: 4, marginLeft: 2 }}>
                                <RetailCustomerOrder
                                    {...props}
                                    currentPriceBook={currentPriceBook}
                                    outputCurrentPriceBook={outputCurrentPriceBook}
                                    currentCustomer={currentCustomer}
                                    outputCurrentCustomer={outputCurrentCustomer}
                                    listProducts={[...listProducts]}
                                    outputSelectedProduct={outputSelectedProduct} />
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
