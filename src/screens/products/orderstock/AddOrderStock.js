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
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default (props) => {
    const [orderStock, setOrderStock] = useState({})
    const [listPr, setListPr] = useState([])
    const [sumPr, setSumPr] = useState()
    const [expand, setExpand] = useState(false)
    const [sumQuantity, setSumQuantity] = useState()

    useEffect(() => {
        getData(props.route.params)
    }, [])

    const getData = (param) => {
        let os = JSON.parse(JSON.stringify(param.orderstock))
        setOrderStock({ ...os })
        let arrPr = JSON.parse(JSON.stringify(param.listPr))
        setListPr([...arrPr])
    }
    useEffect(() => {
        setSumPr(listPr.length)
        let sum = 0
        listPr.forEach(item => {
            sum = sum + item.Quantity
        })
        setSumQuantity(sum)
    }, [listPr])

    const renderItem = (item, index) => {
        return (
            <View style={{ backgroundColor: '#fff', paddingVertical: 10, marginVertical: 2, paddingHorizontal: 10, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{item.Name}</Text>
                        <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
                            <Text style={{ color: colors.colorLightBlue }}>{item.Code}</Text>
                            <Text style={{ color: colors.colorLightBlue, fontWeight: 'bold', marginLeft: 70 }}>{item.Unit || item.LargeUnit ? item.IsLargeUnit == false ? item.Unit : item.LargeUnit : null}</Text>
                        </View>
                    </View>
                    <Image source={Images.icon_trash} style={{ width: 24, height: 24 }} />
                </View>
                <View style={{ height: 0.3, backgroundColor: '#4a4a4a' }}></View>
                <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text>{I18n.t('gia_nhap')}</Text>
                        <TextInput style={styles.styleTextInput} value={item.Price > 0 ? currencyToString(item.Price) : 0 + ''}></TextInput>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text>
                            {I18n.t('so_luong')}
                        </Text>
                        <TextInput style={styles.styleTextInput} value={currencyToString(item.Quantity)}></TextInput>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                {...props}
                title={orderStock != {} ? I18n.t('chinh_sua_nhap_hang') : I18n.t('them_moi_nhap_hang')}
            />
            <View style={{ flex: 1, paddingVertical: 10 }}>
                <Text style={{ paddingHorizontal: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('danh_sach_hang_hoa')}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text>{sumPr} {I18n.t('hang_hoa')}</Text>
                    <Text style={{ color: colors.colorLightBlue, textDecorationLine: 'underline' }}>{I18n.t('chon_hang_hoa')}</Text>
                </View>
                <FlatList
                    data={listPr}
                    renderItem={({ item, index }) => renderItem(item, index)}
                />
            </View>
            <View>
                {expand == false ?
                    <TouchableOpacity style={{marginBottom:10}} onPress={()=>setExpand(true)}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold' }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={{ marginLeft: 10 }}>{sumQuantity}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold' }}>{currencyToString(orderStock.Total)}</Text>
                                <Image source={Images.icon_arrow_down} style={{width:16,height:16,marginLeft:10}} />
                            </View>
                        </View>
                        <View style={{height:0.3,marginHorizontal:10,backgroundColor:'#4a4a4a'}}></View>
                    </TouchableOpacity> :
                    <View style={{marginBottom:10,backgroundColor:'#fff'}}>
                        <TouchableOpacity onPress={()=>setExpand(false)}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold' }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={{ marginLeft: 10 }}>{sumQuantity}</Text>
                            </View>
                            <View style={{ flexDirection: 'row',alignItems:'center',justifyContent:'center' }}>
                                <Text style={{ fontWeight: 'bold' }}>{currencyToString(orderStock.Total)}</Text>
                                <Image source={Images.icon_up} style={{width:16,height:16,marginLeft:10}} />
                            </View>
                        </View>
                        <View style={{height:0.3,marginHorizontal:10,backgroundColor:'#4a4a4a'}}></View>
                    </TouchableOpacity>
                        <View style={{flexDirection:'row',paddingVertical:5}}>
                            <View style={{flex:1,alignItems:'center', justifyContent:'center'}}>
                            <Text>{I18n.t('ma_nhap_hang')}</Text>
                            </View>
                                <View style={{flex:1}}>
                            <TextInput style={styles.styleTextInput}></TextInput>
                            </View>
                        </View>
                    </View>
                }
                <TouchableOpacity style={{backgroundColor:colors.colorLightBlue,borderRadius:10,alignItems:'center',justifyContent:'center',paddingVertical:15,marginHorizontal:10}}>
                    <Text style={{fontWeight:'bold',color:'#fff'}}>{I18n.t('luu')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTextInput: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 5, paddingVertical: 10, marginTop: 10, borderRadius: 10, color: colors.colorLightBlue, textAlign: 'center', fontWeight: 'bold'
    }
})