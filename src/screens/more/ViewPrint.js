import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, PixelRatio, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
import dialogManager from '../../components/dialog/DialogManager';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import printService from '../../data/html/PrintService';
const { Print } = NativeModules;
import HtmlDefault from '../../data/html/htmlDefault';
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import AutoHeightWebView from 'react-native-autoheight-webview'
import I18n from '../../common/language/i18n'


export default forwardRef((props, ref) => {

    const [uriImg, setUriImg] = useState("")

    const [dataHtml, setDataHtml] = useState(props.html)

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });

    const orientation = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.orientaition
    });

    useEffect(() => {
        console.log("ViewPrint props ", props);
    }, [])

    useImperativeHandle(ref, () => ({
        clickCaptureRef() {
            console.log('clickCaptureRef');
            clickCapture()
        },
        checkBeforePrintRef(jsonContent) {
            checkBeforePrint(jsonContent)
        }
    }));

    const clickCapture = () => {
        console.log('clickCapture');
        captureRef(childRef, {
            // format: "png",
            // quality: 1.0
            width: 900,
            // snapshotContentContainer: true,
        }).then(
            uri => {
                console.log('Snapshot uri', uri);
                // setUriImg(uri);

                // props.callback(uri);

                Print.printImageFromClient([uri + ""])
            },
            error => console.error('Oops, snapshot failed', error)
        );
    }

    const checkOrderBeforePrint = (jsonContent) => {
        if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
            printService.GenHtml(HtmlDefault, jsonContent).then(res => {
                if (res && res != "") {
                    setDataHtml(res)
                }
                setTimeout(() => {
                    clickCapture()
                }, 500);
            })
        }
        else
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
    }

    const checkBeforePrint = async (jsonContent, isProvisional = false) => {
        let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
        console.log('checkBeforePrint getCurrentIP ', getCurrentIP);
        if (getCurrentIP && getCurrentIP != "") {
            provisional = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('checkBeforePrint provisional ', provisional);
            if (!isProvisional) {
                checkOrderBeforePrint(jsonContent)
            } else {
                if (provisional && provisional == Constant.PROVISIONAL_PRINT) {
                    console.log("checkBeforePrint RoomName ", jsonContent.RoomName);
                    checkOrderBeforePrint(jsonContent)
                } else {
                    dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
                }
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
        }
    }

    const childRef = useRef();
    return (
        <View style={{ position: "absolute" }}>
            <View style={{ opacity: 0 }}>
                <ScrollView>
                    <View
                        ref={childRef}
                        style={{
                            flex: 1, alignItems: "center"
                        }}>
                        <AutoHeightWebView
                            scrollEnabled={false}
                            style={{ width: deviceType == Constant.PHONE ? (orientation == Constant.PORTRAIT ? Dimensions.get('window').width / 1.5 : Dimensions.get('window').width / 2.5) : (orientation == Constant.PORTRAIT ? Dimensions.get('window').width / 3 : Dimensions.get('window').height / 3) }}
                            // customScript={`document.body.style.background = 'red';`}
                            files={[{
                                href: 'cssfileaddress',
                                type: 'text/css',
                                rel: 'stylesheet'
                            }]}
                            source={{ html: dataHtml }}
                            scalesPageToFit={true}
                        />
                    </View>
                </ScrollView>
            </View>
            {/* <TouchableOpacity style={{backgroundColor:"red", padding: 20, flex: 1}} onPress={() => data.callback("ClickHung")}><Text>Click</Text></TouchableOpacity> */}
            {/* <Image source={{ uri: uriImg }} resizeMode="contain" style={{ position: "absolute", top: 50, width: 100, height: 100, flex: 1 }} /> */}
        </View>
    )

});

const styles = StyleSheet.create({

})
