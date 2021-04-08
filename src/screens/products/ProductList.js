import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';
import dataManager from '../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias } from '../../common/Utils';
import ToolBarNoteBook from '../../components/toolbar/ToolBarNoteBook';
import ProductDetail from '../../screens/products/ProductDetail'
import dialogManager from '../../components/dialog/DialogManager';
import CustomerToolBar from '../../screens/customerManager/customer/CustomerToolBar';
import useDebounce from '../../customHook/useDebounce';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default (props) => {
    const isReLoad = useRef(false);
    const [listProduct, setListProduct] = useState([])
    const [category, setCategory] = useState([])
    const [itProduct, setItProduct] = useState({})
    const [compositeItemProducts, setCompositeItemProducts] = useState([])
    const itemProduct = useRef()
    const [textSearch, setTextSearch] = useState('')
    const debouncedVal = useDebounce(textSearch)
    const [qrScan, setQrScan] = useState()
    const [pos, setPos] = useState(0)
    const productTmp = useRef([])
    useEffect(() => {
        dialogManager.showLoading()
        getData()
    }, [])

    const [idCategory, setIdCategory] = useState(-1)
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });
    let categoryTmp = []
    const getData = async () => {
        productTmp.current = await (await realmStore.queryProducts()).filtered(`TRUEPREDICATE SORT(Id DESC) DISTINCT(Id)`)
        console.log("product", productTmp);
        setListProduct(productTmp.current)
        categoryTmp = await realmStore.queryCategories()
        setCategory([{
            Id: -1,
            Name: 'Tất cả'
        }, ...categoryTmp])
        dialogManager.hiddenLoading()
    }
    useEffect(() => {
        console.log("product item", listProduct);
        console.log("catygorytmp", category);
    }, [listProduct, category])

    const filterByCategory = (item) => {
        if (item.Id > 0) {
            setListProduct(productTmp.current.filter(el => el.CategoryId === item.Id));
            setIdCategory(-1)
        } else
            setListProduct(productTmp.current)
        setIdCategory(item.Id)
    }
    const onClickItem = (el) => {
        itemProduct.current = el
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.ProductDetail, { product: itemProduct.current, onCallBack: handleSuccess, })
        } else {
            setItProduct(el)
        }
    }
    const handleSuccess = async (type1, value, data) => {
        console.log("type", type1);
        dialogManager.showLoading()
        try {
            setCategory([])
            setItProduct({})
            if (value == 2) {
                setItProduct(data)
                await realmStore.deleteProduct()
                await dataManager.syncProduct()
            } else if (value == 1) {
                await dataManager.syncCategories()
            }
            getData()
            dialogManager.showPopupOneButton(`${I18n.t(type1)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }

    const renderCategory = (item, index) => {
        return (
            <View key={index.toString()} style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 10, marginLeft: 5, marginRight: 10, marginBottom: 5, marginTop: 5, backgroundColor: idCategory == item.Id ? colors.colorchinh : null, borderRadius: 18 }}>
                <TouchableOpacity style={{}} onPress={() => { filterByCategory(item) }}>
                    <Text style={{ color: idCategory == item.Id ? 'white' : 'black', fontWeight: idCategory == item.Id ? 'bold' : null }} >{item.Name}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const outPut = (data) => {
        if (data.comboTab == true) {
            console.log("data.list", data.list);
            props.navigation.navigate('ComboForTab', { list: data.list, product: data.product, _onSelect: onCallBack })
        } else if (data.scanQrCode == true) {
            props.navigation.navigate('QRCode', { _onSelect: onCallBackQr })
        }
    }
    const onCallBackQr = (data) => {
        setQrScan(data)
    }
    const onCallBack = (data) => {
        console.log("callback data", data);
        setCompositeItemProducts(data)
    }
    
    const renderProduct = (item, index) => {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => onClickItem(item)} style={{ backgroundColor: '#F5F5F5' }}>
                <View style={{ backgroundColor: itProduct && itProduct.Id == item.Id ? '#FFE5B4' : '#FFF', padding: 10, margin: 5, borderRadius: 16, borderColor: 'silver', borderWidth: 0.5, }}>
                    <View style={{ flexDirection: 'row' }}>
                        {item.ProductImages != "" && JSON.parse(item.ProductImages).length > 0 ?
                            <Image style={{ height: 48, width: 48, borderRadius: 16 }} source={{ uri: JSON.parse(item.ProductImages)[0].ImageURL }} />
                            : <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: colors.colorchinh }}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>{item.Name ? item.Name.indexOf(' ') == -1 ? item.Name.slice(0, 2).toUpperCase() : (item.Name.slice(0, 1) + item.Name.slice(item.Name.indexOf(' ') + 1, item.Name.indexOf(' ') + 2)).toUpperCase() : null}</Text>
                            </View>
                        }
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: 5, marginLeft: 5 }}>
                            <Text>{item.Name}</Text>
                            <View style = {{flexDirection:'row'}}>
                            <Text style={{ color: colors.colorLightBlue, fontWeight: 'bold', marginTop: 5 }}>{currencyToString(item.Price)} đ</Text>
                            {
                                item.LargeUnit && item.LargeUnit != ''  ?
                                <Text style={{ color: colors.colorLightBlue, fontWeight: 'bold', marginTop: 5 }}> - {currencyToString(item.PriceLargeUnit)} đ</Text>:null
                            }
                            </View>
                        </View>

                    </View>
                    <View style={{ backgroundColor: 'silver', height: 0.5, margin: 5, marginTop: 10 }}></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, padding: 5 }}>
                        <View style={{ borderRadius: 5 }}>
                            <Text style={{ borderRadius: 5, color: colors.colorLightBlue }}>{item.Code}</Text>
                        </View>
                        <View style={{ borderRadius: 5, }}>
                            <Text style={{ color: item.OnHand > 0 && item.ProductType != 2 ? colors.colorLightBlue : colors.colorchinh, padding: 2 }}>{item.ProductType != 2 ? 'Tồn kho: ' + currencyToString(item.OnHand) : '---'}</Text>
                            {/* <Text style={{ color: colors.colorchinh }}>{item.ProductType ? item.ProductType == 1 ? I18n.t('hang_hoa') : item.ProductType == 2 ? I18n.t('dich_vu') : item.ProductType == 3 ? 'Combo' : '' : ''}</Text> */}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    useEffect(() => {
        outputIsSelectProduct(debouncedVal)
    }, [debouncedVal])
    const outputIsSelectProduct = (input) => {
        dialogManager.showLoading()
        console.log("input", input);
        if (input != '') {
            setListProduct(productTmp.current.filter(item => change_alias(item.Name).indexOf(change_alias(input)) > -1))
            dialogManager.hiddenLoading()
        } else {
            setListProduct(productTmp.current)
            dialogManager.hiddenLoading()
        }
        setIdCategory(-1)

    }
    const outputTextSearch = (value) => {
        console.log('outputTextSearch', value);
        setTextSearch(value)
    }

    return (
        <View style={{ flex: 1, flexDirection: 'column', }}>
            <CustomerToolBar
                {...props}
                navigation={props.navigation}
                title={I18n.t('hang_hoa')}
                outputTextSearch={outputTextSearch}
                size={30}
            />
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ backgroundColor: '#F5F5F5', flexDirection: 'column', flex: 1 }}>
                    <View style={{ backgroundColor: "#FFDEAD", marginTop: 5, borderRadius: 18, marginLeft: 5, marginRight: 5 }}>
                        
                        {category.length > 0 ?
                            <FlatList
                                data={category}
                                renderItem={({ item, index }) => renderCategory(item, index)}
                                horizontal={true}
                                style={{ marginRight: 10, marginLeft: 10 }}
                                keyExtractor={(item, index) => index.toString()}
                                showsHorizontalScrollIndicator={false}
                            /> : null}
                    </View>
                    {listProduct.length > 0 ?
                        <FlatList
                            data={listProduct}
                            renderItem={({ item, index }) => renderProduct(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                            style = {{}}
                        /> : null}
                       
                    <FAB
                        style={styles.fab}
                        icon='plus'
                        color="#fff"
                        onPress={() => {
                            onClickItem({})
                        }}
                    />

                </View>

                {deviceType == Constant.TABLET ? itProduct != null ?
                    <View style={{ flex: 1 }}>
                        <ProductDetail iproduct={itProduct} outPutCombo={outPut} handleSuccessTab={handleSuccess} compositeItemProducts={compositeItemProducts} scanQr={qrScan} />
                    </View>
                    : <View style={{ flex: 1 }}></View>
                    :
                    null
                }

            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    }
})