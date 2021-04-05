import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";


export default (props) => {
    const [value, setValue] = useState({})
    const [key, setKey] = useState()
    const [input, setInput] = useState()
    const [list, setList] = useState(props.listItem)

    const onClickButton = () => {
        props.outputValue(value)
        console.log("value", value);


    }
    useEffect(() => {
        setList[props.listItem]
        list.forEach(element => {
            value[element.Key] = element.Value
        });
    }, [])
    useEffect(() => {
        let obj = value
        let k = `${key}`
        obj[k] = input
        setValue({ ...obj })
    }, [input])
    const onChangeTextInput = (text) => {
        console.log("onChangeTextInput text ===== ", text, props.route);
        if (text == "") {
            text = 0;
        }else if(text!="" && typeof(text) == 'string'){
            text = text
        } 
        else {
            text = text.replace(/,/g, "");
            text = Number(text);
        }
        return text
    }
    const renderItem = (item, index) => {
        return (
            <View >
                <Text style={styles.styleContent}>{I18n.t(item.Name)}</Text>
                <TextInput style={styles.styleTextInput} value={item.Value ? typeof (item.Value) == 'string' ? item.Value : item.Value == 0 ? 0 + '' : currencyToString(item.Value) : null} placeholder={I18n.t(item.Hint)} placeholderTextColor="#808080" onChangeText={(text) => { setInput(onChangeTextInput(text)),item.Value = onChangeTextInput(text); setKey(item.Key) }}></TextInput>
            </View>
        )
    }
    return (
        <View style={{ backgroundColor: 'white', borderRadius: 5 }}>
            <Text style={[styles.styleTitle, { marginTop: 10 }]}>{props.title}</Text>
            <View style={styles.styleLine}></View>
            <FlatList
                data={list}
                renderItem={({ item, index }) => renderItem(item, index)}
                keyExtractor={(item, index) => index.toString()}
            />
            <Text style={[styles.styleContent]}>{props.content}</Text>
            <View style={styles.styleLine}></View>
            <TouchableOpacity style={styles.styleButton} onPress={onClickButton}>
                <Text style={[styles.styleTitle, { color: 'white' }]}>{props.titleButton}</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTitle: {
        fontWeight: 'bold',
        textAlign: 'center', padding: 15
    },
    styleContent: {
        padding: 10
    },
    styleButton: {
        backgroundColor: '#1E90FF',
        borderRadius: 16, marginLeft: 10, marginRight: 10, marginBottom: 20, marginTop: 10
    },
    styleTextInput: {
        borderRadius: 16, padding: 15, borderWidth: 1, marginRight: 10, marginLeft: 10, fontSize: 14, color: "#4a4a4a"
    },
    styleLine: {
        height: 1, marginLeft: 10, marginRight: 10, backgroundColor: '#DCDCDC'
    }

})