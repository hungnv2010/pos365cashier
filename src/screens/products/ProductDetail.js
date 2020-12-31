import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Text, FlatList,Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { currencyToString } from '../../common/Utils';
import { TextInput } from 'react-native-gesture-handler';

export default (props) => {
    const [product, setProduct] = useState({})
    const [category, setCategory] = useState({})
    useEffect(()=>{
        getData(props.route.params)
    },[])
    const getData = (param) =>{
        setProduct(JSON.parse(JSON.stringify(param.product)))
        console.log("data product",category);
        setCategory(JSON.parse(JSON.stringify(param.category)))
    }
    return (
        <ScrollView>
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
                <ToolBarDefault
                    {...props}
                    leftIcon="keyboard-backspace"
                    title={I18n.t('chi_tiet_hang_hoa')}
                    clickLeftIcon={() => { props.navigation.goBack() }}
                />
                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Image style={{ width: 70, height: 70, }} source={Images.icon_product} />
                </View>
                <View style={{ padding: 3, backgroundColor: '#E8E8E8' }}></View>
                <View>
                    <Text style={styles.title}>Ten hang hoa</Text>
                    <TextInput style={[styles.textInput,{fontWeight:'bold',color:'#00BFFF'}]} value={product.Name}></TextInput>
                </View>
                <View>
                    <Text style={styles.title}>Loai hang</Text>
                    <TouchableOpacity style={[styles.textInput, {justifyContent:'space-between', flexDirection:'row'}]} >
                        <Text style={styles.titleButton}>{product.ProductType==1?'hang hoa':product==2?'dich vu':'Combo'}</Text>
                        <Image style={{width:20,height:20, }} source={Images.icon_arrow_down}/>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={styles.title}>Ma hang/ SKU/ Ma vach</Text>
                    <TextInput style={[styles.textInput,{fontWeight:'bold',color:'#00BFFF'}]} value={product.Code}></TextInput>
                </View>
                <View>
                    <Text style={styles.title}>Ten nhom</Text>
                    <TouchableOpacity style={[styles.textInput, {justifyContent:'space-between', flexDirection:'row'}]} >
                        <Text style={styles.titleButton}>{product.ProductType==1?'hang hoa':product==2?'dich vu':'Combo'}</Text>
                        <Image style={{width:20,height:20, }} source={Images.icon_arrow_down}/>
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 3, backgroundColor: '#E8E8E8', marginTop:10 }}></View>
                <View>
                    <View style={{flexDirection:'row',justifyContent:'space-between', padding:10, alignItems:'center'}}>
                        <Text style={{fontWeight:'bold',fontSize:18}}>Hien thi hang hoa</Text>
                        <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }}></Switch>
                    </View>
                    <Text style={{marginLeft:10,marginRight:10}}>Hien thi san pham tren danh sach cua man hinh thu ngan</Text>
                </View>
                <View style={{ padding: 3, backgroundColor: '#E8E8E8', marginTop:10 }}></View>
                <View>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <Text style={styles.title}>Gia von</Text>
                            <TextInput style={styles.textInput}></TextInput>
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.title} >Gia ban</Text>
                            <TextInput style={styles.textInput}></TextInput>
                        </View>
                    </View>
                    <View>
                    <Text style={styles.title}>Ton kho</Text>
                    <TextInput style={[styles.textInput,{fontWeight:'bold',color:'#00BFFF'}]} value={product.OnHand?product.OnHand+'':null}></TextInput>
                </View>
                <View>
                    <Text style={styles.title}>Don vi tinh</Text>
                    <TextInput style={[styles.textInput,{fontWeight:'bold',color:'#00BFFF'}]} value={product.Unit}></TextInput>
                </View>
                <TouchableOpacity style={[styles.textInput,{fontWeight:'bold',backgroundColor:'#B0E2FF', marginTop:5, justifyContent:'center', alignItems:'center'}]}>
                    <Text style={[styles.titleButton]}>Don vi tinh lon va cac thong so khac</Text>
                </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    title: {
        padding: 5,
        marginLeft: 10,
        marginTop: 5
    },
    titleButton:{
        fontWeight:'bold',
        color:'#00BFFF'
    },
    textInput: { backgroundColor: '#E8E8E8', marginTop: 5, marginLeft: 15, marginRight: 15, height: 40, borderRadius: 10, padding: 10, borderWidth:0.25,borderColor:'silver' }
})