import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { WebView } from 'react-native-webview';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import ToolBarPreviewHtml from '../../components/toolbar/ToolBarPreviewHtml';
import JsonContent1 from '../../data/json/data_print_demo'
import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { Snackbar } from 'react-native-paper';
import printService from '../../data/html/PrintService';
const { Print } = NativeModules;
import HtmlDefault from '../../data/html/htmlDefault';
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import HTML from 'react-native-render-html';
import AutoHeightWebView from 'react-native-autoheight-webview/autoHeightWebView'
import ViewPrint from './ViewPrint';
import I18n from '../../common/language/i18n'

const FOOTER_HEIGHT = 21;
const PADDING = 16;
const BOTTOM_MARGIN_FOR_WATERMARK = FOOTER_HEIGHT * PADDING;



export default forwardRef((props, ref) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const [data, setData] = useState("");
    const [vendorSession, setVendorSession] = useState({});
    const [uri, setUri] = useState("");
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
            let html = HtmlDefault;
            if (deviceType == Constant.PHONE) {
                html = props.route.params.data;
            } else {
                if (props.data != "")
                    html = props.data

            }
            printService.GenHtml(html, JsonContent1).then(res => {
                if (res && res != "") {
                    // if (deviceType == Constant.TABLET)
                    //     res = res.replace("font-size:16.0px;", "font-size:22.0px;")
                    setData(res)
                }
            })
        }
        getVendorSession()
    }, [props.data])

    useImperativeHandle(ref, () => ({
        clickCheckInRef() {
            clickCheck()
        },
        clickPrintInRef() {
            clickPrint()
        }
    }));

    function clickCheck() {
        console.log("clickCheck vendorSession ", vendorSession)
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
                viewPrintRef.current.clickCaptureRef();
            }
            isClick.current = true;
            setTimeout(() => {
                isClick.current = false;
            }, 2000);
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
        }
    }

    onCapture = uri => {
        console.log("do something with ", uri);
        setUri(uri);
    }

    const viewPrintRef = useRef();

    return (
        <View style={{ backgroundColor: "#fff", alignItems: "center", flex: 1 }}>
            <ViewPrint
                ref={viewPrintRef}
                html={data}
                callback={(uri) => {
                    console.log("callback uri ", uri)
                    // setUri(uri);
                    Print.printImageFromClient([uri + ""])
                }
                }
            />
            {deviceType == Constant.PHONE ? <ToolBarPreviewHtml
                navigation={props.navigation} title="HTML"
                clickPrint={() => clickPrint()}
                clickCheck={() => clickCheck()}
            /> : null}
            <AutoHeightWebView
                // scrollEnabled={false}
                style={{ width: deviceType == Constant.PHONE ? Metrics.screenWidth - 20 : Metrics.screenWidth / 2.5 }}
                files={[{
                    href: 'cssfileaddress',
                    type: 'text/css',
                    rel: 'stylesheet'
                }]}
                source={{ html: data }}
            // scalesPageToFit={true}
            />
        </View>
    );
});
