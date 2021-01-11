import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { Metrics, Images, Colors } from '../../theme';

export default (props) => {
    const [checked, setChecked] = useState([]);
    const name = useRef('')
    useEffect(()=>{
        console.log("sdfajsdklfa",checked);
    },[checked])
    const clickItem = (value) =>{
        setChecked([...checked, value])
    }
    const renderItem = (item, index) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => clickItem(item)} style={{ flexDirection: 'row' }}>
                    <Checkbox style={{ borderWidth: 1 }} status={checked ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setChecked(!checked);
                        }} ></Checkbox>
                    <Text style={{ textAlign: 'center', marginTop: 10 }}>{item.Name}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ backgroundColor: 'white', borderRadius: 5, maxHeight: Metrics.screenHeight * 0.7 }}>
            <Text style={{ textAlign: 'center', padding: 10, fontWeight: 'bold' }}>{props.title}</Text>
            <FlatList
                data={props.listItem}
                renderItem={({ item, index }) => renderItem(item, index)}
            />
            <TouchableOpacity style={styles.styleButton}>
                <Text style={{ textAlign: 'center', padding: 10, fontWeight: 'bold',color:'white'}}>{props.titleButton}</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    styleButton:{marginLeft:10,marginRight:10,backgroundColor:'#1E90FF',marginBottom:10,marginTop:10,borderRadius:5},
})