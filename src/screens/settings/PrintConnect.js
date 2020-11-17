import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Button, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Metrics } from '../../theme';
import { Constant } from '../../common/Constant';
import I18n from '../../common/language/i18n';
import { RadioButton } from 'react-native-paper'

export default function PrintConnect(props) {
    const [isVisiable, setVisiable] = useState(false)
    const [stylePrint, setStylePrint] = useState(props.stylePrinter ? props.stylePrinter : '')
    const [namePrint, setNamePrint] = useState(props.title ? props.title : '')
    useEffect(() => {
        setStylePrint(props.stylePrinter)
        setNamePrint(props.title)
        setVisiable(false)
    }, [props.stylePrinter, props.title,isVisiable])
    const onClick = () => {
        setVisiable(!isVisiable)
        props.onSet({ title: props.title, stt: !isVisiable, index: props.pos })
    }

    return (
        <TouchableOpacity onPress={onClick}>
            <View style={{ flex: 1 }} >
                <Text style={{ fontSize: 18, marginLeft: 20, marginTop: 20 }} onPress={onClick}>{namePrint}</Text>
                <Text style={{ fontSize: 18, marginLeft: 20, color: 'grey' }} onPress={onClick} >{stylePrint}</Text>
            </View>
        </TouchableOpacity>
    )
}