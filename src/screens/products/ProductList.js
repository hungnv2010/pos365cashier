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
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC } from '../../common/Utils';
import ToolBarNoteBook from '../../components/toolbar/ToolBarNoteBook';
import ProductDetail from '../../screens/products/ProductDetail'

export default (props) => {
    const isReLoad = useRef(false);
    const [listProduct, setListProduct] = useState([])
    const [category, setCategory] = useState([{
        Id: -1,
        Name: 'Tất cả'
    }])
    const itemProduct = useRef()
    const typeBtn = useRef()
    const [itProduct, setItProduct] = useState()
    useEffect(() => {
        getData()

    }, [])
    const [idCategory, setIdCategory] = useState(-1)
    const { deviceType } = useSelector(state => {
        return state.Common
    })
    const getData = async () => {
        productTmp = await realmStore.queryProducts()
        console.log("product", productTmp.ProductImages);
        setListProduct(productTmp)
        categoryTmp = await realmStore.queryCategories()
        console.log("catygory", categoryTmp);
        setCategory([...category, ...categoryTmp])
    }
    const filterByCategory = (item) => {
        if (item.Id > 0) {
            setListProduct(productTmp.filter(el => el.CategoryId === item.Id));
            setIdCategory(-1)
        } else
            setListProduct(productTmp)
        setIdCategory(item.Id)
    }
    const onClickItem = (el) => {
        itemProduct.current = el
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.ProductDetail, { product: el, category: category })
        } else {
            setItProduct(el)
        }
    }
    
    const renderCategory = (item, index) => {
        return (
            <View key={index.toString()} style={{ alignItems: 'center', justifyContent: 'center', padding: 10, marginLeft: 5, marginRight: 10, marginBottom: 5, marginTop: 5, backgroundColor: idCategory == item.Id ? colors.colorchinh : null, borderRadius: 10 }}>
                <TouchableOpacity style={{}} onPress={() => { filterByCategory(item) }}>
                    <Text style={{ color: idCategory == item.Id ? 'white' : 'black', fontWeight: idCategory == item.Id ? 'bold' : null }} >{item.Name}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    useEffect(()=>{
        console.log("product item",itProduct);
    },[itProduct])
    const renderProduct = (item, index) => {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => onClickItem(item)} style={{ backgroundColor: '#F5F5F5' }}>
                <View style={{ backgroundColor: 'white', padding: 10, margin: 5, borderRadius: 16, borderColor: 'silver', borderWidth: 0.5, }}>
                    <View style={{ flexDirection: 'row' }}>
                        {item.ProductImages != "" && JSON.parse(item.ProductImages).length > 0 ?
                        <Image style={{ height: 48, width: 48, borderRadius: 16 }} source={{ uri: JSON.parse(item.ProductImages)[0].ImageURL }} />
                        : <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: colors.colorchinh }}>
                            <Text style={{ textAlign: 'center', color: 'white' }}>{item.Name ? item.Name.indexOf(' ') == -1 ? item.Name.slice(0, 2).toUpperCase() : (item.Name.slice(0, 1) + item.Name.slice(item.Name.indexOf(' ') + 1, item.Name.indexOf(' ') + 2)).toUpperCase() : null}</Text>
                        </View>
                    }
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: 5, marginLeft: 5 }}>
                            <Text>{item.Name}</Text>
                            <Text style={{ color: '#36a3f7', fontWeight: 'bold', marginTop: 5 }}>{currencyToString(item.Price)} đ</Text>
                        </View>

                    </View>
                    <View style={{ backgroundColor: 'silver', height: 0.5, margin: 5, marginTop: 10 }}></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, padding: 5 }}>
                        <View style={{ borderRadius: 5 }}>
                            <Text style={{ borderRadius: 5, color: '#36a3f7' }}>{item.Code}</Text>
                        </View>
                        <View style={{ borderRadius: 5, }}>
                            <Text style={{ color: item.OnHand > 0 ? '#36a3f7' : colors.colorchinh, }}>{item.ProductType != 2 ? 'Tồn kho:' + currencyToString(item.OnHand) : '---'}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    const outputIsSelectProduct = (input) => {
        console.log("input", input);
        if (input != '') {
            setListProduct(productTmp.filter(item => item.Name.indexOf(input) > -1))
        } else {
            setListProduct(productTmp)
        }
        setIdCategory(-1)
    }
    

    return (
        <View style={{ flex: 1, flexDirection: 'column', }}>
            <ToolBarNoteBook
                {...props}
                title={I18n.t('hang_hoa')}
                clickLeftIcon={() => { props.navigation.goBack() }}
                rightIcon="md-search"
                clickRightIcon={(textSearch) => outputIsSelectProduct(textSearch)}
            />
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ backgroundColor: '#F5F5F5', flexDirection: 'column', flex: 1 }}>
                    <View style={{ backgroundColor: "#FFDEAD", marginTop: 5, borderRadius: 10, marginLeft: 5, marginRight: 5 }}>

                        <FlatList
                            data={category}
                            // onEndReachedThreshold={0.1}
                            // onEndReached={viewData.length == 0 ? onLoadMore : filterMore}
                            renderItem={({ item, index }) => renderCategory(item, index)}
                            horizontal={true}
                            style={{ marginRight: 10, marginLeft: 10 }}
                             keyExtractor={(item, index) => index.toString()}
                             showsHorizontalScrollIndicator={false}
                        // ref={refs => roomHistoryRef.current = refs}
                        // ListFooterComponent={loadMore ? <ActivityIndicator color={colors.colorchinh} /> : null}
                        // onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false }}
                        // ref={flatlistRef}
                        />
                    </View>
                    <FlatList
                        data={listProduct}
                        renderItem={({ item, index }) => renderProduct(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <FAB
                        style={styles.fab}
                        icon='plus'
                        color="#fff"
                        onPress={() => {
                            onClickItem({})
                        }}
                    />

                </View>

                {deviceType == Constant.TABLET? itProduct!=null ?
                    <View style={{ flex: 1 }}>
                        <ProductDetail iproduct={itProduct } iCategory={category}/>
                    </View>
                    :<View style={{flex:1}}></View>
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