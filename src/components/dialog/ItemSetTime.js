import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { currencyToString, dateToString, timeToString, momentToDate } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Images, Metrics } from '../../theme';
import { set } from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';
import colors from '../../theme/Colors';

export default (props) => {

    const [type, setType] = useState(props.type ? props.type : '')
    const [showModal, setShowModal] = useState(false)
    const [timeFrom, setTimeFrom] = useState(props.timeFrom ? props.timeFrom : null)
    const [timeTo, setTimeTo] = useState(props.timeTo ? props.timeTo : null)
    const [timeValue, setTimeValue] = useState(props.timeValue ? props.timeValue : 0)
    const [date, setDate] = useState(new Date());
    const [dateTmp, setDateTmp] = useState(new Date())
    const [pos, setPos] = useState(0)
    useEffect(() => {
        setType(props.type)
        setTimeFrom(props.timeFrom)
        setTimeTo(props.timeTo)
        setTimeValue(props.timeValue)
    }, [])
    useEffect(() => {

    }, [dateTmp])
    const onChangeDate = (selectedDate) => {
        const currentDate = dateTmp;
        let date = selectedDate.getDate();
        let month = selectedDate.getMonth();
        let year = selectedDate.getFullYear();
        currentDate.setDate(date)
        currentDate.setMonth(month)
        currentDate.setFullYear(year)
        console.log("onChangeTime Date ", currentDate);
        setDateTmp(currentDate);
    };

    const onChangeTime = (selectedDate) => {
        const currentDate = dateTmp;
        let hours = selectedDate.getHours();
        let minutes = selectedDate.getMinutes();
        currentDate.setHours(hours)
        currentDate.setMinutes(minutes)
        console.log("onChangeTime Date ", momentToDate(currentDate));
        setDateTmp(currentDate);

    };
    const onClickOk = () => {
        if (pos == 1) {
            setTimeFrom(momentToDate(dateTmp))
            console.log("setTimeFrom", timeFrom);
        } else if (pos == 2) {
            setTimeTo(momentToDate(dateTmp))
            console.log("setTimeTo", timeTo);
        }
        setShowModal(false)
        console.log("abcd", timeFrom, timeTo);
    }
    useEffect(() => {
        console.log("value Time", timeFrom, timeTo);
        putData()
    }, [timeFrom, timeTo, timeValue, type])
    const putData = () => {
        props.outPut({ Type: type, TimeValue: timeValue, TimeFrom: timeFrom, TimeTo: timeTo })
    }
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
     const onClickDel = () =>{
         setTimeFrom()
         setTimeTo()
     }
    return (
        <View style={{ marginHorizontal: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{I18n.t('khung_gio')}</Text>
                <TouchableOpacity onPress={()=>onClickDel()}>
                <Image source={Images.icon_trash} style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 10 }}>
                <View style={{ flex: 4 }}>
                    <Text style={{}}>{I18n.t('tu')}</Text>
                </View>
                <View style={{ flex: 3 }}>
                    <Text style={{}}>{I18n.t('den')}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                <View style={{ flex: 3 }}>
                    <TouchableOpacity style={{ backgroundColor: '#f2f2f2', paddingVertical: 10, borderRadius: 10 }} onPress={() => { setShowModal(true), setPos(1) }}>
                        <Text style={ styles.textInput }>{timeFrom ? timeToString(timeFrom) : ' HH:mm'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={'clock-outline'} size={24} />
                </View>
                <View style={{ flex: 3 }}>
                    <TouchableOpacity style={{ backgroundColor: '#f2f2f2', paddingVertical: 10, borderRadius: 10 }} onPress={() => { setShowModal(true), setPos(2) }}>
                        <Text style={styles.textInput }>{timeTo ? timeToString(timeTo) : ' HH:mm'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingHorizontal: 10, backgroundColor: '#f2f2f2', height: 1, marginVertical: 10 }}></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ flex: 2 }}>{I18n.t('kieu_thay_doi_gia')}</Text>
                <View style={{ flexDirection: 'row', borderRadius: 10, borderColor: '#36a3f7', flex: 1 }}>
                    <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: '#36a3f7', paddingVertical: 10, alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: type == 'vnd' ? '#36a3f7' : null }} onPress={() => setType('vnd')}>
                        <Text style={{ color: type == 'vnd' ? '#fff' : '#36a3f7' }}>$</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: '#36a3f7', paddingVertical: 10, alignItems: 'center', borderTopRightRadius: 10, borderBottomRightRadius: 10, backgroundColor: type == 'percent' ? '#36a3f7' : null }} onPress={() => setType('percent')}>
                        <Text style={{ color: type == 'percent' ? '#fff' : '#36a3f7' }}>%</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' }}>
                <View style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={{ flex: 1 }}>{type == 'percent' ? I18n.t('ty_le_thay_doi') : I18n.t('gia_tri_thay_doi')} </Text>
                    <Text style={{ flex: 1 }}>(+ {I18n.t('hoac')} -)</Text>
                </View>
                <View style={{ borderRadius: 10, borderColor: '#36a3f7', flex: 1 }}>
                    <TextInput style={{ backgroundColor: '#f2f2f2', borderRadius: 10, paddingVertical: 10, textAlign: 'right', paddingHorizontal: 5,color:'#36a3f7', fontWeight:'bold' }} value={timeValue ? currencyToString(timeValue) : 0+''} onChangeText={(text) => setTimeValue(onChangeTextInput(text))} />
                </View>
            </View>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: Metrics.screenHeight * 0.15 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    >
                        <View></View>
                    </TouchableWithoutFeedback>

                    <View style={{ alignItems: "center", justifyContent: 'center', width: Metrics.screenWidth * 0.75, backgroundColor: '#fff', borderWidth: 0.3, borderColor: 'gray', borderRadius: 5, paddingVertical: 10 }}>
                        <DatePicker date={date}
                            onDateChange={onChangeDate}
                            mode={'date'}
                            display="default"
                            locale="vi-VN" />
                        <View style={{}}></View>
                        <DatePicker date={date}
                            onDateChange={onChangeTime}
                            mode={'time'}
                            display="default"
                            locale="vi-VN" />
                        <View style={{ padding: 10, paddingTop: 0, flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={{ flex: 1, paddingVertical: 10, alignItems: 'center', marginHorizontal: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 10 }} onPress={() => setShowModal(false)}>
                                <Text style={{ color: colors.colorchinh }}>{I18n.t("huy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.colorchinh, marginHorizontal: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 10 }} onPress={() => onClickOk()}>
                                <Text style={{ color: '#fff' }}>{I18n.t("dong_y")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View >
                </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    textInput:{
        textAlign:'center', fontWeight:'bold',color:colors.colorLightBlue
    }
})