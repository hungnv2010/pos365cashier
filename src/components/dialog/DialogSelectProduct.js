import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { change_alias, currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Images, Metrics } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import TextTicker from 'react-native-text-ticker';
import useDebounce from '../../customHook/useDebounce';
import colors from '../../theme/Colors';
import NetInfo from "@react-native-community/netinfo";
import dataManager from '../../data/DataManager';
import dialogManager from '../../components/dialog/DialogManager';
import realmStore from '../../data/realm/RealmStore';

export default (props) => {
    const [listProduct, setListProduct] = useState([])
    const [textSearch, setTextSearch] = useState('')
    const productTmp = useRef([])
    const debouncedVal = useDebounce(textSearch)

    useEffect(() => {
        getData()
    }, [])
    const getData = async () => {
        try {
            let state = await NetInfo.fetch()
            if (state.isConnected == true && state.isInternetReachable == true) {
                dialogManager.showLoading()
                await realmStore.deleteProduct()
                await dataManager.syncProduct()
                getDataFromRealm()
            } else {
                dialogManager.showLoading()
                getDataFromRealm()
            }

            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            getDataFromRealm()
            dialogManager.hiddenLoading()
        }
    }
    const getDataFromRealm = async () => {
        productTmp.current = (await realmStore.queryProducts())
        productTmp.current = productTmp.current.filtered(`TRUEPREDICATE SORT(Id DESC) DISTINCT(Id)`)
        //productTmp.current = JSON.parse(JSON.stringify(productTmp.current))
        console.log("productTmp", productTmp.current);
        let list = []
        //setViewData(productTmp.current)
        productTmp.current.forEach(item => {
            if (item.IsTimer) {
                if (item.IsTimer == false) {
                    list.push(item)
                }
            } else
                list.push(item)
        })
        setListProduct(list)
    }
    const onClickItem = async(data) => {
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
            new HTTPService().setPath(ApiPath.ADD_EXTRA).POST({ ProductId: data }).then(res => {
                props.outPut(res)
            })
        } else {
            props.outPut({})
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }
    useEffect(() => {
        let list = productTmp.current.filter(item => change_alias(item.Name).indexOf(change_alias(debouncedVal)) != -1)
        setListProduct(list)
    }, [debouncedVal])
    return (
        <View style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 5, width: Metrics.screenWidth * 0.8 }}>
            <Text style={{ paddingVertical: 10, fontWeight: 'bold', fontSize: 16, color: colors.colorLightBlue }}>{I18n.t('chon_hang_hoa')}</Text>
            <TextInput style={{ backgroundColor: '#f2f2f2', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10, color:'#4a4a4a' }} placeholder={I18n.t('nhap_ten_hang_hoa')} onChangeText={(text) => setTextSearch(text)}></TextInput>
            <ScrollView style={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
                {
                    listProduct.map((item, index) => {
                        return (
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f2f2f2', paddingVertical: 10 }}>
                                <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between' }} onPress={() => onClickItem(item.Id)}>
                                    <View style={{ marginRight: 10, flex: 4, flexDirection: 'row' }}>
                                        <Text>{item.Name}</Text>
                                    </View>
                                    <View style={{ flex: 1.8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                        <Text>{currencyToString(item.Price)}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>)
                    })
                }
            </ScrollView>
        </View>
    )
}