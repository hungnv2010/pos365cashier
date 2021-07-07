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
import { getFileDuLieuString, setFileLuuDuLieu } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import printService from '../../data/html/PrintService';
const { Print } = NativeModules;
import HtmlDefault from '../../data/html/htmlDefault';
import HtmlKitchen from '../../data/html/htmlKitchen';
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import AutoHeightWebView from 'react-native-autoheight-webview/autoHeightWebView'
import ViewPrint, { defaultKitchen } from './ViewPrint';
import I18n from '../../common/language/i18n'
import colors from '../../theme/Colors';
import { PaymentDataDefault } from '../tempPrint/ServicePrintTemp';
import dataManager from '../../data/DataManager';

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
            if ((deviceType != Constant.PHONE && props.type == 10) || (deviceType == Constant.PHONE && props.route.params.type == 10)) {
                let html = HtmlDefault;
                if (deviceType == Constant.PHONE) {
                    html = props.route.params.data;
                } else {
                    if (props.data != "")
                        html = props.data
                }
                printService.GenHtml(html, JsonContent1).then(res => {
                    if (res && res != "") {
                        setData(res)
                    }
                })
            } else {
                let html = HtmlKitchen;
                if (deviceType == Constant.PHONE) {
                    html = props.route.params.data;
                } else {
                    if (props.data != "")
                        html = props.data
                }
                let res = printService.GenHtmlKitchen(html, PaymentDataDefault.OrderDetails, 1, JSON.parse(data))
                console.log("GenHtmlKitchen res", res);
                if (res && res != "") {
                    setData(res)
                }
            }
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
        let params = {
            printTemplate: {
                Content: deviceType != Constant.PHONE ? props.data : props.route.params.data,
                Id: 0,
                RetailerId: vendorSession.CurrentRetailer.Id,
                Type: deviceType != Constant.PHONE ? props.type : props.route.params.type,
            }
        };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.PRINT_TEMPLATES).POST(params).then((res) => {
            console.log("clickCheck res ", res);
            if (res) {
                if ((deviceType != Constant.PHONE && props.type == 10) || (deviceType == Constant.PHONE && props.route.params.type == 10)) {
                    setFileLuuDuLieu(Constant.HTML_PRINT, "" + params.printTemplate.Content);
                } else {
                    setFileLuuDuLieu(Constant.PRINT_KITCHEN, "" + params.printTemplate.Content);
                }
            }
            dialogManager.hiddenLoading()
            props.navigation.pop();
            props.navigation.pop();
        }).catch((e) => {
            console.log("clickCheck err ", e);
            dialogManager.hiddenLoading()
        })
    }

    function clickPrint() {
        console.log("clickPrint data ", data)
        if (isClick.current == false) {
            if ((deviceType != Constant.PHONE && props.type == 10) || (deviceType == Constant.PHONE && props.route.params.type == 10)) {
                let html = data.replace("width: 76mm", "")
                viewPrintRef.current.printProvisionalRef(JsonContent1, false, "", true)
            } else {
                PaymentDataDefault.OrderDetails.forEach(element => {
                    element.RoomName = I18n.t('phong_ban_');
                    element.Pos = "A";
                });
                let data = dataManager.getDataPrintCook(PaymentDataDefault.OrderDetails)
                console.log("printKitchen data ====: " + JSON.stringify(data));
                // dispatch({ type: 'LIST_PRINT', listPrint: JSON.stringify(data) })
                viewPrintRef.current.printKitchenRef(JSON.stringify(data))
            }
        }
    }

    onCapture = uri => {
        console.log("onCapture uri ", uri);
        setUri(uri);
    }

    const viewPrintRef = useRef();

    return (
        <View style={{ backgroundColor: "#fff", alignItems: "center", flex: 1 }}>
            <ViewPrint
                ref={viewPrintRef}
                html={data}
            />
            {deviceType == Constant.PHONE ? <ToolBarPreviewHtml
                navigation={props.navigation} title="HTML"
                clickPrint={() => clickPrint()}
                clickCheck={() => clickCheck()}
            /> : null
                // <View style={{ width: "100%", padding: 10, justifyContent: "space-between", flexDirection: "row" }}>
                //     <TouchableOpacity style={styles.button} onPress={() => { clickPrint() }}>
                //         <Text style={styles.textButton}>{I18n.t('in')}</Text>
                //     </TouchableOpacity>
                //     <TouchableOpacity style={styles.button} onPress={() => { clickCheck() }}>
                //         <Text style={styles.textButton}>{I18n.t('luu')}</Text>
                //     </TouchableOpacity>
                // </View>
            }
            <View style={{ width: "100%", padding: 5, justifyContent: "space-between", flexDirection: "row" }}>
                <TouchableOpacity style={styles.button} onPress={() => { clickPrint() }}>
                    <Text style={styles.textButton}>{I18n.t('in')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { clickCheck() }}>
                    <Text style={styles.textButton}>{I18n.t('luu')}</Text>
                </TouchableOpacity>
            </View>
            <AutoHeightWebView
                // scrollEnabled={false}
                style={{}}
                customScript={`document.body.style.width = '76mm';document.body.rules = 'center'`}
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

const styles = StyleSheet.create({
    button: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
})
