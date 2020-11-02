import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import { WebView } from 'react-native-webview';
import useDidMountEffect from '../../../customHook/useDidMountEffect';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import ToolBarPreviewHtml from '../../../components/toolbar/ToolBarPreviewHtml';
import JsonContent1 from '../../../data/json/data_print_demo'
import { dateToDate, DATE_FORMAT, currencyToString } from '../../../common/Utils';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import { Constant } from '../../../common/Constant';
import { useSelector } from 'react-redux';
import { Snackbar } from 'react-native-paper';
import printService from '../../../data/html/PrintService';
const { Print } = NativeModules;
import AutoHeightWebView from 'react-native-autoheight-webview/autoHeightWebView'

export default forwardRef((props, ref) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const [data, setData] = useState("");
    const [vendorSession, setVendorSession] = useState({});

    let isClick = useRef();

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });

    useEffect(() => {

    }, [])

    useEffect(() => {
        console.log("Preview props", props);
        const getVendorSession = async () => {
            isClick.current = false;
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data))
            let html = ""
            if (deviceType == Constant.PHONE) {
                html = props.route.params.data;
            } else {
                if (props.data != "")
                    html = props.data
            }
            printService.GenHtml(html, JsonContent1).then(res => {
                if (res && res != "")
                    setData(res)
            })
        }
        getVendorSession()
    }, [props.data])

    function clickCheck() {
        console.log("clickCheck vendorSession ", vendorSession)
        let params = {
            printTemplate: {
                Content: deviceType != Constant.PHONE ? props.data : props.route.params.data,
                Id: 0,
                RetailerId: vendorSession.CurrentRetailer.Id,
                Type: 10,
            }
        };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.PRINT_TEMPLATES).POST(params).then((res) => {
            console.log("clickCheck res ", res);
            dialogManager.hiddenLoading()
            props.navigation.pop();
        }).catch((e) => {
            console.log("clickCheck err ", e);
            dialogManager.hiddenLoading()
        })
    }

    async function clickPrint() {
        console.log("clickPrint data ", data)
        let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
        console.log('getCurrentIP ', getCurrentIP);
        if (getCurrentIP && getCurrentIP != "") {
            if (isClick.current == false) {
                let html = data.replace("width: 76mm", "")
                Print.printImage(html)
            }
            isClick.current = true;
            setTimeout(() => {
                isClick.current = false;
            }, 2000);
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
        }
    }

    useImperativeHandle(ref, () => ({
        clickCheckInRef() {
            clickCheck()
        },
        clickPrintInRef() {
            clickPrint()
        }
    }));

    return (
        <View style={{ flex: 1 }}>
            {deviceType == Constant.PHONE ? <ToolBarPreviewHtml
                navigation={props.navigation} title="HTML"
                clickPrint={() => clickPrint()}
                clickCheck={() => clickCheck()}
            /> : null}
            <AutoHeightWebView
                source={{ html: data }}
                style={{ marginTop: 0, width: Metrics.screenWidth }}
            />
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View>
    );
});
