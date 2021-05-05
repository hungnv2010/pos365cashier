import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet,ScrollView } from 'react-native';
import { change_alias, currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Images, Metrics } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import TextTicker from 'react-native-text-ticker';
import useDebounce from '../../customHook/useDebounce';
import colors from '../../theme/Colors';

export default (props) => {
    const [listProduct, setListProduct] = useState([])
    const [textSearch, setTextSearch] = useState('')
    const productTmp  = useRef([])
    const debouncedVal = useDebounce(textSearch)
    useEffect(() => {
        getProduct()
    },[])
    const getProduct = () => {
        new HTTPService().setPath(ApiPath.PRODUCT).GET().then(res => {
            if (res != null) {
                setListProduct([...res.results])
                productTmp.current = res.results
            }
        })
    }
    const onClickItem = (data) =>{
        new HTTPService().setPath(ApiPath.ADD_EXTRA).POST({ProductId:data}).then(res=>{
            props.outPut(res)
        })
    }
    useEffect(()=>{
        let list = productTmp.current.filter(item=>change_alias(item.Name).indexOf(change_alias(debouncedVal)) != -1)
        setListProduct(list)
    },[debouncedVal])
    return (
        <View style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius:5,width:Metrics.screenWidth*0.8}}>
            <Text style={{paddingVertical:10,fontWeight:'bold',fontSize:16,color:colors.colorLightBlue}}>{I18n.t('chon_hang_hoa')}</Text>
            <TextInput style={{backgroundColor:'#f2f2f2',paddingVertical:10,paddingHorizontal:5,borderRadius:10}} placeholder={I18n.t('nhap_ten_hang_hoa')} onChangeText={(text)=>setTextSearch(text)}></TextInput>
            <ScrollView style={{paddingVertical:10}} showsVerticalScrollIndicator={false}>
            {
                listProduct.map((item, index) => {
                    return (
                        <View style={{borderBottomWidth:1,borderBottomColor:'#f2f2f2',paddingVertical:10}}>
                            <TouchableOpacity style={{ flexDirection: 'row'}} onPress={()=>onClickItem(item.Id)}>
                                <View style={{marginRight:10,flex:4,flexDirection:'row'}}>
                                <Text>{item.Name}</Text>
                                </View>
                                <View style={{flex:1.8,flexDirection:'row'}}>
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