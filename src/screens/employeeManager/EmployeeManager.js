import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';



export default (props) => {
    const [listUsers, setListUsers] = useState([])

    useEffect(()=>{
        const getListUsers = async () =>{
            let res = await new HTTPService().setPath(ApiPath.USERS).GET()
            if(res != null){
                setListUsers([...res.results])
                console.log("abc",res.results);
            }else{
                
            }
        }
        getListUsers()
    },[])

    useEffect(()=>{
        console.log("list users",listUsers);
    },[listUsers])

    const renderUsers = (item, index) =>{
        return(
            <View>
                <TouchableOpacity>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <Text>{item.UserName}</Text>
                        <Text>{item.IsActive == true ? I18n.t('hoat_dong') : I18n.t('khoa')}</Text>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <Text>{I18n.t('ten_nhan_vien')}</Text>
                        <Text>{item.IsActive == true ? I18n.t('hoat_dong') : I18n.t('khoa')}</Text>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <Text>{item.UserName}</Text>
                        <Text>{item.IsActive == true ? I18n.t('hoat_dong') : I18n.t('khoa')}</Text>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <Text>{item.UserName}</Text>
                        <Text>{item.IsActive == true ? I18n.t('hoat_dong') : I18n.t('khoa')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_nhan_vien')}
                outPutTextSearch={() => { }}
            />
            <Text>quan ly nhan vien</Text>
        </View>
    )
}
