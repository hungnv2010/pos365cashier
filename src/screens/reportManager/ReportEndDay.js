import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, NativeEventEmitter, Modal } from 'react-native';
import I18n from '../../common/language/i18n';
import { WebView } from 'react-native-webview';
import store from '../../store/configureStore';
import { useFocusEffect } from '@react-navigation/native';
import DateTime from '../../components/filter/DateTime';
import { Images, Metrics, Colors } from '../../theme';
import { Constant } from '../../common/Constant';
import { Switch } from 'react-native-paper';
import { HTTPService, convertJsonToPrameter } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { dateToStringFormatUTC } from '../../common/Utils';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import dialogManager from '../../components/dialog/DialogManager';
import colors from '../../theme/Colors';
import { useDispatch } from 'react-redux';


export default (props) => {


    const mainUri = new HTTPService().setPath(ApiPath.ENDOFDAY)._path

    const [uri, setUri] = useState("")
    const [filter, setFilter] = useState({
        time: Constant.TIME_SELECT_ALL_TIME[0],
        allProduct: false
    })
    const [showModal, setShowModal] = useState(false)
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("with ==== ", Metrics.screenWidth);

        dialogManager.showLoading()
        setUri(mainUri)
    }, [])


    useDidMountEffect(() => {
        console.log('filter', filter);
        let params = {}
        params.TimeRange = filter.time.key
        params.AllProduct = filter.allProduct
        if (filter.time.key == "custom") {
            let { startDate, endDate } = filter.time
            let startDateFilter = dateToStringFormatUTC(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = dateToStringFormatUTC((endDate ? endDate : startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            params.StartDate = startDateFilter
            params.EndDate = endDateFilter
        }
        params = convertJsonToPrameter(params);
        setUri(mainUri + params)
    }, [filter])

    // useEffect(() => {
    //     console.log('uriuriuri', uri);
    // }, [uri])

    const outputDateTime = (item) => {
        console.log('outputDateTime', item);
        if (item == null) {
            setShowModal(false)
        }
        else if (item.key == 'custom' && !item.startDate) {
            setShowModal(false)
        } else {
            setFilter({
                ...filter,
                time: item
            })
            // filterRef.current = { ...filterRef.current, time: item }
            // onRefresh()
            setShowModal(false)
        }
    }



    const onValueChange = () => {
        console.log('onValueChange');
        setFilter({ ...filter, allProduct: !filter.allProduct })
    }

    const printReport = () => {
        dispatch({ type: 'PRINT_REPORT', printReport: uri != "" ? uri : "" })
    }

    const onSetting = () => {

    }

    const renderFilter = () => {
        return (
            <DateTime
                timeForReport={true}
                outputDateTime={outputDateTime} />
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('bao_cao')}
            />

            <View style={{ flexDirection: "row", alignItems: "center", borderBottomColor: "grey", borderBottomWidth: 1, justifyContent: "space-between" }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => { setShowModal(!showModal) }}>
                    <Image source={Images.icon_calendar} style={{ width: 48, height: 48 }} />
                    <Text style={{ marginHorizontal: 10 }}>{filter.time.name.includes('-') ? filter.time.name : I18n.t(filter.time.name)}</Text>
                    <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 20 }}>
                    <Text style={{ marginHorizontal: 10 }}>{I18n.t("tat_ca_san_pham")}</Text>
                    <Switch
                        value={filter.allProduct}
                        onValueChange={onValueChange}
                        color={Colors.colorchinh}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ width: "100%", padding: 5, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                {/* <TouchableOpacity style={styles.button} onPress={() => { onSetting() }}>
                    <Text style={styles.textButton}>{I18n.t('thiet_lap')}</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={[styles.button, { width: Metrics.screenWidth / 2 }]} onPress={() => { printReport() }}>
                    <Text style={styles.textButton}>{I18n.t('in_bao_cao')}</Text>
                </TouchableOpacity>
            </View>

            <WebView
                source={{ uri: uri, headers: { 'COOKIE': "ss-id=" + store.getState().Common.info.SessionId } }}
                onError={syntheticEvent => {
                    dialogManager.hiddenLoading()
                }}
                onLoadEnd={syntheticEvent => {
                    dialogManager.hiddenLoading()
                }}
            />
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
                    <View style={{ width: Metrics.screenWidth * 0.8 }}>
                        {renderFilter()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    button: { /*flex: 1,*/ padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 20, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
})

