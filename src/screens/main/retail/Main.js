import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text } from 'react-native';
import { useSelector } from 'react-redux';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct';
import { Constant } from '../../../common/Constant';
import RetailCustomerOrder from './retailForTablet/retailCustomerOrder';
import RetailCustomerOrderForPhone from './retailForPhone/retailCustomerOrder';
import RetailToolbar from './retailToolbar';


const MainRetail = (props) => {

    const [listProducts, setListProducts] = useState([])
    const { orientaition, deviceType } = useSelector(state => {
        return state.Common
    });

    const outputSelectedProduct = (product) => {
        let isExist = false
        console.log('outputSelectedProduct product', product);
        if (product.SplitForSalesOrder) {
            listProducts.push(product)
        } else {
            listProducts.forEach(elm => {
                if (elm.ProductId == product.ProductId) {
                    isExist = true
                    elm.Quantity += product.Quantity
                    return;
                }
            })
            if (!isExist) {
                listProducts.push(product)
            }
        }
        setListProducts([...listProducts])
    }

    

    const outputTextSearch = () => {

    }

    return (
        <View style={{ flex: 1 }}>
            <RetailToolbar
                {...props}
                outputTextSearch={outputTextSearch} />
            <View style={{ flex: 1, flexDirection: "row" }}>
                {
                    deviceType == Constant.TABLET ?
                        <>
                            <View style={{ flex: 6 }}>
                                <SelectProduct
                                    valueSearch={props.value}
                                    numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
                                    listProducts={[...listProducts]}
                                    outputSelectedProduct={outputSelectedProduct} />
                            </View>
                            <View style={{ flex: 4, marginLeft: 2 }}>
                                <RetailCustomerOrder
                                    {...props}
                                    listProducts={[...listProducts]}
                                    outputSelectedProduct={outputSelectedProduct} />
                            </View>
                        </>
                        :
                        <RetailCustomerOrderForPhone
                            {...props}
                            outputSelectedProduct={outputSelectedProduct} />
                }
            </View>
        </View>
    );
};

export default MainRetail;
