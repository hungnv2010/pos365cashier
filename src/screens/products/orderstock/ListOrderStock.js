import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import ToolBarNoteBook from '../../../components/toolbar/ToolBarNoteBook';
import OrderStockDetails from '../../../screens/products/orderstock/OrderStockDetails'
import dialogManager from '../../../components/dialog/DialogManager';
import useDebounce from '../../../customHook/useDebounce';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import CustomerToolBar from '../../../screens/customerManager/customer/CustomerToolBar';
import { lastIndexOf } from 'underscore';

export default (props) => {
    const orderStock = useRef([])
    const [viewData, setViewData] = useState([])
    const [defaultItem, setDefaultItem] = useState({})
    const defauTitle = useRef()
    let arrDate = []
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {
        getOrderStock()
        console.log("arrr", arrDate);

    }, [])
    const getOrderStock = async () => {
        dialogManager.showLoading()
        await new HTTPService().setPath(ApiPath.ORDERSTOCK).GET({ Includes: 'Partner' }).then(res => {
            if (res != null) {
                orderStock.current = res.results
                console.log("orderstock", res.results);
                res.results.forEach(el => {
                   if(dateToString(el.CreatedDate) != defauTitle.current){
                        arrDate.push({ Title:dateToString(el.CreatedDate) })
                        defauTitle.current = dateToString(el.CreatedDate)
                   }
                    
                })
                console.log("arrr", arrDate);
                let arrdata = []
                arrDate.forEach(el => {
                    let arrItem = []
                    arrItem = orderStock.current.filter(item => dateToString(item.CreatedDate) == (el.Title))
                    arrdata.push({ ...el, Sum: arrItem.length })
                    arrItem.forEach(item => {
                        arrdata.push(item)
                    })

                })
                console.log("arr dataaaaa", arrdata);
                setViewData([...arrdata])
                dialogManager.hiddenLoading()
            }
        })
    }
    const onClickItem = (item) => {
        setDefaultItem(item)
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.OrderStockDetails, { orderstock: item })
        }
        
    }

    const renderItemOrderStock = (item, index) => {
        return (
            <TouchableOpacity style={{ backgroundColor: '#fff' }} onPress={() => { onClickItem(item) }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}>
                        <Image source={Images.ic_default_orderstock} style={{ alignItems: 'center', width: 24, height: 24 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10, flex: 1 }}>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ fontWeight: 'bold' }}>{item.Code}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text>{dateUTCToDate2(item.DocumentDate)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ color: item.Status == 2 ? '#00c75f' : item.Status == 1 ? '#f6871e' : item.Status == 3 ? '#f21e3c' : null, fontWeight: 'bold' }}>{item.Status == 2 ? I18n.t('hoan_thanh') : item.Status == 1 ? I18n.t('dang_xu_li') : item.Status == 3 ? I18n.t('loai_bo') : null}</Text>
                            <Text>{item.Partner ? item.Partner.Name : ''}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{currencyToString(item.Total)}</Text>
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        )
    }
    const outputTextSearch = () => {

    }
    const clickFilter = () =>{

    }
    const renderTitle = (item, index) => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 15 }}>
                <Text style={{ fontWeight: 'bold', color: '#4a4a4a' }}>{item.Title}</Text>
                <Text>{item.Sum} {I18n.t('ma_nhap_hang')}</Text>
            </View>
        )
    }
    return (
        <View style={{ flex: 1,flexDirection:deviceType==Constant.TABLET ? 'row' :'column' }}>
        <View style={{ flex: 1 }}>
            <CustomerToolBar
                {...props}
                title={I18n.t('nhap_hang')}
                iconfilter={'filter'}
                outputTextSearch={outputTextSearch}
                clickFilter={clickFilter}
            />
            <View style={{ flex: 1 }}>
                <FlatList
                    data={viewData}
                    renderItem={({ item, index }) => item.Title ? renderTitle(item, index) : renderItemOrderStock(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>

            <FAB
                style={styles.fab}
                icon='plus'
                color="#fff"
                onPress={() => {
                    props.navigation.navigate(ScreenList.AddOrderStock, { orderstock: {}, listPr: [], paymentMethod:""  })
                }}
            />
            
        </View>
        {
            deviceType == Constant.TABLET ? defaultItem.Id ?
            <View style={{flex:1,marginLeft:0.5}}>
                <OrderStockDetails iOrderStock={defaultItem} />
            </View> :
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <Image source={Images.logo_365_long_color} />
            </View>:null
        }
        </View>
    )
}
const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    }
})