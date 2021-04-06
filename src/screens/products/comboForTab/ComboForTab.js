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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default (props) => {
    const [listProduct, setListProduct] = useState([])
    const [sumQuantity, setSumQuantity] = useState(0)
    const [value, setValue] = useState('')
    const [product, setProduct] = useState({})
    const orientaition = useSelector(state => {
        return state.Common.orientaition
    });
    useEffect(() => {
        getData(props.route.params)
    }, [])
    const getData = (param) => {
        //itemProduct.current = JSON.parse(JSON.stringify(param.list))
        setListProduct(param.list)
        console.log("param list", param.list);
        setProduct(param.product)
    }
    useEffect(() => {
        console.log("list product", listProduct);
        let sum = 0;
        if (listProduct.length > 0) {
            listProduct.forEach(el => {
                sum = sum + el.Quantity
            })
            setSumQuantity(sum)
        }
    }, [listProduct])

    const outputTextSearch = (text) => {
        setValue(text)
    }

    const outputSelectedProduct = (product) => {
        console.log("click product", product);
        let isExist = false
        if (listProduct.length > 0) {
            listProduct.forEach(item => {
                if (item.ItemId == product.Id) {
                    isExist = true
                    item.Quantity = item.Quantity + 1
                    setListProduct([...listProduct])
                    return
                }
            })
        }
        if (isExist == false) {
            let itemCombo = {
                Cost: product.Cost,
                ItemId: product.Id,
                Product: { Code: product.Code, Cost: product.Cost, Name: product.Name, Unit: product.Unit },
                Quantity: 1,
                QuantityLargeUnit: 0
            }
            if (listProduct.length > 0) {
                setListProduct([...listProduct, itemCombo])
            } else {
                let listp = []
                listp.push(itemCombo)
                setListProduct(listp)
            }
        }

    }

    const delItem = (index) => {
        listProduct.splice(index, 1)
        setListProduct([...listProduct])
    }

    const onClickOk = () => {
        props.route.params._onSelect(listProduct, 2);
        props.navigation.goBack()
    }

    const renderItemCombo = (item, index) => {
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
                    <View style={{ flex: 1.2, marginLeft: 5 }}>
                        <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong')}</Text>
                        <TextInput style={{ textAlign: 'center', borderRadius: 5, backgroundColor: '#f2f2f2', padding: 10, marginTop: 5 }} keyboardType={'numbers-and-punctuation'} value={item.Quantity ? item.Quantity + '' : 0 + ''} onChangeText={(text) => { item.Quantity = parseInt(text), setListFormular([...listFomular]) }}></TextInput>
                    </View>
                    {product.LargeUnit ?
                        <View style={{ flex: 1.7, marginLeft: 5 }}>
                            <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong_don_vi_tinh_lon')}</Text>
                            <TextInput style={{ textAlign: 'center', borderRadius: 5, backgroundColor: '#f2f2f2', padding: 10, marginTop: 5 }} keyboardType={'numbers-and-punctuation'} value={item.QuantityLargeUnit ? item.QuantityLargeUnit + '' : 0 + ''} onChangeText={(text) => { item.QuantityLargeUnit = parseInt(text), setListFormular([...listFomular]) }}></TextInput>
                        </View> : null
                    }

                </View>
            </View>
        )
    }
    return (
        <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flex: 3, }}>
                <ToolBarCombo
                    {...props}
                    //outputClickProductService={outputClickProductService}
                    navigation={props.navigation}
                    outputTextSearch={outputTextSearch}
                />
                <View style={{ flex: 1, }}>
                    <SelectProduct listProducts={listProduct.length > 0 ? listProduct : []} valueSearch={value}
                        numColumns={orientaition == Constant.LANDSCAPE ? 3 : 3}
                        outputSelectedProduct={outputSelectedProduct}
                    />
                </View>

            </View>
            <View style={{ flex: 2, borderLeftWidth: 0.3 }}>
                <View style={{ height: 44, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                    <Text style={{ color: '#4a4a4a', fontWeight: 'bold', textTransform: 'uppercase' }}>{listProduct.length} {I18n.t('san_pham')}</Text>
                    <Text style={{ color: '#4a4a4a' }}>{I18n.t('so_luong')} : {sumQuantity}</Text>
                </View>

                {listProduct.length > 0 ?
                    <KeyboardAwareScrollView>
                        <FlatList data={listProduct}
                            renderItem={({ item, index }) => renderItemCombo(item, index)}
                            keyExtractor={(item, index) => index.toString()} />
                    </KeyboardAwareScrollView>
                    : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={Images.logo_365_long_color} style={{ justifyContent: 'center', alignItems: 'center' }} />
                    </View>
                }

                <TouchableOpacity style={{ backgroundColor: '#36a3f7', paddingHorizontal: 10, }} onPress={() => onClickOk()}>
                    <Text style={{ textAlign: 'center', color: '#fff', paddingVertical: 10, fontWeight: 'bold' }}>{I18n.t('xong')}</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}