import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput,StyleSheet } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Images } from '../../theme';

export default (props) =>{
    const [value, setValue] = useState('')
    const onClickButton = ()=>{
        props.outputValue(value)
    }
    return(
        <View style={{backgroundColor:'white',borderRadius:5}}>
            <Text style={[styles.styleTitle,{marginTop:10}]}>{props.title}</Text>
            <View style={styles.styleLine}></View>
            <Text style={styles.styleContent}>{props.titleInput}</Text>
            <TextInput style={styles.styleTextInput} placeholder={props.titleHint} onChangeText={(text)=>setValue(text)}></TextInput>
            <Text style={[styles.styleContent]}>{props.content}</Text>
            <View style={styles.styleLine}></View>
            <TouchableOpacity style={styles.styleButton} onPress={onClickButton}>
                <Text style={[styles.styleTitle,{color:'white'}]}>{props.titleButton}</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTitle:{
        fontWeight:'bold',
        textAlign:'center',padding:10
    },
    styleContent:{
        padding:10
    },
    styleButton:{
        backgroundColor:'#1E90FF',
        borderRadius:5,marginLeft:10,marginRight:10,marginBottom:20,marginTop:10
    },
    styleTextInput:{
        borderRadius:5,padding:10,borderWidth:1,borderColor:'#1E90FF', marginRight:10,marginLeft:10,fontSize:14
    },
    styleLine:{
        height:1,marginLeft:10,marginRight:10,backgroundColor:'#DCDCDC'
    }

})