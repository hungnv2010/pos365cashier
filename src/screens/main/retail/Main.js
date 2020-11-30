import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text } from 'react-native';
import { useSelector } from 'react-redux';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct';
import { Constant } from '../../../common/Constant';
import RetailCustomerOrder from './retailForTablet/retailCustomerOrder';
import RetailCustomerOrderForPhone from './retailForPhone/retailCustomerOrder';


const MainRetail = (props) => {

    const { orientaition, deviceType } = useSelector(state => {
        return state.Common
    });

    const outputSelectedProduct = (product) => {
        console.log('outputSelectedProduct product', product);
    }

    return (
        <View style={{ flex: 1, flexDirection: "row" }}>
            {
                deviceType == Constant.TABLET ?
                    <>
                        <View style={{ flex: 6 }}>
                            <SelectProduct
                                valueSearch={props.value}
                                numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
                                listProducts={[]}
                                outputSelectedProduct={outputSelectedProduct} />
                        </View>
                        <View style={{ flex: 4, marginLeft: 2 }}>
                            <RetailCustomerOrder
                                {...props}
                                outputSelectedProduct={outputSelectedProduct} />
                        </View>
                    </>
                    :
                    <RetailCustomerOrderForPhone
                        {...props}
                        outputSelectedProduct={outputSelectedProduct} />
            }
        </View>
    );
};

export default MainRetail;
