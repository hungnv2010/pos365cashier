import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault'
import I18n from '../../../common/language/i18n';
import SelectProduct from '../../../screens/products/comboForTab/SelectProduct'

export default (props) => {
    const [listProduct, setListProduct] = useState([])
    useEffect(() => {
        getData(props.route.params)
    }, [])
    const getData = (param) => {
        //itemProduct.current = JSON.parse(JSON.stringify(param.list))
        setListProduct([...param.list])
        console.log("param list",param.list);
       
        // console.log("data product", itemProduct.current);
        // setCategory(JSON.parse(JSON.stringify(param.category)))
        // console.log("category", category);
    }
    useEffect(()=>{
        console.log("list product",listProduct);
    },[listProduct])
    return (
        <View>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('thanh_phan_combo')}
                clickLeftIcon={() => { props.navigation.goBack() }}
            />
            <View>
               <SelectProduct />
            </View>
        </View>
    )
}