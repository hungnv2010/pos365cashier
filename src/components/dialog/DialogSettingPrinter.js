import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Keyboard } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import colors from '../../theme/Colors';

export default (props) => {
    const [printer, setPrinter] = useState(props.printer)
    useEffect(() => {
        setPrinter(props.printer)
    }, [props.printer])

    useEffect(() => {
        console.log("printer", printer);
    }, [printer])
    const onClickConfirm = () => {
        Keyboard.dismiss()
        props.outputPrinter(printer)
    }
    return (
        <View style={{ backgroundColor: '#fff', borderRadius: 16 }}>
            <Text style={{ textAlign: 'center', paddingVertical: 10, fontWeight: 'bold' }}>{I18n.t(props.title)}</Text>
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10 }}>
                <TouchableOpacity style={[styles.styleButton, { marginRight: 10, backgroundColor: printer.type == '' ? '#fff' : '#f2f2f2', borderColor: printer.type == '' ? colors.colorLightBlue : '#f2f2f2', borderWidth: 1 }]} onPress={() => setPrinter({ ...printer, type: '', ip: '', size: '' })}>
                    <Text style={{ textAlign: 'center', color: printer.type == '' ? colors.colorLightBlue : null }}>{I18n.t('khong_in')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.styleButton, { marginLeft: 10, backgroundColor: printer.type == 'in_qua_usb' ? '#fff' : '#f2f2f2', borderColor: printer.type == 'in_qua_usb' ? colors.colorLightBlue : '#f2f2f2', borderWidth: 1 }]} onPress={() => setPrinter({ ...printer, type: 'in_qua_usb', ip: '' })}>
                    <Text style={{ textAlign: 'center', color: printer.type == 'in_qua_usb' ? colors.colorLightBlue : null }}>{I18n.t('in_qua_usb')}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                <TouchableOpacity style={[styles.styleButton, { marginRight: 10, backgroundColor: printer.type == 'in_qua_mang_lan' ? '#fff' : '#f2f2f2', borderColor: printer.type == 'in_qua_mang_lan' ? colors.colorLightBlue : '#f2f2f2', borderWidth: 1 }]} onPress={() => setPrinter({ ...printer, type: 'in_qua_mang_lan' })}>
                    <Text style={{ textAlign: 'center', color: printer.type == 'in_qua_mang_lan' ? colors.colorLightBlue : null }}>{I18n.t('in_qua_mang_lan')}</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={[styles.styleButton, { marginLeft: 10, backgroundColor: printer.type == 'in_qua_bluetooth' ? '#fff' : '#f2f2f2', borderColor: printer.type == 'in_qua_bluetooth' ? colors.colorLightBlue : '#f2f2f2', borderWidth: 1 }]} onPress={() => setPrinter({ ...printer, type: 'in_qua_bluetooth', ip: '' })}>
                    <Text style={{ textAlign: 'center', color: printer.type == 'in_qua_bluetooth' ? colors.colorLightBlue : null }}>{I18n.t('in_qua_bluetooth')}</Text>
                </TouchableOpacity> */}
            </View>
            {printer.type != '' ?
                <View style={{ paddingHorizontal: 20, flexDirection: 'column', paddingTop: 20 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ flex: 1 }}>{I18n.t('chieu_rong_kho_giay')}</Text>
                        {printer.type == 'in_qua_mang_lan' ?
                            <Text style={{ marginLeft: 10, flex: 1 }}>{I18n.t('dia_chi_ip')}</Text> : null}

                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <TextInput style={[styles.styleTextInput, { flex: 1 }]} placeholderTextColor={'#808080'} placeholder={'58..80 mm'} keyboardType={'numbers-and-punctuation'} onChangeText={(text) => setPrinter({ ...printer, size: parseInt(text) > 80 ? '80' : parseInt(text) < 58 ? '58' : text })} editable={printer.type != '' ? true : false}></TextInput>
                        {printer.type == 'in_qua_mang_lan' ?
                            <TextInput style={[styles.styleTextInput, { marginLeft: 10, flex: 1 }]} placeholderTextColor={'#808080'} placeholder={'192.168.100.'} value={printer.ip != '' ? printer.ip : '192.168.100.'} keyboardType={'numbers-and-punctuation'} editable={printer.type == 'in_qua_mang_lan' ? true : false} onChangeText={(text) => setPrinter({ ...printer, ip: printer.type == 'in_qua_mang_lan' ? text : '' })}></TextInput> : null
                        }
                    </View>
                </View> : null}
            <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, marginBottom: 10, marginHorizontal: 20, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginVertical: 10, marginTop: 20 }} onPress={() => onClickConfirm()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{I18n.t('ap_dung')}</Text>
            </TouchableOpacity>
        </View>

    )
}
const styles = StyleSheet.create({
    styleButton: { flex: 1, paddingVertical: 10, backgroundColor: '#f2f2f2', borderRadius: 20 },
    styleTextInput: { borderRadius: 10, borderWidth: 1, borderColor: '#bbbbbb', paddingHorizontal: 10, paddingVertical: 10, marginTop: 10, color: '#000' }
})