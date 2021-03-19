import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import realmStore from '../../../data/realm/RealmStore';
//import ProductsItem from './ProductsItem';
import { Constant } from '../../../common/Constant';
import I18n from '../../../common/language/i18n';
import { change_alias } from '../../../common/Utils';
import useDebounce from '../../../customHook/useDebounce';
import { Colors, Metrics, Images } from '../../../theme'
import { useSelector } from 'react-redux';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
export default (props) => {
    const [listProduct, setListProduct] = useState([])
    const [listCategory, setListCategory] = useState([])

    const getData = async () => {
        let res = await new HTTPService().setPath(ApiPath.PRODUCT).GET()
        if (res && res.__count > 0) {
            setListProduct([...res.results])
            //console.log("product", [...res.results]);
        } else {
            productTmp = await realmStore.queryProducts()
            setListProduct(productTmp)   
        }
        let resCate = await new HTTPService().setPath(ApiPath.CATEGORIES_PRODUCT).GET()
        if(resCate && resCate.__count > 0){
            setListCategory([...resCate.results])
        }else{
            categoryTmp = await realmStore.queryCategories()
            setCategory([...categoryTmp])
        }   
    }
    useEffect(() => {
        getData()
        
    }, [])
    const getQuantity = () =>{
        listCategory.forEach(item =>{
            
        })
    }
    useEffect(()=>{
        console.log("catygory", listCategory);
        console.log("product", listProduct);
    },[listProduct,listCategory])

    const renderCategory = (item, index) =>{
        return(
            <View>
                <Text>{item.Name}</Text>
            </View>
        )
    }

    return (
        <View>
            <Text>{JSON.stringify(listProduct[2])}</Text>
        </View>
    )
}