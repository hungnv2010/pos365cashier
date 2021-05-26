import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import { Images, Metrics } from '../../theme';
import I18n from "../../common/language/i18n";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';


export default (props) => {
    const [value, setValue] = useState({})
    const [key, setKey] = useState()
    const [input, setInput] = useState()
    const [list, setList] = useState(props.listItem)

    const onClickButton = () => {
        props.outputValue(value)
        console.log("value",JSON.stringify(value));


    }
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {
        setList[props.listItem]
        list.forEach(element => {
            value[element.Key] = element.Value
        });
        console.log("object",JSON.stringify(value));
    }, [props.listItem])
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
        } else {
            text = text.replace(/,/g, "");
            text = Number(text);
        }
        return text
    }
    const renderItem = (item, index) => {
        return (
            <View style={{paddingHorizontal:Metrics.screenWidth*0.03}} >
                <Text style={styles.styleContent}>{I18n.t(item.Name)}</Text>
                <TextInput style={styles.styleTextInput} keyboardType={typeof(item.Value) == 'number' ? 'number-pad' : 'default'} value={item.Value ? typeof (item.Value) == 'string' ? item.Value : currencyToString(item.Value) : null} placeholder={item.Hint != '' ? I18n.t(item.Hint) : item.Hint} placeholderTextColor="#bbbbbb" onChangeText={(text) => { setInput(item.isNum == true ? onChangeTextInput(text):text); item.Value = item.isNum== true? onChangeTextInput(text) : text ; setKey(item.Key); setList([...list]); }}></TextInput>
            </View>
        )
    }
    return (
        <View style={{ backgroundColor: 'white', borderRadius: 5, width:deviceType == Constant.PHONE ? Metrics.screenWidth*0.8 : Metrics.screenWidth*0.65, marginLeft:deviceType == Constant.TABLET ? Metrics.screenWidth*0.075 :0 }}>
            <Text style={[styles.styleTitle, { marginTop: 10 }]}>{props.title}</Text>
            <View style={styles.styleLine}></View>
                <FlatList
                    data={list}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
            <Text style={[styles.styleContent]}>{props.content}</Text>
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
        backgroundColor: colors.colorLightBlue,
        borderRadius: 10,  marginBottom: 20,marginHorizontal:Metrics.screenWidth*0.03+10
    },
    styleTextInput: {
        borderRadius: 10, padding: 12, marginRight: 10, marginLeft: 10, fontSize: 14, color: "#4a4a4a",backgroundColor:'#f2f2f2', borderColor:'#bbbbbb',borderWidth:0.5
    },
    styleLine: {
        height: 1, marginLeft: 10, marginRight: 10, backgroundColor: '#DCDCDC'
    }

})