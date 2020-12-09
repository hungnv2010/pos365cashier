import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text } from 'react-native';
import { useSelector } from 'react-redux';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct';
import { Constant } from '../../../common/Constant';
import RetailCustomerOrder from './retailForTablet/retailCustomerOrder';
import RetailCustomerOrderForPhone from './retailForPhone/retailCustomerOrderForPhone';
import RetailToolbar from './retailToolbar';
import { ScreenList } from '../../../common/ScreenList';


const MainRetail = (props) => {

    const [listProducts, setListProducts] = useState([])
    const [text, setText] = useState("")
    const [currentPriceBook, setCurrentPriceBook] = useState({ Name: "Giá niêm yết", Id: 0 })
    const [currentCustomer, setCurrentCustomer] = useState({ Name: "Khách hàng", Id: 0 })
    const { orientaition, deviceType } = useSelector(state => {
        return state.Common
    });

    const outputSelectedProduct = (product, type = 1) => {
        switch (type) {
            case 1:
                let isExist = false
                if (product.SplitForSalesOrder) {
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
                        listProducts.push(product)
                    }
                }
                setListProducts([...listProducts])
                break;


            case 2:
                setListProducts(product)
                break;
            default:
                break;
        }
    }

    const onCLickQR = () => {
        props.navigation.navigate("QRCode", { _onSelect: onCallBack })
    }

    const onCLickNoteBook = () => {
        props.navigation.navigate("NoteBook", { _onSelect: onCallBack })
    }

    const onClickSync = () => {

    }

    const outputTextSearch = (text) => {
        console.log('outputTextSearch', text);
        setText(text.trim())
    }

    const onCallBack = (data, type) => {

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
                                    currentCustomer={currentCustomer}
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
