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
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';

export default (props) => {
    const [orderStock, setOrderStock] = useState({})
    const [listItem, setListItem] = useState([])
    const [quantity, setQuantity] = useState()
    const [totalprovisional, setTotalProvisional] = useState(0)
    const [methodPay, setMethodPay] = useState()

    useEffect(() => {
        getData(props.route.params)
    }, [])

    const getData = (param) => {
        let data = JSON.parse(JSON.stringify(param.orderstock))
        setOrderStock({ ...data })
        getItemDetail(data.Id, data.AccountId)

    }
    useEffect(() => {
        let sum = 0
        let total = 0
        listItem.forEach(el => {
            sum += el.Quantity
            total += el.Price * el.Quantity
        })
        setQuantity(sum)
        setTotalProvisional(total)

    }, [listItem])
    const getItemDetail = async (id, accId) => {
        new HTTPService().setPath(ApiPath.DETAILFOREDIT).GET({ PurchaseOrderId: id }).then(res => {
            if (res != null) {
                setListItem([...res])
            }
        })
        // new HTTPService().setPath(`api/accounts/{${accId}}`).GET().then(res =>{
        //     if(res != null) {
        //         setMethodPay(res.Name)
        //     }
        // })
    }
    return (
        <View>
            <ToolBarDefault
                {...props}
                title={I18n.t('chi_tiet_nhap_hang')}
            />
            <ScrollView>
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 15 }}>
                        <View >
                            <Text>{I18n.t('ma_nhap_hang')}</Text>
                            <Text style={{paddingVertical:5,textTransform:'uppercase'}}>{orderStock.Code}</Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ color: orderStock.Status == 1 ? '#f6871e' : orderStock.Status == 2 ? '#00c75f' : orderStock.Status == 3 ? '#f21e3c' : null, fontWeight: 'bold' }}>{orderStock.Status == 2 ? I18n.t('hoan_thanh') : orderStock.Status == 1 ? I18n.t('dang_xu_li') : orderStock.Status == 3 ? I18n.t('loai_bo') : null}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#fff', marginTop: 2, paddingVertical: 15, paddingHorizontal: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('ngay_tao')}</Text>
                            <Text>{ }</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('ngay_nhap')}</Text>
                            <Text></Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('ngay_giao')}</Text>
                            <Text></Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('ghi_chu')}</Text>
                            <Text></Text>
                        </View>
                    </View>
                    <View style={{ paddingVertical: 15, paddingHorizontal: 10 }}>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('thanh_toan')}</Text>
                    </View>
                    <View style={{ backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('tong_so_luong_nhap')}</Text>
                            <Text style={{ fontWeight: 'bold' }}>{quantity}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('tong_tam_tinh')}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{currencyToString(totalprovisional)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('chiet_khau')}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{orderStock.Discount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('thue_vat')}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{orderStock.VAT}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#4a4a4a' }}>{I18n.t('tong_cong')}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{currencyToString(orderStock.Total)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#4a4a4a' }}>{I18n.t('so_tien_thanh_toan')}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{currencyToString(orderStock.TotalPayment)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('phuong_thuc_thanh_toan')}</Text>
                            <Text>{methodPay}</Text>
                        </View>
                    </View>
                    <View style={{ paddingVertical: 15, paddingHorizontal: 10 }}>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('danh_sach_hang_hoa')} ({listItem.length})</Text>
                    </View>
                    <ScrollView>
                        {
                            listItem.map((item, index) => {
                                return (
                                    <View style={{ backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text>{item.Name}</Text>
                                            <Text>{item.Code}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('gia_nhap')}</Text>
                                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{item.Price}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('gia_ban')}</Text>
                                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{item.IsLargeUnit == true ? currencyToString(item.PriceLargeUnit) : currencyToString(item.PriceUnit)}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                                            <Text style={{ color: '#bbbbbb' }}>{I18n.t('so_luong')}</Text>
                                            <Text style={{ fontWeight: 'bold', color: '#36a3f7' }}>{item.Quantity}</Text>
                                        </View>


                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({

})
