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
    const [countPrint, setCountPrint] = useState(props.countPrint)
    const [printer, setPrinter] = useState(props.printer != [] ? props.printer : printCook)
    const [priceConfig,setPriceConfig] = useState({SecondPrinter:'',Printer3:'',Printer4:'',Printer5:''})
    let data = null

    useEffect(() => {
        if(props.printer != []){
        setPrinter(props.printer)
        }else{
            setPrinter([...printCook])
        }
        setCountPrint(props.countPrint)
    }, [props.printer])
    const onClick = (item, index) => {
        console.log("item", index);
        if (item.Status == false && countPrint < 5) {
            item.Status = true
            printer[index] = item
            setPrinter(printer)
            console.log("printer 1", printer);
        } else {
            item.Status = false
            printer[index] = item
            setPrinter(printer)
            console.log("printer 2",printer);
        } 
        data = printer.filter(item => item.Status == true)
        console.log("Data",data);
        props.outPutPrint({printer:printer, listP:priceConfig})
    }
    useEffect(() => {
        console.log("Printer", printer);
        setPrinter(props.printer)
    }, [printer])
    useEffect(() => {
        console.log("count Print", countPrint);
    }, [countPrint])
    useEffect(()=>{
        //setPriceConfig(props.config)
        props.outPutPrint({printer:printer, listP:priceConfig})
    },[priceConfig])

    const renderItem = (item, index) => {
        return (
            <View style={{ flex: 1, marginBottom: 10 ,justifyContent:'center',marginLeft:10}} key={index.toString()}>
                <TouchableOpacity style={[item.Status == true ? styles.styleButtonOn : styles.styleButton, {}]} onPress={() => onClick(item, index)}>
                    <Text style={[item.Status == true ? styles.titleButtonOn : styles.titleButtonOff, {}]}>{I18n.t(item.Name)}</Text>
                </TouchableOpacity>
            </View>
        )

    }
    return (
        <View style={{ marginBottom: 10 }}>
            <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 5,}}>
                <Text style={styles.titleBold}>{I18n.t('bao_che_bien')}</Text>
                <Text style={{ color: 'silver',marginRight:10}}>{I18n.t('so_may_in_toi_da')} {countPrint}/ 5</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <FlatList
                    data={printer}
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
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 10, backgroundColor: '#f2f2f2'
    },
    styleButtonOn: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 10, backgroundColor: 'white', borderColor: colors.colorLightBlue
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
        color: colors.colorLightBlue
    },
    titleBold:
        { fontWeight: 'bold', fontSize: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 10, textTransform: 'uppercase' },

})