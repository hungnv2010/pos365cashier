import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, Modal, Switch, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Image, StyleSheet } from 'react-native';
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import DateRangePicker from "react-native-daterange-picker";
import moment from "moment";
import { dateToString } from '../../common/Utils';
import { RadioButton } from 'react-native-paper'
import { check } from 'react-native-permissions';
import DatePicker from 'react-native-date-picker';


export default (props) => {

    const [isSelectCustom, setIsSelectCustom] = useState(false)
    const [dateTimePicker, setDateTimePicker] = useState({
        startDate: null,
        endDate: null,
        displayedDate: moment(),
    })

    const onClickSelectTime = (item) => {
        console.log('onClickSelectTime', item);
        if (item.key == 'custom') {
            setIsSelectCustom(true)
            return
        }
        props.outputDateTime(item)
    }

    const setDates = (dates) => {
        console.log('setDates', dates);
        setDateTimePicker({ ...dateTimePicker, ...dates })
    }

    const onCancel = () => {
        props.outputDateTime()
    }

    const onDone = () => {
        const { startDate, endDate } = dateTimePicker
        console.log('onDone dateTimePicker', dateTimePicker);
        let startDateFilter = dateToString(startDate)
        let endDateFilter = dateToString((endDate ? endDate : startDate))
        props.outputDateTime({ startDate, endDate, key: 'custom', name: `${startDateFilter} - ${endDateFilter}` })
    }

    return (
        <View style={{
            padding: 0,
            backgroundColor: "#fff", borderRadius: 5, marginHorizontal: 0,
            // width: !isSelectCustom ? Metrics.screenWidth * 0.5 : null,
            justifyContent: 'center',
        }}>
            {
                !isSelectCustom ?
                    <View>
                        {props.header ?
                            props.header
                            :
                            <View style={{ backgroundColor: "#FF4500" ,borderTopStartRadius:5,borderTopEndRadius:5}}>
                                <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 10, color: "#FFFFFF" }}>{I18n.t('chon_khoang_thoi_gian')}</Text>
                            </View>
                        }
                        {
                            props.timeCustom ?
                                Constant.TIME_SELECT_CUSTOM_TIME.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => onClickSelectTime(item)}
                                            key={index} style={{ paddingVertical: 15, }}>
                                            <Text style={{ textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                                :
                                props.timeAll ?
                                    <CustomTime onClick={onClickSelectTime} onButtonCancel={onCancel}></CustomTime>
                                    :
                                    Constant.TIME_SELECT.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                onPress={() => onClickSelectTime(item)}
                                                key={index} style={{ paddingVertical: 15, }}>
                                                <Text style={{ textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                            </TouchableOpacity>
                                        )
                                    })

                        }
                    </View>
                    :
                    <View style={{
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <DateRangePicker
                            visible={true}
                            onChange={(dates) => setDates(dates)}
                            endDate={dateTimePicker.endDate}
                            startDate={dateTimePicker.startDate}
                            displayedDate={dateTimePicker.displayedDate}
                            maxDate={moment()}
                            range
                            action={<View style={{ flexDirection: "row", margin: 10, alignItems: "center", justifyContent: "center" }}>
                                <TouchableOpacity onPress={onCancel} style={{ marginHorizontal: 20, paddingHorizontal: 30, borderColor: colors.colorchinh, borderWidth: 1, paddingVertical: 10, borderRadius: 5 }}>
                                    <Text style={{ color: colors.colorchinh, textTransform: "uppercase" }}>{I18n.t("huy")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onDone} style={{ marginHorizontal: 20, paddingHorizontal: 30, paddingVertical: 10, backgroundColor: colors.colorchinh, borderRadius: 5, borderWidth: 0 }}>
                                    <Text style={{ color: "#fff", textTransform: "uppercase" }}>{I18n.t("xong")}</Text>
                                </TouchableOpacity>
                            </View>}
                        >
                        </DateRangePicker>
                    </View>
            }
        </View>
    );
};

const CustomTime = (props) => {
    const [itemFilter, setItemFilter] = useState({})
    const [defaut, setDefault] = useState('')

    const onClickRadioButton = (item) => {
        setItemFilter(item)
        setDefault(item.name)
    }
    const onClickOk = () => {
        props.onClick(itemFilter)
    }
    const onClickCancel = () =>{
        props.onButtonCancel()
    }

    return (
        <View>
            { Constant.TIME_SELECT_ALL_TIME.map((item, index) => {
                return (
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }} onPress={() => onClickRadioButton(item)}>
                        <RadioButton.Android
                            style={{ padding: 0, margin: 0 }}
                            color='#FF4500'
                            onPress={() => onClickRadioButton(item)}
                            status={defaut == item.name ? 'checked' : 'unchecked'}
                        />
                        <Text style={{ marginLeft: 0 }}>{I18n.t(item.name)}</Text>
                    </TouchableOpacity>
                )
            })
            }
            <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                <TouchableOpacity style={styles.styleButtonHuy} onPress={()=>onClickCancel()} >
                    <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.styleButtonOK} onPress={() => onClickOk()}>
                    <Text style={styles.styleTextBtnOk}>{I18n.t("dong_y")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleButtonOK: {
        flex: 1, backgroundColor: "#FF4500", borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end", marginLeft: 10, marginRight: 20, marginBottom: 10
    },
    styleButtonHuy: {
        flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#FF4500", borderRadius: 5, justifyContent: 'flex-start', paddingVertical: 10, paddingHorizontal: 20, marginLeft: 20, marginRight: 10, marginBottom: 10
    },
    styleTextBtnHuy: { textAlign: "center", color: "#FF4500", fontSize: 16 },
    styleTextBtnOk: { textAlign: "center", color: "#fff", fontSize: 16 },
    styleItemSwitch: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10
    },
})
