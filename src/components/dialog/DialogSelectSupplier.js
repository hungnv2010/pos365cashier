import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { currencyToString, dateToDate, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import images from '../../theme/Images';
import { ceil } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Constant } from '../../common/Constant';
import useDebounce from '../../customHook/useDebounce';

export default (props) =>{
    const [listSupplier, setListSuppiler] = useState([])
    const [textSearch, setTextSearch] = useState('')
    const debouncedVal = useDebounce(textSearch)
    useEffect(()=>{
        getData()
    },[])
    useEffect(()=>{
        getData()
    },[debouncedVal])
    const getData = () =>{
        let filters = `(substringof('${debouncedVal}',Code) or substringof('${debouncedVal}',Phone) or substringof('${debouncedVal}',Name))`
        new HTTPService().setPath(ApiPath.CUSTOMER).GET({ Type: 2 , filter:filters }).then(res => {
            if (res != null) {
                setListSuppiler([...res.results])
            }
        })
    }
    const onClickSelectSupplier = (data) =>{
        props.outPut(data)
    }
    return(
        <View style={{ paddingVertical: 15, paddingHorizontal: 10, maxHeight: Metrics.screenHeight * 0.6 }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{I18n.t('chon_nha_cung_cap')}</Text>
                            <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 15, marginVertical: 5, borderRadius: 10, borderColor: colors.colorLightBlue, borderWidth: 0.5 }}>
                                <Ionicons name={'ios-search'} size={20} />
                                <TextInput style={{ flex: 1, paddingHorizontal: 10, color:'#4a4a4a' }} onChangeText={(text) => setTextSearch(text)}></TextInput>
                            </View>
                            <ScrollView style={{}}>
                                {
                                    listSupplier.map((item, index) => {
                                        return (
                                            <TouchableOpacity onPress={() => onClickSelectSupplier(item)} key={index.toString()}>
                                                <View key={index.toString()} style={{ paddingVertical: 10, borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 20, flexDirection: 'row', borderColor: '#4a4a4a', marginVertical: 2 }}>
                                                    <Image source={item.Image ? { uri: item.Image } : Images.icon_employee} style={{ width: 48, height: 48, marginRight: 10 }} />
                                                    <View style={{ justifyContent: 'center' }}>
                                                        <Text>{item.Code}</Text>
                                                        <Text>{item.Name}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
    )
}