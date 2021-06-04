import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
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
import { currencyToString, dateToString, momentToStringDateLocal, dateUTCToMoment2, momentToDate, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';

const ItemPrOrderStock = ({item, index,onChangeText, onClickDelItem}) =>{
    const [value, setValue] = useState(item.Quantity)
    useEffect(()=>{
        setValue(item.Quantity)
    },[item.Quantity])

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
                <TouchableOpacity onPress={()=>onClickDelItem(index)}>
                <Image source={Images.icon_trash} style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
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
                    <TextInput style={styles.styleTextInput} keyboardType={'numbers-and-punctuation'} value={value+""} onChangeText={text => {setValue(text), onChangeText(text,item), console.log("number",+text);}}></TextInput>
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