import React, { useState, useCallback, useEffect, useRef } from 'react';
import {NativeModules, Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import ToolBarPrintHtml from '../../components/toolbar/ToolBarPrintHtml';
import { Images, Colors, Metrics } from '../../theme';
import { WebView } from 'react-native-webview';
import htmlDefault from '../../data/html/htmlDefault';
import HtmlKitchen from '../../data/html/htmlKitchen';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import PreviewTempPrint from './PreviewTempPrint';
import I18n from '../../common/language/i18n'
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import colors from '../../theme/Colors';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { ScreenList } from '../../common/ScreenList';
import tempDefault from './tempDefault';
const { PrintTemp } = NativeModules;

const Code = {
    Ten_Cua_Hang: "{Ten_Cua_Hang}",
    Dia_chi_Cua_Hang: "{Dia_chi_Cua_Hang}",
    Dien_Thoai_Cua_Hang: "{Dien_Thoai_Cua_Hang}",
    Ma_Chung_Tu: "{Ma_Chung_Tu}",

}

export default (props) => {

    const [tabType, setTabType] = useState(1);
    const [dataHtml, setDataHtml] = useState(htmlDefault);
    const [dataDefault, setDataDefault] = useState("");
    const [dataOnline, setDataOnline] = useState("");

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {

        const getDataHtml = async () => {
            let TempDefault = await getFileDuLieuString(Constant.TEMP_DEFAULT, true)
            console.log("getDataHtml TempDefault ", TempDefault, typeof (TempDefault));

            if (TempDefault != undefined && TempDefault != "")
                setDataHtml(TempDefault)
            else {
                setDataHtml(tempDefault)
            }
        }

        getDataHtml();
    }, [])

    let preview = null;
    clickCheck = () => {
        childRef.current.clickCheckInRef()
    }

    clickPrint = () => {
        childRef.current.clickPrintInRef()
    }

    const onClickTab = (number) => {
        setTabType(number)
        // if (number == 1)
        //     setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
    }

    const onChangeDataDefault = (text) => {
        console.log("onChangeDataDefault ", text);

        // setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
        setDataDefault(text)
    }

    const onChangeDataOnline = (text) => {
        setDataOnline(text)
    }

    const onClickBack = () => {
        console.log("onClickBack ", tabType);
        // setFileLuuDuLieu(Constant.HTML_PRINT, dataHtml);
        props.navigation.pop();
    }

    const onSelectTab = (number) => {
        PrintTemp.registerPrint("Hung")
        if (number == 1) {
            setDataHtml(tempDefault)
            setFileLuuDuLieu(Constant.HTML_PRINT, tempDefault);
        } else {
            dialogManager.showLoading();
            let params = {};
            new HTTPService().setPath(ApiPath.PRINT_TEMPLATES + "/12").GET(params).then((res) => {
                console.log("onClickLoadOnline res ", res);
                if (res && res.Content) {
                    setDataHtml(res.Content)
                    setFileLuuDuLieu(Constant.HTML_PRINT, "" + res.Content);
                } else {
                    setDataHtml(tempDefault)
                    setFileLuuDuLieu(Constant.HTML_PRINT, tempDefault);
                }
                dialogManager.hiddenLoading()
            }).catch((e) => {
                console.log("onClickLoadOnline err ", e);
                dialogManager.hiddenLoading()
            })
        }
    }

    const childRef = useRef();

    const ViewInputHtml = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ padding: 5, justifyContent: "space-between", flexDirection: "row" }}>
                    <TouchableOpacity style={styles.button} onPress={() => { onSelectTab(1) }}>
                        <Text style={styles.textButton}>{I18n.t('mac_dinh')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { onSelectTab(2) }}>
                        <Text style={styles.textButton}>LOAD ONLINE</Text>
                    </TouchableOpacity>
                    {deviceType == Constant.PHONE ?
                        <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate(ScreenList.PreviewTempPrint, { data: dataHtml }) }}>
                            <Text style={styles.textButton}>{I18n.t('hien_thi')}</Text>
                        </TouchableOpacity>
                        : null}
                </View>
                <KeyboardAvoidingView style={{ flex: 1, flexDirection: "column" }} behavior={Platform.OS == "ios" ? "padding" : "none"}>
                    <TextInput style={{
                        padding: 10,
                        flex: 1.6,
                    }}
                        multiline={true}
                        onChangeText={text => {
                            setDataHtml(text)
                        }} value={dataHtml} />

                    <ScrollView style={{ flex: 1, padding: 10, borderTopColor: "gray", borderTopWidth: 0.5 }}>
                        <Text style={{ textTransform: "uppercase", color: "orange" }}>Mã nhúng</Text>
                        <Text><Text style={styles.noteCode}>{Code.Ten_Cua_Hang} :</Text> Tên cửa hàng</Text>
                        <Text><Text style={styles.noteCode}>{Code.Dia_chi_Cua_Hang} :</Text> Tên cửa hàng</Text>
                        <Text><Text style={styles.noteCode}>{Code.Dien_Thoai_Cua_Hang} :</Text> Tên cửa hàng</Text>
                        <Text><Text style={styles.noteCode}>{Code.Ma_Chung_Tu} :</Text> Tên cửa hàng</Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                navigation={props.navigation}
                title="Temp Print"
            />
            {deviceType == Constant.PHONE ?
                ViewInputHtml()
                :
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                        {
                            ViewInputHtml()
                        }
                    </View>
                    <View style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: "gray" }}>
                        <PreviewTempPrint ref={childRef} data={dataHtml} />
                    </View>
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    button: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
    noteCode: { color: colors.colorLightBlue },
})