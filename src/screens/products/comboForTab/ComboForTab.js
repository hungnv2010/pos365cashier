import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault'
import I18n from '../../../common/language/i18n';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct'
import { Constant } from '../../../common/Constant';
import { useSelector } from 'react-redux';
import { Images } from '../../../theme';
import { TextInput } from 'react-native-gesture-handler';
import { currencyToString } from '../../../common/Utils';
import ToolBarCombo from '../../../components/toolbar/ToolBarCombo'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors from '../../../theme/Colors';
import { ApiPath } from "../../../data/services/ApiPath";
import { HTTPService } from "../../../data/services/HttpService";

export default (props) => {
    const [listProduct, setListProduct] = useState([])
    const [sumQuantity, setSumQuantity] = useState(0)
    const [value, setValue] = useState('')
    const [product, setProduct] = useState({})
    const cost = useRef(0)
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
        }else{
            setSumQuantity(0)
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
            let paramFilter = `(substringof('${product.Code}',Code) or substringof('${product.Code}',Name) or substringof('${product.Code}',Code2) or substringof('${product.Code}',Code3) or substringof('${product.Code}',Code4) or substringof('${product.Code}',Code5))`
            new HTTPService().setPath(ApiPath.PRODUCT).GET({ IncludeSummary: true, Inlinecount: 'allpages', CategoryId: -1, PartnerId: 0, top: 20, filter: paramFilter }).then((res) => {
                if (res != null) {
                    let itemCombo = {
                        Cost: res.results[0].Cost,
                        ItemId: product.Id,
                        Product: { Code: product.Code, Cost: res.results[0].Cost, Name: product.Name, Unit: product.Unit },
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

            }).catch((e) => {
                console.log("error", e);
            })

        }

    }
    const onChangeTextInput = (text) => {
        console.log("onChangeTextInput text ===== ", text, props.route);
        if (text == "") {
            text = 0;
        } else {
            text = text.replace(/,/g, "");
            text = Number(text);
        }
        return text
    }

    const delItem = (index) => {
        listProduct.splice(index, 1)
        setListProduct([...listProduct])
    }
    const getCost = (code) => {
        let paramFilter = `(substringof('${code}',Code) or substringof('${code}',Name) or substringof('${code}',Code2) or substringof('${code}',Code3) or substringof('${code}',Code4) or substringof('${code}',Code5))`
        new HTTPService().setPath(ApiPath.PRODUCT).GET({ IncludeSummary: true, Inlinecount: 'allpages', CategoryId: -1, PartnerId: 0, top: 20, filter: paramFilter }).then((res) => {
            if (res != null) {
                console.log("abcdslf", res.results[0].Cost);
                cost.current = res.results[0].Cost
            }

        }).catch((e) => {
            console.log("error", e);
        })
        return cost.current
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
                        <View style={{ borderRadius: 5, backgroundColor: '#f2f2f2', padding: 10, marginTop: 5 ,borderWidth:0.5,borderColor:'#36a3f7'}}>
                        <TouchableOpacity >
                            <Text style={{ textAlign: 'center', color:'#36a3f7' }}>{item.Product.Unit}</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 1.2, marginLeft: 5 }}>
                        <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong')}</Text>
                        <View style={{ flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 5, marginTop: 5 ,borderWidth:0.5,borderColor:'#36a3f7'}}>
                            <TouchableOpacity style={styles.styleButton} onPress={() => { item.Quantity = item.Quantity > 0 ? item.Quantity - 1 : 0, setListProduct([...listProduct]) }}>
                                <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>-</Text>
                            </TouchableOpacity>
                            <TextInput style={{ flex: 2.5, textAlign: 'center', padding: 10, color: '#36a3f7', fontWeight: 'bold' }} keyboardType={'numbers-and-punctuation'} value={item.Quantity ? item.Quantity + '' : 0 + ''} onChangeText={(text) => { item.Quantity = onChangeTextInput(text), setListProduct([...listProduct]) }}></TextInput>
                            <TouchableOpacity style={styles.styleButton} onPress={() => { item.Quantity = item.Quantity + 1, setListProduct([...listProduct]) }}>
                                <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {product.LargeUnit ?
                        <View style={{ flex: 1.7, marginLeft: 5 }}>
                            <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong_don_vi_tinh_lon')}</Text>
                            <View style={{ flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 5, marginTop: 5,borderWidth:0.5,borderColor:'#36a3f7' }}>
                                <TouchableOpacity style={styles.styleButton} onPress={() => { item.QuantityLargeUnit = item.QuantityLargeUnit > 0 ? item.QuantityLargeUnit - 1 : 0, setListProduct([...listProduct]) }}>
                                    <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>-</Text>
                                </TouchableOpacity>
                                <TextInput style={{ flex: 2.5, textAlign: 'center', padding: 10, color: '#36a3f7', fontWeight: 'bold' }} keyboardType={'numbers-and-punctuation'} value={item.QuantityLargeUnit ? item.QuantityLargeUnit + '' : 0 + ''} onChangeText={(text) => { item.QuantityLargeUnit = onChangeTextInput(text), setListProduct([...listProduct]) }}></TextInput>
                                <TouchableOpacity style={styles.styleButton} onPress={() => { item.QuantityLargeUnit = item.QuantityLargeUnit + 1, setListProduct([...listProduct]) }}>
                                    <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>+</Text>
                                </TouchableOpacity>
                            </View>
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
                    title={I18n.t('thanh_phan_combo')}
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

                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, paddingHorizontal: 10, }} onPress={() => onClickOk()}>
                    <Text style={{ textAlign: 'center', color: '#fff', paddingVertical: 15, fontWeight: 'bold' }}>{I18n.t('xong')}</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleButton: { alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 5, backgroundColor: '#eeffff' }
})