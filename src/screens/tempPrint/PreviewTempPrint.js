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
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import AutoHeightWebView from 'react-native-autoheight-webview/autoHeightWebView'
import I18n from '../../common/language/i18n'
import colors from '../../theme/Colors';
import { handerDataPrintTemp, handerDataPrintTempProduct } from './ServicePrintTemp';

const FOOTER_HEIGHT = 21;
const PADDING = 16;
const BOTTOM_MARGIN_FOR_WATERMARK = FOOTER_HEIGHT * PADDING;



export default forwardRef((props, ref) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const [data, setData] = useState("");
    const [vendorSession, setVendorSession] = useState({});

    const { deviceType, isFNB } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        console.log("Preview props", props);
        const getVendorSession = async () => {
            setData(props.route.params.data)
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data))
        }
        getVendorSession()
    }, [])

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
                Type: 12,
                BranchId: vendorSession.CurrentBranchId,
            }
        };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.PRINT_TEMPLATES).POST(params).then((res) => {
            console.log("clickCheck res ", res);
            if (res) {
                setFileLuuDuLieu(Constant.HTML_PRINT, "" + params.printTemplate.Content);
            }
            dialogManager.hiddenLoading()
            props.navigation.pop();
            if (deviceType == Constant.PHONE)
                props.navigation.pop();
        }).catch((e) => {
            console.log("clickCheck err ", e);
            dialogManager.hiddenLoading()
        })
    }

    async function clickPrint() {
        console.log("clickPrint data ", data)
        let value = isFNB ? await handerDataPrintTemp() : await handerDataPrintTempProduct()
        Print.PrintTemp(value, "192.168.100.238", "50x30")
    }

    return (
        <View style={{ backgroundColor: "#fff", alignItems: "center", flex: 1 }}>

            {deviceType == Constant.PHONE ? <ToolBarPreviewHtml
                navigation={props.navigation} title="Temp"
                clickPrint={() => clickPrint()}
                clickCheck={() => clickCheck()}
            /> : null
            }
            <View style={{ width: "100%", padding: 5, justifyContent: "space-between", flexDirection: "row" }}>
                <TouchableOpacity style={styles.button} onPress={() => { clickPrint() }}>
                    <Text style={styles.textButton}>{I18n.t('in')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { clickCheck() }}>
                    <Text style={styles.textButton}>{I18n.t('luu')}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 10 }}>
                <Text>{data.replace(/\n/g, " ")}</Text>
            </View>
            {/* <AutoHeightWebView
                // scrollEnabled={false}
                style={{}}
                files={[{
                    href: 'cssfileaddress',
                    type: 'text/css',
                    rel: 'stylesheet'
                }]}
                source={{ html: data }}
            // scalesPageToFit={true}
            /> */}
        </View>
    );
});

const styles = StyleSheet.create({
    button: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
})
