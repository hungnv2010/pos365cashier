import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput,StyleSheet } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Images } from '../../theme';

export default (props) =>{
    const onClickApply = (value) =>{
        props.outputConfirm(value)
    }
    const onCancel = ()=>{
        props.outputConfirm()
    }
    return(
        <View style={{backgroundColor:'white',borderRadius:10}}>
            <View style={styles.styleBackgroundTitle}>
            <Text style={[styles.styleTiltle,{color:'white'}]}>{props.title}</Text>
            <Image style={{alignContent:'center',width:20,height:20}} source={Images.icon_bell}></Image>
            </View>
            <Text style={{textAlign:'center',padding:10}}>{props.content}</Text>
            <View style={{flexDirection:'row',padding:10}}>
                <TouchableOpacity style={[styles.styleButton,{backgroundColor:'#B0E2FF',marginRight:5}]} onPress={onCancel}>
                    <Text style={[styles.styleTiltle,{color:'#1E90FF'}]}>{props.titleCancle}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.styleButton,{backgroundColor:'#1E90FF',marginLeft:5}]} onPress={onClickApply(true)}>
                    <Text style={[styles.styleTiltle,{color:'white'}]}>{props.titleApply}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTiltle:{
        fontWeight:'bold',
        textAlign:'center',
        padding:10
    },
    styleButton:{
        flex:1,justifyContent:'center',borderRadius:5
    },
    styleBackgroundTitle:{backgroundColor:'#1E90FF', alignContent:'center',alignItems:'center',flexDirection:'column',padding:10,borderTopStartRadius:10,borderTopEndRadius:10}
})