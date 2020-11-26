import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, PixelRatio, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
import dialogManager from '../../components/dialog/DialogManager';
import JsonContent1 from '../../data/json/data_print_demo'
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import printService from '../../data/html/PrintService';
const { Print } = NativeModules;
import HtmlDefault from '../../data/html/htmlDefault';
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import AutoHeightWebView from 'react-native-autoheight-webview'
import I18n from '../../common/language/i18n'
import htmlKitchen from '../../data/html/htmlKitchen';

export const defaultKitchenOne = { "B.20": [{ "RowKey": "837da80565ee44d4bcd36e07061e3c9d", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585766, "Name": "Súp kem kiểu Paris", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "SecondPrinter": "BartenderA", "Printer3": "KitchenB", "Printer4": "KitchenC", "Printer5": "KitchenD", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "9cc7552ce03d41508bded9d15f9140f7", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585767, "Name": "Lemon Tea", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "7a5b33f88246409b94cd60c3b6672c15", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }] }
export const defaultKitchen = { "B.20": [{ "RowKey": "837da80565ee44d4bcd36e07061e3c9d", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585766, "Name": "Súp kem kiểu Paris", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "SecondPrinter": "BartenderA", "Printer3": "KitchenB", "Printer4": "KitchenC", "Printer5": "KitchenD", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "9cc7552ce03d41508bded9d15f9140f7", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585767, "Name": "Lemon Tea", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "7a5b33f88246409b94cd60c3b6672c15", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }],
                                 "B.21": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80744_58128", "RoomId": 859715, "RoomName": "B.21", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 2", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] ,
                                 "B.22": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80745_58128", "RoomId": 859716, "RoomName": "B.22", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 3", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] ,
                                 "B.23": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80746_58128", "RoomId": 859717, "RoomName": "B.23", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 4", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] 
                                }
export const defaultMultiKitchen = { "MayA": { "B.20": [{ "RowKey": "837da80565ee44d4bcd36e07061e3c9d", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585766, "Name": "Súp kem kiểu Paris", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "SecondPrinter": "BartenderA", "Printer3": "KitchenB", "Printer4": "KitchenC", "Printer5": "KitchenD", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "9cc7552ce03d41508bded9d15f9140f7", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585767, "Name": "Lemon Tea", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "7a5b33f88246409b94cd60c3b6672c15", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }], "B.21": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80743_58128", "RoomId": 859712, "RoomName": "B.21", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] }, "MayB": { "B.22": [{ "RowKey": "32759d1d0c0b43998ac09260d8f61201", "PartitionKey": "80743_58128", "RoomId": 859712, "RoomName": "B.22", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 123", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenB", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] } }
export const TYPE_PRINT = {
    KITCHEN: "KITCHEN",
    PROVISIONAL: "PROVISIONAL",
    TEM: "TEM"
}

export default forwardRef((props, ref) => {

    const [uriImg, setUriImg] = useState("")
    const [dataHtml, setDataHtml] = useState(props.html);

    useEffect(() => {
        setDataHtml(props.html)
    }, [props.html])

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
        printProvisionalRef(jsonContent) {
            printProvisional(jsonContent)
        },
        printKitchenRef(jsonContent) {
            printKitchen(jsonContent)
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
                // props.callback(uri)
                Print.printImageFromClient([uri + ""])
                // setTimeout(() => {
                    alert("print ")
                    setDataHtmlPrint()
                // },1000);
                
            },
            error => console.error('Oops, snapshot failed', error)
        );
    }

    const setDataHtmlPrint = () => {
        if (printService.listWaiting.length > 0) {
            console.log("tttt setDataHtmlPrint", printService.listWaiting);
            let currentHtml = printService.listWaiting.pop()
            console.log("tttt setDataHtmlPrint aaa", currentHtml);
            setDataHtml(currentHtml)
        }
        // clickCapture()
    }

    const printProvisional1 = async (jsonContent) => {
        let status = await checkIP()
        console.log("status ", status);
        if (status != "") {
            provisional = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('printProvisional provisional ', provisional);
            if (!(provisional && provisional == Constant.PROVISIONAL_PRINT)) {
                dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
                return;
            }
            if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
                let res = await printService.GenHtml(HtmlDefault, jsonContent)
                if (res && res != "") {
                    // setDataHtmlPrint(res)
                }
            }
            else
                dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const printProvisional = (jsonContent) => {
        // let status = await checkIP()
        console.log("status ", status);
        let status = "Done"
        if (status != "") {
            // provisional = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            // console.log('printKitchen provisional ', provisional);
            // if (!(provisional && provisional == Constant.PROVISIONAL_PRINT)) {
            //     dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
            //     return;
            // }

            for (const key in defaultKitchen) {
                if (defaultKitchen.hasOwnProperty(key) ) {
                    const element = defaultKitchen[key];
                    let res = printService.GenHtmlKitchen(htmlKitchen, element)
                    if (res && res != "") {
                        printService.listWaiting.push(res)
                    }
                }
            }
            setDataHtmlPrint()
        }
    }

    const checkIP = async () => {
        return new Promise(async (resolve, reject) => {
            let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
            console.log('checkIP ', getCurrentIP);
            if (getCurrentIP && getCurrentIP != "") {
                resolve("Done")
            } else {
                dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
                resolve("")
            }
        });
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
                            onLoadEnd={e => {
                                clickCapture()
                            }}
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
