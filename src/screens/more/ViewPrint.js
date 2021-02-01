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
export const defaultKitchen = {
    "B.20": [{ "RowKey": "837da80565ee44d4bcd36e07061e3c9d", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585766, "Name": "Súp kem kiểu Paris", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "SecondPrinter": "BartenderA", "Printer3": "KitchenB", "Printer4": "KitchenC", "Printer5": "KitchenD", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "9cc7552ce03d41508bded9d15f9140f7", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585767, "Name": "Lemon Tea", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "7a5b33f88246409b94cd60c3b6672c15", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }],
    "B.21": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80744_58128", "RoomId": 859715, "RoomName": "B.21", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 2", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }],
    "B.22": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80745_58128", "RoomId": 859716, "RoomName": "B.22", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 3", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }],
    "B.23": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80746_58128", "RoomId": 859717, "RoomName": "B.23", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 4", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }]
}
export const defaultMultiKitchen = { "KitchenA": { "B.20": [{ "RowKey": "837da80565ee44d4bcd36e07061e3c9d", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585766, "Name": "Súp kem kiểu Paris", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "SecondPrinter": "BartenderA", "Printer3": "KitchenB", "Printer4": "KitchenC", "Printer5": "KitchenD", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "9cc7552ce03d41508bded9d15f9140f7", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585767, "Name": "Lemon Tea", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }, { "RowKey": "7a5b33f88246409b94cd60c3b6672c15", "PartitionKey": "80743_58128", "RoomId": 859713, "RoomName": "B.20", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:00.2700000Z", "Approved": true, "IsLargeUnit": false, "Unit": "Cái", "LargeUnit": "Thùng" }], "B.21": [{ "RowKey": "32759d1d0c0b43998ac092600d8f6120", "PartitionKey": "80743_58128", "RoomId": 859712, "RoomName": "B.21", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenA", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] }, "KitchenB": { "B.22": [{ "RowKey": "32759d1d0c0b43998ac09260d8f61201", "PartitionKey": "80743_58128", "RoomId": 859712, "RoomName": "B.22", "Position": "A", "ProductId": 10585765, "Name": "Súp kém bí đỏ với sữa dừa 123", "Quantity": 1, "Serveby": 161528, "ServebyName": "admin", "Printer": "KitchenB", "CreatedDate": "2020-11-02T10:16:03.2430000Z", "Approved": true, "IsLargeUnit": true, "Unit": "Cái", "LargeUnit": "Thùng" }] } }
export const TYPE_PRINT = {
    KITCHEN: "KITCHEN",
    RETURN_PRODUCT: "RETURN_PRODUCT"
}

export const KITCHEN_PRINT = {
    MayA: "192.168.99.241",
    MayB: "192.168.99.233",
    MayC: "192.168.99.241",
}

export default forwardRef((props, ref) => {

    const [uriImg, setUriImg] = useState("")
    const [dataHtml, setDataHtml] = useState("");
    const currentHtml = useRef({})
    const isProvisional = useRef(true)

    useEffect(() => {
        setDataHtml(props.html)
    }, [props.html])

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    const orientation = useSelector(state => {
        return state.Common.orientaition
    });

    const printObject = useSelector(state => {
        return state.Common.printerObject;
    });

    useEffect(() => {
        console.log("ViewPrint props ", props);
    }, [])

    useImperativeHandle(ref, () => ({
        clickCaptureRef() {
            console.log('clickCaptureRef');
            clickCapture()
        },
        printProvisionalRef(jsonContent, checkProvisional = false) {
            printProvisional(jsonContent, checkProvisional)
        },
        printKitchenRef(jsonContent, type = TYPE_PRINT.KITCHEN) {
            console.log('printKitchenRef jsonContent: ', jsonContent);
            printKitchen(jsonContent, type)
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
                console.log('Snapshot uri', uri, currentHtml.current.html);
                // setUriImg(uri)
                Print.printImageFromClient(uri, currentHtml.current.ip, currentHtml.current.size, (b) => {
                    console.log("printImageFromClient b ", b);
                })
                // currentHtml.current = {};
                // setDataHtml("");
                // setTimeout(() => {
                setDataHtmlPrint()
                // }, 500);
            },
            error => console.error('Oops, snapshot failed', error)
        );
    }

    const setDataHtmlPrint = () => {
        if (printService.listWaiting.length > 0) {
            currentHtml.current = printService.listWaiting.pop()
            setDataHtml(currentHtml.current.html)
        }
        else {
            currentHtml.current = {}
        }
    }

    const printProvisional = async (jsonContent, checkProvisional = false) => {
        let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        if (setting && setting != "") {
            setting = JSON.parse(setting);
            console.log("savePrinter setting ", setting);
            if (checkProvisional) {
                if (setting.in_tam_tinh == false) {
                    dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
                    return;
                }
            }
        }
        let ipObject = await checkIP()
        console.log("printProvisional jsonContent numberLoop ", jsonContent);
        if (ipObject.ip != "") {
            if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
                let res = await printService.GenHtml(HtmlDefault, jsonContent)
                if (res && res != "") {
                    isProvisional.current = true;
                    let newRes = res.replace("</body>", "<p style='display: none;'>" + (new Date().getTime().toString()) + "</p> </body>");
                    printService.listWaiting.push({ html: newRes, ip: ipObject.ip, size: ipObject.size })
                    if (setting.in_hai_lien_cho_hoa_don == true) {
                        newRes = res.replace("</body>", "<p style='display: none;'>" + (new Date().getTime().toString()) + Math.floor((Math.random() * 1000000000) + 1) + "</p> </body>");
                        printService.listWaiting.push({ html: newRes, ip: ipObject.ip, size: ipObject.size })
                    }
                }
                console.log("listWaiting ==== " + JSON.stringify(printService.listWaiting))
                setDataHtmlPrint()
            } else
                dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const printKitchen = async (data, type = TYPE_PRINT.KITCHEN) => {
        isProvisional.current = false;
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        vendorSession = JSON.parse(vendorSession);
        data = JSON.parse(data)
        for (const value in data) {
            if (data.hasOwnProperty(value)) {
                if (printObject[value] != "") {
                    const item = data[value];
                    let i = 1;
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            const element = item[key];
                            console.log('element == ', element);
                            let res = printService.GenHtmlKitchen(htmlKitchen, element, i, vendorSession, type)
                            if (res && res != "") {
                                res = res.replace("</body>", "<p style='display: none;'>" + new Date() + "</p> </body>");
                                printService.listWaiting.push({ html: res, ip: printObject[value].ip, size: printObject[value].size })
                            }
                        }
                        i++;
                    }
                } else {
                    dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
                }
            }
        }
        console.log("printService.listWaiting ", printService.listWaiting);
        setDataHtmlPrint()
    }

    const checkIP = async () => {
        return new Promise(async (resolve, reject) => {
            let objectSetting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            console.log('checkIP objectSetting == ', objectSetting);
            if (objectSetting && objectSetting != "") {
                objectSetting = JSON.parse(objectSetting)
                let item = {}
                objectSetting.Printer.forEach(element => {
                    if (element.key == Constant.KEY_PRINTER.CashierKey) {
                        item = element;
                    }
                });
                if (item.key != "" && item.ip != "") {
                    resolve({ ip: item.ip, size: item.size })
                } else {
                    dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
                    resolve("")
                }
            } else {
                dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
                resolve("")
            }
        });
    }

    const checkHtmlPrint = (e) => {
        if (currentHtml.current && currentHtml.current.html && currentHtml.current.html != "") {
            setTimeout(() => {
                clickCapture()
            }, 100
            );
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
                            startInLoadingState
                            onLoadEnd={e => checkHtmlPrint(e)}
                        />
                    </View>
                </ScrollView>
            </View>
            {/* <TouchableOpacity style={{backgroundColor:"red", padding: 20, flex: 1}} onPress={() => data.callback("ClickHung")}><Text>Click</Text></TouchableOpacity> */}
            {/* <Image source={{ uri: uriImg ? uriImg : "" }} resizeMode="contain" style={{ position: "absolute", top: 50, width: 100, height: 100, flex: 1 }} /> */}
        </View>
    )

});

const styles = StyleSheet.create({

})
