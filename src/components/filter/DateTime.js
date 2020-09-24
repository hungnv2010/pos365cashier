import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Image } from 'react-native';
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import DateRangePicker from "react-native-daterange-picker";
import moment from "moment";
import { dateToString } from '../../common/Utils';


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
            padding: 20,
            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
            width: !isSelectCustom ? Metrics.screenWidth * 0.5 : null,
            justifyContent: 'center', alignItems: 'center',
        }}>
            {
                !isSelectCustom ?
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 10 }}>{I18n.t('chon_khoang_thoi_gian')}</Text>
                        {
                            props.timeCustom ?
                                Constant.TIME_SELECT_CUSTOM_TIME.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => onClickSelectTime(item)}
                                            key={index} style={{ paddingVertical: 15, }}>
                                            <Text style={{ fontSize: 17, textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                                :
                                props.timeAll ?

                                    Constant.TIME_SELECT_ALL_TIME.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                onPress={() => onClickSelectTime(item)}
                                                key={index} style={{ paddingVertical: 15, }}>
                                                <Text style={{ fontSize: 17, textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                    :
                                    Constant.TIME_SELECT.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                onPress={() => onClickSelectTime(item)}
                                                key={index} style={{ paddingVertical: 15, }}>
                                                <Text style={{ fontSize: 17, textAlign: "center" }}>{I18n.t(item.name)}</Text>
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
                        >
                        </DateRangePicker>
                        <View style={{ flexDirection: "row", margin: 10 }}>
                            <TouchableOpacity onPress={onCancel} style={{ marginHorizontal: 20, paddingHorizontal: 30, borderColor: colors.colorchinh, borderWidth: 1, paddingVertical: 10, borderRadius: 5 }}>
                                <Text style={{ color: colors.colorchinh, textTransform: "uppercase" }}>{I18n.t("huy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onDone} style={{ marginHorizontal: 20, paddingHorizontal: 30, paddingVertical: 10, backgroundColor: colors.colorchinh, borderRadius: 5, borderWidth: 0 }}>
                                <Text style={{ color: "#fff", textTransform: "uppercase" }}>{I18n.t("xong")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            }
        </View>
    );
};
