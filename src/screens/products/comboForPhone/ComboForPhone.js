import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault'
import I18n from '../../../common/language/i18n';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct'
import { Constant } from '../../../common/Constant';
import { useSelector } from 'react-redux';
import { Images } from '../../../theme';
import { TextInput } from 'react-native-gesture-handler';
import { ceil } from 'react-native-reanimated';
import { currencyToString } from '../../../common/Utils';
import ToolBarCombo from '../../../components/toolbar/ToolBarCombo'
import { setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';
import { AES } from 'crypto-js';
import colors from '../../../theme/Colors';

export default (props) => {
    const [listFomular, setListFormular] = useState([])
    const [sumQuantity, setSumQuantity] = useState(0)

    useEffect(() => {
        getData(props.route.params)

    }, [])
    const getData = (param) => {
        setListFormular([...JSON.parse(JSON.stringify(param.list))])
        console.log("list formular", JSON.parse(JSON.stringify(param.list)));
    }

    const outputTextSearch = () => {

    }
    const clickSelectProduct = () => {
        console.log("click");
        props.navigation.navigate('SelectProduct', { _onSelect: onCallBack, listProducts: listFomular })
    }

    const onCallBack = (data) => {
        console.log("data", data);
        let arrFormular = []
        data.forEach(el => {
            if (el.Id) {
                let itemCombo = {
                    Cost: el.Cost,
                    ItemId: el.Id,
                    Product: { Code: el.Code, Cost: el.Cost, Name: el.Name, Unit: el.Unit },
                    Quantity: el.Quantity,
                    QuantityLargeUnit: 0
                }
                arrFormular.push(itemCombo)
            } else {
                arrFormular.push(el)
            }
            console.log("arrrrrrrr", arrFormular);
        })
        setListFormular([...arrFormular])

    }
    useEffect(() => {
        console.log("list formular", listFomular);
        let sum = 0;
        listFomular.forEach(el => {
            sum = sum + el.Quantity
        })
        setSumQuantity(sum)
    }, [listFomular])
    const onClickOk = () =>{
        props.route.params._onSelect(listFomular,1);
        props.navigation.goBack()
    }

    const renderItem = (item, index) => {
        return (
            <View style={{ backgroundColor: '#FFF', flexDirection: 'column', marginBottom: 7 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 10 }}>
                    <View>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{item.Product.Name}</Text>
                        <Text style={{ color: '#4a4a4a', marginTop: 5 }}>{item.Product.Code}</Text>
                    </View>
                    <TouchableOpacity onPress={() => delItem(index)}>
                        <Image source={Images.icon_trash} style={{ width: 28, height: 28, justifyContent: 'center' }} />
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', marginBottom: 5 }}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                        <Text>{I18n.t('don_vi_tinh')}</Text>
                        <TouchableOpacity style={{ borderRadius: 5, backgroundColor: '#f2f2f2', padding: 10, marginTop: 5 }}>
                            <Text style={{ textAlign: 'center' }}>{item.Product.Unit}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                        <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong')}</Text>
                        <TextInput style={{ textAlign: 'center', borderRadius: 5, backgroundColor: '#f2f2f2', padding: 10, marginTop: 5 }} keyboardType={'numeric'} value={item.Quantity ? item.Quantity + '' : 0 + ''} onChangeText={(text) => { item.Quantity = parseInt(text), setListFormular([...listFomular]) }}></TextInput>
                    </View>

                </View>
            </View>
        )
    }
    return (
        <View style={{flex:1}}>
            <ToolBarCombo
                {...props}
                //outputClickProductService={outputClickProductService}
                navigation={props.navigation}
                outputTextSearch={outputTextSearch}
                clickRightIcon={clickSelectProduct}
            />
            <View style={{ marginTop: 5, flexDirection: 'column',flex:1 }}>
                <View style={{ height: 44, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                    <Text style={{ color: '#4a4a4a', fontWeight: 'bold', textTransform: 'uppercase' }}>{listFomular.length} {I18n.t('san_pham')}</Text>
                    <Text style={{ color: '#4a4a4a' }}>{I18n.t('so_luong')} : {sumQuantity}</Text>
                </View>
                <View style={{}}>
                <FlatList data={listFomular}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    keyExtractor={(item, index) => index.toString()} />
                    </View>
            </View>
            <View style={{ alignItems: 'stretch', justifyContent: 'flex-end',marginTop:40}}>
                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, paddingHorizontal: 10, justifyContent: 'flex-end' }} onPress={() => onClickOk()}>
                    <Text style={{ textAlign: 'center', color: '#fff', paddingVertical: 10, fontWeight: 'bold' }}>{I18n.t('xong')}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}