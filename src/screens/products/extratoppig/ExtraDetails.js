import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import I18n from '../../../common/language/i18n';
import { useSelector } from 'react-redux';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import ToolBarExtraTopping from '../../../components/toolbar/ToolBarExtraTopping';
import { change_alias, currencyToString } from '../../../common/Utils';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import { Constant } from '../../../common/Constant';
import Icon from 'react-native-vector-icons/Entypo';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';

export default (props) => {
    const [extraTopping, setExtraTopping] = useState({})
    const [category,setCategory] = useState([])
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });
    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            getData(props.route.params)
        }
    }, [])

    const getData = (param) => {
        setExtraTopping({ ...JSON.parse(JSON.stringify(param.extra)) })
        console.log("data product", JSON.parse(JSON.stringify(param.extra)));
        setCategory([...JSON.parse(JSON.stringify(param.categoryExtra))])
        console.log("category", category);
    }
    return (
        <View style={{ flex: 1 }}>
            {deviceType == Constant.PHONE ?
                <ToolBarExtraTopping
                    {...props}
                    title={extraTopping.Extra?extraTopping.Extra.Name:null}
                /> : null}
                <View style={{backgroundColor:'#fff',flexDirection:'column'}}>
                    <Text style={styles.styleTitle}>{I18n.t('ten_extra_topping')}</Text>
                    <Text style={[styles.styleTitle,{fontWeight:'bold',color:'#36a3f7',fontSize:16}]}>{extraTopping.Extra?extraTopping.Extra.Name:''}</Text>
                    <Text style={styles.styleTitle}>{I18n.t('ten_nhom')}</Text>
                    <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:10}}>
                        <TouchableOpacity style={{flex:8,backgroundColor:'#bbbbbb',borderRadius:10}}>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:5,paddingVertical:10}}>
                                <Text>{I18n.t('chon_nhom')}</Text>
                                <Image source={Images.icon_arrow_down} style={{width:24,height:24}}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Icon name={'squared-plus'} size={40} color={colors.colorLightBlue}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.styleTitle}>{I18n.t('so_luong_tru_kho_khi_ban')}</Text>
                    <TextInput style={styles.styleTextInput} />
                    <Text style={styles.styleTitle}>{I18n.t('gia_ban')}</Text>
                    <TextInput style={styles.styleTextInput} />
                </View>
                <View style={{flexDirection:'row',alignItems:'flex-end'}}>
                    <TouchableOpacity style={{backgroundColor:colors.colorLightBlue,padding:10,flex:1,marginRight:5}}>
                        <IconMaterial name={'delete'} color={'#fff'} size={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor:colors.colorLightBlue,padding:10,flex:8,marginLeft:5}}>
                        <Text style={{fontWeight:'bold',color:'#fff'}}>{I18n.t('xong')}</Text>
                    </TouchableOpacity>
                </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTextInput:{
        paddingHorizontal:5,paddingVertical:10,backgroundColor:'#bbbbbb',color:'#36a3f7',fontWeight:'bold',marginHorizontal:10,borderRadius:10
    },
    styleTitle:{
        paddingHorizontal:10,paddingVertical:10
    }
})