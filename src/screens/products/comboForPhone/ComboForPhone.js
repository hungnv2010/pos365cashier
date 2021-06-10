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
import { setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';
import colors from '../../../theme/Colors';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ApiPath } from "../../../data/services/ApiPath";
import { HTTPService } from "../../../data/services/HttpService";
import { Title } from 'react-native-paper';

export default (props) => {
    const [product, setProduct] = useState({})
    const [listFomular, setListFormular] = useState([])
    const [sumQuantity, setSumQuantity] = useState(0)
    const [listPr, setListPr] = useState([])
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            getData(props.route.params)
        }
    }, [])
    const getData = (param) => {
        let list = JSON.parse(JSON.stringify(param.list))
        setListFormular(list)
        let productTmp = JSON.parse(JSON.stringify(param.product))
        setProduct(productTmp)
    }
    useEffect(() => {
        let arrPr = []
        listFomular.forEach(el => {
            let paramFilter = `(substringof('${el.Product.Code}',Code) or substringof('${el.Product.Code}',Name) or substringof('${el.Product.Code}',Code2) or substringof('${el.Product.Code}',Code3) or substringof('${el.Product.Code}',Code4) or substringof('${el.Product.Code}',Code5))`
            new HTTPService().setPath(ApiPath.PRODUCT).GET({ IncludeSummary: true, Inlinecount: 'allpages', CategoryId: -1, PartnerId: 0, top: 20, filter: paramFilter }).then((res) => {
                if (res != null) {
                   arrPr.push({ ...res.results[0], Quantity: el.Quantity })
                }
            })
        })
        setListPr(arrPr)
    }, [listFomular])

    const outputTextSearch = () => {

    }
    const clickSelectProduct = () => {
        console.log("click");
        props.navigation.navigate('SelectProduct', { _onSelect: onCallBack, listProducts: listPr })
    }
    const delItem = (index) => {
        listFomular.splice(index, 1)
        setListFormular([...listFomular])
    }

    const onCallBack = (data) => {
        console.log("data", data);
        let arrFormular = []
        setListPr(data)
        data.forEach(el => {

            let itemCombo = {
                Cost: el.Cost,
                ItemId: el.Id,
                Product: { Code: el.Code, Cost: el.Cost, Name: el.Name, Unit: el.Unit },
                Quantity: el.Quantity,
                QuantityLargeUnit: 0
            }
            arrFormular.push(itemCombo)

        })
        setListFormular([...arrFormular])


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

    useEffect(() => {
        console.log("list formular", listFomular);
        let sum = 0;
        if (listFomular.length > 0) {
            listFomular.forEach(el => {
                sum = sum + el.Quantity
            })
            setSumQuantity(sum)
        } else {
            setSumQuantity(0)
        }
    }, [listFomular])
    const onClickOk = () => {
        props.route.params._onSelect(listFomular, 1);
        props.navigation.goBack()
    }
    const outputListProducts = (data, type) =>{
        console.log(data);
        listFomular.forEach(el =>{
            if(el.ItemId == data[0].Id){
                el.Quantity += 1;
                setListFormular([...listFomular])
            }else{
                let itemCombo = {
                    Cost: data[0].Cost ? data[0].Cost : 0,
                    ItemId: data[0].Id,
                    Product: { Code: data[0].Code, Cost: data[0].Cost ? data[0].Cost : 0, Name: data[0].Name, Unit: data[0].Unit },
                    Quantity: 1,
                    QuantityLargeUnit: 0
                }
                setListFormular([...listFomular,itemCombo])
            }
        })
        
    }

    const renderItem = (item, index) => {
        return (
            <View style={{ backgroundColor: '#FFF', flexDirection: 'column', marginBottom: 7 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 10 }}>
                    <View style={{ flex: 9 }}>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{item.Product ? item.Product.Name : ''}</Text>
                        <Text style={{ color: '#4a4a4a', marginTop: 5 }}>{item.Product ? item.Product.Code : ''}</Text>
                    </View>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => delItem(index)}>
                        <Image source={Images.icon_trash} style={{ width: 28, height: 28, justifyContent: 'center' }} />
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 5, flexDirection: 'row', marginBottom: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text>{I18n.t('don_vi_tinh')}</Text>
                        <TouchableOpacity style={{ borderRadius: 5, backgroundColor: '#f2f2f2', padding: 10, marginTop: 5 }}>
                            <Text style={{ textAlign: 'center' }}>{item.Product ? item.Product.Unit : ''}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1.2, marginLeft: 5 }}>
                        <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong')}</Text>
                        <View style={{ flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 5, marginTop: 5, borderWidth: 0.5, borderColor: '#36a3f7' }}>
                            <TouchableOpacity style={styles.styleButton} onPress={() => { item.Quantity = item.Quantity > 0 ? item.Quantity - 1 : 0, setListFormular([...listFomular]) }}>
                                <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>-</Text>
                            </TouchableOpacity>
                            <TextInput style={{ flex: 2.5, textAlign: 'center', padding: 10, color: '#36a3f7', fontWeight: 'bold' }} keyboardType={'numbers-and-punctuation'} value={item.Quantity ? item.Quantity + '' : 0 + ''} onChangeText={(text) => { item.Quantity = onChangeTextInput(text), setListFormular([...listFomular]) }}></TextInput>
                            <TouchableOpacity style={styles.styleButton} onPress={() => { item.Quantity = item.Quantity + 1, setListFormular([...listFomular]) }}>
                                <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {product.LargeUnit ?
                        <View style={{ flex: 1.7, marginLeft: 5 }}>
                            <Text style={{ textAlign: 'left' }}>{I18n.t('so_luong_don_vi_tinh_lon')}</Text>
                            <View style={{ flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 5, marginTop: 5, borderWidth: 0.5, borderColor: '#36a3f7' }}>
                                <TouchableOpacity style={styles.styleButton} onPress={() => { item.QuantityLargeUnit = item.QuantityLargeUnit > 0 ? item.QuantityLargeUnit - 1 : 0, setListFormular([...listFomular]) }}>
                                    <Text style={{ color: '#36a3f7', fontWeight: 'bold' }}>-</Text>
                                </TouchableOpacity>
                                <TextInput style={{ flex: 2.5, textAlign: 'center', padding: 10, color: '#36a3f7', fontWeight: 'bold' }} keyboardType={'numbers-and-punctuation'} value={item.QuantityLargeUnit ? item.QuantityLargeUnit + '' : 0 + ''} onChangeText={(text) => { item.QuantityLargeUnit = onChangeTextInput(text), setListFormular([...listFomular]) }}></TextInput>
                                <TouchableOpacity style={styles.styleButton} onPress={() => { item.QuantityLargeUnit = item.QuantityLargeUnit + 1, setListFormular([...listFomular]) }}>
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
        <View style={{ flex: 1 }}>
            <ToolBarCombo
                {...props}
                title={I18n.t('thanh_phan_combo')}
                //outputClickProductService={outputClickProductService}
                navigation={props.navigation}
                outputTextSearch={outputTextSearch}
                clickRightIcon={clickSelectProduct}
                outputListProducts={outputListProducts}
            />
            {
                listFomular.length > 0 ?
                    <KeyboardAwareScrollView style={{ marginTop: 5, flexDirection: 'column', flex: 1 }}>
                        <View style={{ height: 44, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                            <Text style={{ color: '#4a4a4a', fontWeight: 'bold', textTransform: 'uppercase' }}>{listFomular.length} {I18n.t('san_pham')}</Text>
                            <Text style={{ color: '#4a4a4a' }}>{I18n.t('so_luong')} : {sumQuantity}</Text>
                        </View>
                        <View style={{}}>
                            <FlatList data={listFomular}
                                renderItem={({ item, index }) => renderItem(item, index)}
                                keyExtractor={(item, index) => index.toString()} />

                        </View>
                    </KeyboardAwareScrollView> :
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={Images.logo_365_long_color} style={{ justifyContent: 'center', alignItems: 'center' }} />
                    </View>

            }
            <View style={{ alignItems: 'stretch', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, paddingHorizontal: 10, justifyContent: 'flex-end' }} onPress={() => onClickOk()}>
                    <Text style={{ textAlign: 'center', color: '#fff', paddingVertical: 10, fontWeight: 'bold' }}>{I18n.t('xong')}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    styleButton: { alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 5, backgroundColor: '#eeffff' }
})