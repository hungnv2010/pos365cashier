import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Image } from 'react-native';
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import DateRangePicker from "react-native-daterange-picker";
import moment from "moment";


export default (props) => {


    const [showModal, setShowModal] = useState(false)
    const [selectTime, setSelectTime] = useState(Constant.TIME_SELECT_ALL_TIME[0])
    const [isSelectCustom, setIsSelectCustom] = useState(false)
    const [dateTimePicker, setDateTimePicker] = useState({
        startDate: null,
        endDate: null,
        displayedDate: moment(),
    })

    useEffect(() => {
        if (selectTime.key == 'custom') return
        props.outputDateTime(selectTime)
    }, [selectTime])


    const onClickSelectTime = (item) => {
        console.log('onClickSelectTime', item);
        if (item.key == "custom") {
            setIsSelectCustom(true)
        } else {
            setShowModal(false)
        }
        setSelectTime({ ...item })
    }


    const onDoneSelectDate = () => {
        props.outputDateTime(dateTimePicker)
        setShowModal(false);
        setIsSelectCustom(false)
    }

    const setDates = (dates) => {
        console.log('setDates', dates);
        setDateTimePicker({ ...dateTimePicker, ...dates })
    }

    return (
        <View style={{}}>
            <TouchableOpacity
                onPress={() => {
                    setShowModal(true);
                }}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#E6EAEF", borderRadius: 10, padding: 10 }}>
                <Text style={{ marginRight: 10, fontSize: 17, }}>{I18n.t(selectTime.name)}</Text>
                <Image style={{ width: 10, height: 10 }} source={Images.icon_path_4203} />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                            setIsSelectCustom(false)
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={{
                            backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}></View>

                    </TouchableWithoutFeedback>
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
                                        !props.timeCustom ?
                                            Constant.TIME_SELECT.map((item, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => onClickSelectTime(item)}
                                                        key={index} style={{ paddingVertical: 15, }}>
                                                        <Text style={{ fontSize: 17, textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                            :
                                            Constant.TIME_SELECT_CUSTOM_TIME.map((item, index) => {
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
                                        <TouchableOpacity onPress={() => {
                                            setShowModal(false);
                                            setIsSelectCustom(false)
                                        }} style={{ marginHorizontal: 20, paddingHorizontal: 30, borderColor: colors.colorchinh, borderWidth: 1, paddingVertical: 10, borderRadius: 5 }}>
                                            <Text style={{ color: colors.colorchinh, textTransform: "uppercase" }}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={onDoneSelectDate} style={{ marginHorizontal: 20, paddingHorizontal: 30, paddingVertical: 10, backgroundColor: colors.colorchinh, borderRadius: 5, borderWidth: 0 }}>
                                            <Text style={{ color: "#fff", textTransform: "uppercase" }}>{I18n.t("xong")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                        }
                    </View>
                </View>
            </Modal>
        </View>
    );
};
