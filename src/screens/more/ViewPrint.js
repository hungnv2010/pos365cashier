import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, PixelRatio, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
import dialogManager from '../../components/dialog/DialogManager';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import printService from '../../data/html/PrintService';
const { Print } = NativeModules;
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import AutoHeightWebView from 'react-native-autoheight-webview'
import I18n from '../../common/language/i18n'
import htmlKitchen from '../../data/html/htmlKitchen';
import htmlDefault from '../../data/html/htmlDefault';

export const TYPE_PRINT = {
    KITCHEN: "KITCHEN",
    RETURN_PRODUCT: "RETURN_PRODUCT"
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
        printProvisionalRef(jsonContent, checkProvisional = false, imgBase64 = "", isPrintTest = false) {
            printProvisional(jsonContent, checkProvisional, imgBase64, isPrintTest)
        },
        printKitchenRef(jsonContent, type = TYPE_PRINT.KITCHEN) {
            console.log('printKitchenRef jsonContent type : ', jsonContent, type);
            printKitchen(jsonContent, type)
        },
        printDataNewOrdersRef(listKitchen, listReturnProduct) {
            console.log('printDataNewOrdersRef listKitchen, listReturnProduct : ', listKitchen, listReturnProduct);
            printDataNewOrders(listKitchen, listReturnProduct)
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
                Print.printImageFromClient(uri, currentHtml.current.ip, currentHtml.current.size, currentHtml.current.isCopies.toString(), (b) => {
                    console.log("printImageFromClient b ", b);
                })
                setTimeout(() => {
                    setDataHtmlPrint()
                }, 1000);
                // setDataHtmlPrint()
            },
            error => console.error('Oops, snapshot failed', error)
        );
    }

    const setDataHtmlPrint = () => {

        console.log("setDataHtmlPrint printService.listWaiting.length ", printService.listWaiting.length);

        if (printService.listWaiting.length > 0) {
            currentHtml.current = printService.listWaiting.pop()
            setDataHtml(currentHtml.current.html)
        }
        else {
            currentHtml.current = {}
        }
    }

    const printDataNewOrders = async (listKitchen, listReturnProduct) => {
        console.log('printDataNewOrdersRef listKitchen, listReturnProduct', listKitchen, listReturnProduct)
        if (listKitchen != null)
            await printKitchen(listKitchen, TYPE_PRINT.KITCHEN, false)
        if (listReturnProduct != null)
            await printKitchen(listReturnProduct, TYPE_PRINT.RETURN_PRODUCT, false)
        await setDataHtmlPrint();
    }

    const printProvisional = async (jsonContent, checkProvisional = false, imageQrBase64 = '', isPrintTest = false) => {
        let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        let HtmlPrint = await getFileDuLieuString(Constant.HTML_PRINT, true)
        if (HtmlPrint == undefined) {
            setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
            HtmlPrint = htmlDefault;
        }
        // HtmlPrint = htmlDefault;
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
        if (isPrintTest || checkProvisional || (setting.in_sau_khi_thanh_toan == true && !checkProvisional)) {
            let ipObject = await checkIP()
            console.log("printProvisional jsonContent numberLoop ", jsonContent);
            if (ipObject.ip != "") {
                if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
                    let res = await printService.GenHtml(HtmlPrint, jsonContent, imageQrBase64, checkProvisional)
                    if (res && res != "") {
                        let newRes = res.replace("</body>", "<p style='display: none;'>" + (new Date().getTime().toString()) + "</p> </body>");
                        let object = { html: newRes, ip: ipObject.ip, size: ipObject.size, isCopies: (setting.in_hai_lien_cho_hoa_don == true && !checkProvisional) };
                        // printService.listWaiting.push()
                        printService.listWaiting.splice(0, 0, object);
                        if (setting.in_hai_lien_cho_hoa_don == true && !checkProvisional) {
                            newRes = res.replace("</body>", "<p style='display: none;'>" + (new Date().getTime().toString()) + Math.floor((Math.random() * 1000000000) + 1) + "</p> </body>");
                            // printService.listWaiting.push({ html: newRes, ip: ipObject.ip, size: ipObject.size, isCopies: false })
                            printService.listWaiting.splice(0, 0, { html: newRes, ip: ipObject.ip, size: ipObject.size, isCopies: false });
                        }
                    }

                    console.log("listWaiting ==== " + JSON.stringify(printService.listWaiting))
                    setDataHtmlPrint()
                } else
                    dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
            }
        }
    }

    const printKitchen = async (data, type = TYPE_PRINT.KITCHEN, isPrint = true) => {
        console.log("printKitchen printObject ", printObject);
        let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        if (setting && setting != "") {
            setting = JSON.parse(setting);
        }
        isProvisional.current = false;
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        if (vendorSession && vendorSession != "")
            vendorSession = JSON.parse(vendorSession);
        data = JSON.parse(data)
        let i = 1;
        for (const value in data) {
            if (data.hasOwnProperty(value)) {
                if (printObject[value] != "") {
                    const item = data[value];
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            const element = item[key];
                            console.log('element == ', element);
                            let checkPrint = false;
                            element.forEach(el => {
                                if (el.Quantity > el.Processed) {
                                    checkPrint = true;
                                }
                            });
                            if (checkPrint || type != TYPE_PRINT.KITCHEN) {
                                if (setting && setting.in_hai_lien_cho_che_bien == true) {
                                    let res1 = printService.GenHtmlKitchen(htmlKitchen, element, i, vendorSession, type, 1)
                                    let res2 = printService.GenHtmlKitchen(htmlKitchen, element, i, vendorSession, type, 2)
                                    if (res1 && res1 != "") {
                                        res1 = res1.replace("</body>", "<p style='display: none;'>" + i + "</p> </body>");
                                        printService.listWaiting.push({ html: res1, ip: printObject[value].ip, size: printObject[value].size, isCopies: false })
                                    }
                                    if (res2 && res2 != "") {
                                        res2 = res2.replace("</body>", "<p style='display: none;'>" + Math.floor((Math.random() * 1000000000) + 1) + i + "in_hai_lien_cho_che_bien</p> </body>");
                                        printService.listWaiting.push({ html: res2, ip: printObject[value].ip, size: printObject[value].size, isCopies: false })
                                    }

                                } else {
                                    let res = printService.GenHtmlKitchen(htmlKitchen, element, i, vendorSession, type)
                                    if (res && res != "") {
                                        res = res.replace("</body>", "<p style='display: none;'>" + i + "</p> </body>");
                                        printService.listWaiting.push({ html: res, ip: printObject[value].ip, size: printObject[value].size, isCopies: false })
                                    }
                                }
                                // let res = printService.GenHtmlKitchen(htmlKitchen, element, i, vendorSession, type, (setting && setting.in_hai_lien_cho_che_bien == true) ? true : false)
                                // if (res && res != "") {
                                //     res = res.replace("</body>", "<p style='display: none;'>" + i + "</p> </body>");
                                //     printService.listWaiting.push({ html: res, ip: printObject[value].ip, size: printObject[value].size })
                                //     if (setting && setting.in_hai_lien_cho_che_bien == true) {
                                //         res = res.replace("</body>", "<p style='display: none;'>" + Math.floor((Math.random() * 1000000000) + 1) + i + "in_hai_lien_cho_che_bien</p> </body>");
                                //         printService.listWaiting.push({ html: res, ip: printObject[value].ip, size: printObject[value].size })
                                //     }
                                // }
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
        if (isPrint)
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
            }, 500
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
                            flex: 1, alignItems: "center", backgroundColor: "#ffffff"
                        }}>
                        <AutoHeightWebView
                            scrollEnabled={false}
                            style={{ backgroundColor: "#ffffff", width: deviceType == Constant.PHONE ? (orientation == Constant.PORTRAIT ? Dimensions.get('window').width / 1.35 : Dimensions.get('window').width / 2.3) : (orientation == Constant.PORTRAIT ? Dimensions.get('window').width / 2.8 : Dimensions.get('window').height / 2.8) }}
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
