import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';
import dataManager from '../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC } from '../../common/Utils';

export default (props) => {
    const [product, setProduct] = useState(props.productOl)
    const [priceConfig, setPriceConfig] = useState({})
    const [countPrint, setCountPrint] = useState(0)

    const [printCook, setPrintCook] = useState([{ Name: 'may_in_bao_bep_a', Key: 'KitchenA', Status: '' },
    { Name: 'may_in_bao_bep_b', Key: 'KitchenB', Status: '' },
    { Name: 'may_in_bao_bep_c', Key: 'KitchenC', Status: '' },
    { Name: 'may_in_bao_bep_d', Key: 'KitchenD', Status: '' },
    { Name: 'may_in_bao_pha_che_a', Key: 'BartenderA', Status: '' },
    { Name: 'may_in_bao_pha_che_b', Key: 'BartenderB', Status: '' },
    { Name: 'may_in_bao_pha_che_c', Key: 'BartenderC', Status: '' },
    { Name: 'may_in_bao_pha_che_d', Key: 'BartenderD', Status: '' },])
    useEffect(() => {
        console.log("printcook", product);
        setProduct(props.productOl)
        setTimeout(()=>{
            getPriceConfig()
        },1000)
        

    }, [props.productOl])
    const getPriceConfig = ()=>{
        product.PriceConfig? product.PriceConfig!=null ? setPriceConfig(JSON.parse(product.PriceConfig)):null:null
}
    const onClick = (item) => {
        // alert(item)
    }

    const renderItem = (item, index) => {
        return (
            <View style={{ flex: 1, marginBottom: 10 }}>
                <TouchableOpacity style={[product.Printer == item.Key ? styles.styleButtonOn : styles.styleButton, { marginLeft: 15 }]} onPress={() => onClick(priceConfig)}>
                    <Text style={[product.Printer == item.Key ? styles.titleButtonOn : styles.titleButtonOff, {}]}>{I18n.t(item.Name)}</Text>
                </TouchableOpacity>
            </View>
        )

    }
    return (
        <View style={{ marginBottom: 10 }}>
            <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 5, marginTop: 10, marginBottom: 10 }}>
                <Text style={styles.titleBold}>{I18n.t('bao_che_bien')}</Text>
                <Text style={{ color: 'silver', marginRight: 10 }}>{I18n.t('so_may_in_toi_da')} {countPrint}/ 5</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <FlatList
                    data={printCook}
                    numColumns={4}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleButton: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 15, backgroundColor: '#f2f2f2'
    },
    styleButtonOn: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 15, backgroundColor: 'white', borderColor: '#36a3f7'
    },
    titleButtonOff: {
        fontWeight: 'bold',
        alignItems: 'center',
        textAlign: 'center'
    },
    titleButtonOn: {
        fontWeight: 'bold',
        alignItems: 'center',
        textAlign: 'center',
        color: '#36a3f7'
    },
    titleBold:
        { fontWeight: 'bold', fontSize: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 10, textTransform: 'uppercase' },

})