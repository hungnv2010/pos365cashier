import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import ToolBarPrintHtml from '../../../components/toolbar/ToolBarPrintHtml';
import { Images, Colors, Metrics } from '../../../theme';
import { WebView } from 'react-native-webview';
import htmlDefault from '../../../data/html/htmlDefault';
import HtmlKitchen from '../../../data/html/htmlKitchen';
import useDidMountEffect from '../../../customHook/useDidMountEffect';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import PrintWebview from '../PrintWebview';
import I18n from '../../../common/language/i18n'
import { setFileLuuDuLieu, getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import colors from '../../../theme/Colors';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';

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
            let HtmlPrint = await getFileDuLieuString(Constant.HTML_PRINT, true)
            console.log("getDataHtml HtmlPrint ", HtmlPrint, typeof(HtmlPrint));

            if (HtmlPrint != undefined && HtmlPrint != "")
                setDataHtml(HtmlPrint)
            else {
                setDataHtml(htmlDefault)
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
        if (number == 1) {
            setDataHtml(htmlDefault)
            setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
        } else {
            dialogManager.showLoading();
            let params = {};
            new HTTPService().setPath(ApiPath.PRINT_TEMPLATES + "/10").GET(params).then((res) => {
                console.log("onClickLoadOnline res ", res);
                if (res && res.Content) {
                    setDataHtml(res.Content)
                    setFileLuuDuLieu(Constant.HTML_PRINT, "" + res.Content);
                } else {
                    setDataHtml(htmlDefault)
                    setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
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
                        <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate("PrintWebview", { data: dataHtml }) }}>
                            <Text style={styles.textButton}>{I18n.t('hien_thi')}</Text>
                        </TouchableOpacity>
                        : null}
                </View>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : "none"}>
                    <TextInput style={{
                        margin: 5,
                        marginRight: 0,
                        padding: 0,
                        flex: 1,
                        paddingBottom: Platform.OS == "ios" ? 20 : 0, color: "#000"
                    }}
                        multiline={true}
                        onChangeText={text => {
                            setDataHtml(text)
                        }} value={dataHtml} />
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
                title="Print HTML"
            />
            {/* <ToolBarPrintHtml
                clickRightIcon={onClickBack}
                navigation={props.navigation} title="Print HTML"
                clickDefault={() => { onClickTab(1) }}
                clickLoadOnline={() => { onClickTab(2) }}
                clickPrint={clickPrint}
                clickCheck={clickCheck}
                clickShow={() => { props.navigation.navigate("PrintWebview", { data: tabType == 1 ? dataDefault : dataOnline }) }}
            /> */}

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
                        <PrintWebview ref={childRef} data={dataHtml} />
                    </View>
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    button: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
})