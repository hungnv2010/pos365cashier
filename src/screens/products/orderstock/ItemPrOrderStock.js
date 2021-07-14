import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import { Images, Metrics } from '../../../theme';
import colors from '../../../theme/Colors';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateUTCToMoment2, momentToDate, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import { useLinkProps } from '@react-navigation/native';


const ItemPrOrderStock = ({ item, index, onChangeTextQ, onClickDelItem, onChangeData }) => {
    const [value, setValue] = useState(item.Quantity)
    const [price, setPrice] = useState(item.Price)
    useEffect(() => {
        setValue(item.Quantity)
    }, [item.Quantity])

    useEffect(() => {
        setPrice(item.Price)
    }, [item.Price])

    const onChangeTextInput = (text) => {
        if (text == "") {
            text = 0;
        } else {
            text = text.replace(/,/g, "");
            text = Number(text);
        }
        return text
    }

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
                <TouchableOpacity onPress={() => onClickDelItem(index)}>
                    <Image source={Images.icon_trash} style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
            </View>
            <View style={{ height: 0.5, backgroundColor: '#bbbbbb' }}></View>
            <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                <View style={{ flex: 1 }}>
                    <Text>{I18n.t('gia_nhap')}</Text>
                    <TextInput style={styles.styleTextInput} keyboardType={'numbers-and-punctuation'} value={price > 0 ? currencyToString(price) : 0 + ''} onChangeText={(text) => { setPrice(onChangeTextInput(text)), onChangeData(onChangeTextInput(text), item) }}></TextInput>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text>
                        {I18n.t('so_luong')}
                    </Text>
                    <View style={{
                        flexDirection: 'row', backgroundColor: '#f2f2f2', paddingHorizontal: 5, marginTop: 10, borderRadius: 10,paddingVertical:5
                    }}>
                        <TouchableOpacity style={{flex:1,paddingVertical:5,paddingHorizontal:5,alignItems:'center',justifyContent:'center',borderWidth:0.5,borderRadius:5, borderColor:colors.colorLightBlue }} onPress={()=>{setValue(value-1),onChangeTextQ(value-1,item)}}>
                            <Text style={{color:colors.colorLightBlue, fontWeight:'bold'}}>-</Text>
                        </TouchableOpacity>
                        <View style={{flex:5,paddingVertical:5}}>
                        <TextInput style={{color: colors.colorLightBlue, textAlign: 'center', fontWeight: 'bold'}} keyboardType={'numbers-and-punctuation'} value={currencyToString(value)} onChangeText={text => { setValue((onChangeTextInput(text) <= 100000000 ? text : '100000000')), onChangeTextQ((onChangeTextInput(text) <= 100000000 ? onChangeTextInput(text) : onChangeTextInput('100,000,000')), item), console.log("number", +text); }}></TextInput>
                        </View>
                        <TouchableOpacity style={{flex:1,paddingVertical:5,paddingHorizontal:5,alignItems:'center',justifyContent:'center',borderWidth:0.5,borderRadius:5, borderColor:colors.colorLightBlue }} onPress={()=>{setValue(value+1),onChangeTextQ(value+1,item)}}>
                            <Text style={{color:colors.colorLightBlue, fontWeight:'bold'}}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTextInput: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 15, paddingVertical: 10, marginTop: 10, borderRadius: 10, color: colors.colorLightBlue, textAlign: 'center', fontWeight: 'bold'
    }
})
export default React.memo(ItemPrOrderStock);