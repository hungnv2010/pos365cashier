import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarNoteBook';
import CustomerToolBar from '../../../screens/customerManager/customer/CustomerToolBar';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import dialogManager from '../../../components/dialog/DialogManager';
import useDebounce from '../../../customHook/useDebounce';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';
import DialogInput from '../../../components/dialog/DialogInput'
import Ionicons from 'react-native-vector-icons/Fontisto';

export default (props) =>{
    const [data, setData] = useState({})
    const dataTmp = useRef({})
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() =>{
        if(deviceType == Constant.PHONE){
            getData(props.route.params)
        }
    },[])
    const getData = (param) =>{
        console.log(param);
        dataTmp.current = JSON.parse(JSON.stringify(param.data))
        setData({...dataTmp.current})
    }
    const onClickEditCate = () =>{

    }
    const onCLickDelCate = () =>{
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_nhom_hang_hoa'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(`${ApiPath.CATEGORIES_PRODUCT}/${data.Id}`).DELETE()
                    .then(res => {
                        console.log('onClickDelete', res)
                        if (res) {
                            if (res.ResponseStatus && res.ResponseStatus.Message) {
                                dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                    dialogManager.destroy();
                                }, null, null, I18n.t('dong'))
                            } else {
                                if (deviceType == Constant.PHONE) {
                                    props.route.params.onCallBack('xoa', 1)
                                    props.navigation.pop()
                                } else
                                    props.handleSuccessTab('xoa', 1)
                            }
                        }
                    })
                    .catch(err => console.log('ClickDelete err', err))
            }
        })
    }
        return(
        <View style={{flex:1}}>
            <ToolBarDefault
            {...props}
            title={I18n.t('chi_tiet_nhom_hang_hoa')}
            />
            <View style={{flex:1}}>
                <View style={{backgroundColor:'#fff'}}>
                    <View style={{marginHorizontal:30,marginVertical:15, alignItems:'center',justifyContent:'center',backgroundColor:'#f2f2f2',paddingVertical:10,borderRadius:10}}>
                        <Image source={Images.ic_nhomhanghoa}/>
                        <Text style = {{color:colors.colorLightBlue,marginTop:10,fontWeight:'bold'}}>{data.Name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 50 }}>
                    <View style={{ flex: 1, marginRight: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => onClickEditCate()}>
                            <Image source={Images.icon_edit} style={{ width: 16, height: 16 }} />
                            <Text style={{ marginLeft: 8, color: '#f6871e', fontSize: 16 }}>{I18n.t('chinh_sua')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => onCLickDelCate()}>
                            <Ionicons name={'trash'} size={17} color={'#f21e3c'} />
                            <Text style={{ marginLeft: 8, color: '#f21e3c', fontSize: 16 }}>{I18n.t('xoa')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </View>
                <View>
                    <View style={{paddingVertical:15,paddingHorizontal:10,justifyContent:'space-between',flexDirection:'row'}}>
                    <Text style={{fontWeight:'bold',textTransform:'uppercase'}}>{I18n.t('hang_hoa_trong_nhom')}</Text>
                    <Text style={{fontWeight:'bold'}}>{data.Sum}</Text>
                    </View>
                    {data.ListPr ?
                    <ScrollView>
                        {
                            data.ListPr.map((item,index)=>{
                                return(
                                    <View style={{backgroundColor:'#fff',marginVertical:2,marginHorizontal:5,paddingVertical:10,paddingHorizontal:15,borderRadius:10,flexDirection:'row'}}>
                                        <Image style={{ height: 50, width: 50, borderRadius: 16 }} source={ item.ProductImages && JSON.parse(item.ProductImages).length > 0 ? {uri: JSON.parse(item.ProductImages)[0].ImageURL}:Images.ic_nhomhanghoa  } />
                                        <View style={{marginLeft:15,paddingVertical:10}}>
                                        <Text>{item.Name}</Text>
                                        <Text style={{color:'#bbbbbb',marginTop:5}}>{item.Code}</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>:null
                    }
                </View>
            </View>
        </View>
    )
}