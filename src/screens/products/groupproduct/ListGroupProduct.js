import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarNoteBook';
import CustomerToolBar from '../../../screens/customerManager/customer/CustomerToolBar';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import OrderStockDetails from '../../../screens/products/orderstock/OrderStockDetails'
import dialogManager from '../../../components/dialog/DialogManager';
import useDebounce from '../../../customHook/useDebounce';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';

export default (props) => {
    const [category, setCategory] = useState([])
    const [dataView, setDataView] = useState([])
    const productTmp = useRef([])
    const categoryTmp = useRef([])

    useEffect(() => {
        getDataFromRealm()
    }, [])
    const getDataFromRealm = async () => {
        productTmp.current = (await realmStore.queryProducts())
        productTmp.current = productTmp.current.filtered(`TRUEPREDICATE SORT(Id DESC) DISTINCT(Id)`)
        //productTmp.current = JSON.parse(JSON.stringify(productTmp.current))
        console.log("productTmp", productTmp.current);
        //setViewData(productTmp.current)
        //setListProduct(productTmp.current)
        categoryTmp.current = await realmStore.queryCategories()
        setCategory([...categoryTmp.current])
        categoryTmp.current.forEach(item =>{
            item.Sum = productTmp.current.filter(el => el.CategoryId == item.Id).length
            setDataView([...item])
        })

    }
    useEffect(()=>{
        console.log(dataView);
    },[dataView])
    const outputTextSearch = (value) => {

    }
    return (
        <View style={{ flex: 1, backgroundColor:'#f2f2f2' }}>
            <CustomerToolBar
                {...props}
                navigation={props.navigation}
                title={I18n.t('hang_hoa')}
                outputTextSearch={outputTextSearch}
                size={30}
            />
           
            {
                category.length > 0 ?
                    category.map((item, index) => {
                        return (
                            <View style={{paddingVertical:15,paddingHorizontal:10,marginVertical:2,marginHorizontal:5,backgroundColor:'#fff',borderRadius:10}}>
                                <Text style={{fontWeight:'bold',color:colors.colorLightBlue,fontSize:16}}>{item.Name}</Text>
                            </View>
                        )
                    })
                    :
                    <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Image source={Images.logo_365_long_color} />
                    </View>
            }
            
        </View>
    )
}