import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Images } from '../../theme';
import { set } from 'react-native-reanimated';
import ItemSetTime from '../../components/dialog/ItemSetTime'

export default (props) => {
    const [type1, setType1] = useState(props.type1 ? props.type1 : '')
    const [type2, setType2] = useState(props.type2 ? props.type2 : '')
    const [priceConfig, setPriceConfig] = useState(props.priceConfig ? props.priceConfig : '')
    const [isPercent1, setIsPercent1] = useState(false)
    const [isPercent2, setIsPercent2] = useState(false)
    useEffect(() => {
        setType1(props.type1)
        setType2(props.type2)
        setPriceConfig(props.priceConfig)
        console.log("abc", priceConfig);
    }, [])
    const getOutput = (data) => {
        console.log("get data1", data);
        setPriceConfig({...priceConfig,Type:data.Type,TimeValue:data.TimeValue,TimeFrom:data.TimeFrom,TimeTo:data.TimeTo})
    }
    const getOutput2 = (data) => {
        console.log("get data2", data);
        setPriceConfig({...priceConfig,Type2:data.Type,TimeValue2:data.TimeValue,TimeFrom2:data.TimeFrom,TimeTo2:data.TimeTo})
    }
    useEffect(()=>{
       
    },[priceConfig])
    const onClickOk = ()=>{
        props.putData(priceConfig)
    }
    return (
        <View style={{ backgroundColor: 'white', borderRadius: 5 }}>
            <Text style={{ alignContent: 'center', fontWeight: 'bold', textAlign: 'center', paddingVertical: 10 }}>{I18n.t('khung_gio_dac_biet')}</Text>
            <View style={{ backgroundColor: '#f2f2f2' }}>
                <ItemSetTime type={priceConfig && priceConfig.Type ? priceConfig.Type : null} timeFrom={priceConfig && priceConfig.TimeFrom ? priceConfig.TimeFrom : null} timeTo={priceConfig && priceConfig.TimeTo ? priceConfig.TimeTo : null} timeValue={priceConfig && priceConfig.TimeValue ? priceConfig.TimeValue : 0} outPut={getOutput} />
                <ItemSetTime type={priceConfig && priceConfig.Type2 ? priceConfig.Type2 : null} timeFrom={priceConfig && priceConfig.TimeFrom2 ? priceConfig.TimeFrom2 : null} timeTo={priceConfig && priceConfig.TimeTo2 ? priceConfig.TimeTo2 : null} timeValue={priceConfig && priceConfig.TimeValue2 ? priceConfig.TimeValue2 : 0} outPut = {getOutput2}/>
                <TouchableOpacity style={{ backgroundColor: '#36a3f7', borderRadius: 10, marginHorizontal: 10, paddingVertical: 10, marginVertical: 10 }} onPress={()=>onClickOk()}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Xong</Text>
                </TouchableOpacity>

            </View>

        </View>
    )
}