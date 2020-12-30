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

export default (props) => {
    const isReLoad = useRef(false);
    const [listProduct, setListProduct] = useState([])
    const [category, setCategory] = useState([{
        Id :-1,
        Name : 'Tất cả'
    }])
    useEffect(() => {
        getData()

    }, [])
    const [idCategory,setIdCategory] = useState(-1)
    const getData = async () => {
        productTmp = await realmStore.queryProducts()
        console.log("product", productTmp.ProductImages);
        setListProduct(productTmp)
        categoryTmp = await realmStore.queryCategories()
        console.log("catygory", categoryTmp);
        setCategory([...category,...categoryTmp])
    }
    const filterByCategory=(item) =>{
        if (item.Id>0) {
            setListProduct(productTmp.filter(el => el.CategoryId==item.Id));
            setIdCategory(-1)
        }else 
        setListProduct(productTmp)
        setIdCategory(item.Id)
    }
    const renderCategory = (item, index) => {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 10, marginTop:5 ,backgroundColor:idCategory==item.Id?colors.colorchinh:null}}>
                <TouchableOpacity style={{}} onPress={()=>{filterByCategory(item)}}>
                    <Text style={{color:idCategory==item.Id?'white':'black'}} >{item.Name}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    const renderProduct = (item, index) => {
        return (
            <View style={{ borderRadius: 5, padding: 5, margin: 5, borderColor: 'silver', borderWidth: 0.5, flexDirection: 'row' }}>
                <Image style={{ height: 50, width: 50, borderRadius: 10 }} source={item.ProductImages != "" && JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.icon_product} />
                <View style={{ flex: 1, flexDirection: 'column' , marginLeft:10, marginRight:10}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1,padding:5 }}>
                        <Text>{item.Name}</Text>
                        <Text style={{color:'#0099FF'}}>{currencyToString(item.Price)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 ,padding:5}}>
                        <Text>{item.Code}</Text>
                        <Text style={{color:item.OnHand>0?'#0099FF':'red'}}>{item.ProductType!=2?currencyToString(item.OnHand):'--'}</Text>
                    </View>
                </View>
            </View>
        )
    }
    const outputIsSelectProduct=(input)=>{
        console.log("input", input);
       if (input!='') {
           setListProduct(productTmp.filter(item=>item.Name.indexOf(input)>-1))
       }else{
           setListProduct(productTmp)
       }
       setIdCategory(-1)
    }
    
    return (
        <View>
            <ToolBarNoteBook
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('hang_hoa')}
                clickLeftIcon={() => { props.navigation.goBack() }}
                rightIcon="md-search"
                clickRightIcon={(textSearch) => outputIsSelectProduct(textSearch)}
            />
            <View>
                <FlatList
                    data={category}
                    // onEndReachedThreshold={0.1}
                    // onEndReached={viewData.length == 0 ? onLoadMore : filterMore}
                    renderItem={({ item, index }) => renderCategory(item, index)}
                    horizontal={true}
                // keyExtractor={(item, index) => index.toString()}
                // ref={refs => roomHistoryRef.current = refs}
                // ListFooterComponent={loadMore ? <ActivityIndicator color={colors.colorchinh} /> : null}
                // onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false }}
                // ref={flatlistRef}
                />
                <FlatList
                    data={listProduct}
                    renderItem={({ item, index }) => renderProduct(item, index)}
                />
                
            </View>
        </View>
    )
}