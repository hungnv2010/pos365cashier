import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Platform, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
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
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import AutoHeightWebView from 'react-native-autoheight-webview/autoHeightWebView'
import I18n from '../../common/language/i18n'
import colors from '../../theme/Colors';
import { handerDataPrintTemp, handerDataPrintTempProduct } from './ServicePrintTemp';
import htmlDefault from "../../data/html/htmlDefault"

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
            if (Platform.isPad) {
                setData(props.data)
            } else {
                setData(props.route.params.data)
            }
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data))
        }
        getVendorSession()
    }, [])

    useEffect(() => {
        console.log("Preview props", props);
        if (Platform.isPad) {
            setData(props.data)
        } else {
            setData(props.route.params.data)
        }
    }, [props.data])

    useImperativeHandle(ref, () => ({

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
                setFileLuuDuLieu(Constant.TEMP_DEFAULT, "" + params.printTemplate.Content);
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
        let settingObject = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        if (settingObject && settingObject != "") {
            settingObject = JSON.parse(settingObject)
            console.log("clickPrint settingObject ", settingObject);
            settingObject.Printer.forEach(async element => {
                if (element.key == Constant.KEY_PRINTER.StampPrintKey && element.ip != "") {
                    let value = await handerDataPrintTemp();
                    console.log("handerDataPrintTemp value  ", value);
                    console.log("handerDataPrintTemp element  ", element);
                    Print.PrintTemp(value, element.ip, element.size)
                }
            });
        }
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
                <Text>{data ? data.replace(/\n/g, " ") : ""}</Text>
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
