import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity,StyleSheet } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { Metrics, Images,Colors } from '../../theme';

export default (props)=>{
    const [nameItem,setNameItem] = useState('')
    const renderItem = (item,index) =>{
        return(
            <View style={{borderColor: nameItem==item.Name?'#1E90FF':'white',borderWidth:1,marginLeft:20,marginRight:20,borderRadius:5}}>
                <TouchableOpacity onPress={()=>setNameItem(item.Name)}>
                <Text style={{padding:5,textAlign:'center', color:nameItem==item.Name?'#1E90FF':null,fontWeight:nameItem==item.Name?'bold':null}}>{item.Name}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    return(
        <View style={{backgroundColor:'white', borderRadius:5,marginTop:100,marginBottom:100,maxHeight:Metrics.screenHeight*0.7}}>
            <Text style={{fontWeight:'bold',padding:10,textAlign:'center'}}>{props.title}</Text>
            <FlatList data={props.listItem} 
            renderItem={({item,index})=> renderItem(item,index)} 
            />
            <TouchableOpacity style={{marginLeft:10,marginRight:10,padding:10,backgroundColor:'#1E90FF',marginBottom:10,marginTop:10,borderRadius:5}}>
                <Text style={{textAlign:'center',fontWeight:'bold',color:'white'}}>{props.titleButton}</Text>
            </TouchableOpacity>
        </View>
    )
}