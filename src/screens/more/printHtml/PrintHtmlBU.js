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
import { setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';

export default (props) => {

    const [tabType, setTabType] = useState(1);
    const [dataDefault, setDataDefault] = useState("");
    const [dataOnline, setDataOnline] = useState("");

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

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
        if(tabType == 1){
            setFileLuuDuLieu(Constant.HTML_PRINT, dataDefault);
        }else {
            setFileLuuDuLieu(Constant.HTML_PRINT, dataOnline);
        }
        props.navigation.pop();
    }

    const childRef = useRef();

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ToolBarPrintHtml
                clickRightIcon={onClickBack}
                navigation={props.navigation} title="Print HTML"
                clickDefault={() => { onClickTab(1) }}
                clickLoadOnline={() => { onClickTab(2) }}
                clickPrint={clickPrint}
                clickCheck={clickCheck}
                clickShow={() => { props.navigation.navigate("PrintWebview", { data: tabType == 1 ? dataDefault : dataOnline }) }}
            />
            {deviceType == Constant.PHONE ?
                tabType == 1 ?
                    <DefaultComponent output={(text) => onChangeDataDefault(text)} />
                    : <OnlineComponent output={(text) => onChangeDataOnline(text)} />
                :
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                        {
                            tabType == 1 ?
                                <DefaultComponent output={(text) => onChangeDataDefault(text)} />
                                : <OnlineComponent output={(text) => onChangeDataOnline(text)} />
                        }
                    </View>
                    <View style={{ flex: 1 }}>
                        {/* <Preview ref={childRef} data={tabType == 1 ? dataDefault : dataOnline} /> */}
                        <PrintWebview ref={childRef} data={tabType == 1 ? dataDefault : dataOnline} />
                    </View>
                </View>
            }
        </View>
    );
};

const DefaultComponent = (props) => {
    const [contentHtml, setContentHtml] = useState(htmlDefault);
    useEffect(() => {
        props.output(contentHtml)
    }, [])

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : "none"}>
            <TextInput style={{
                margin: 5,
                marginRight: 0,
                padding: 0,
                flex: 1,
                paddingBottom: Platform.OS == "ios" ? 20 : 0, color: "#000"
            }}
                multiline={true} onChangeText={text => {
                    props.output(text)
                    setContentHtml(text)
                }} value={contentHtml} />
        </KeyboardAvoidingView>
    )
}

const OnlineComponent = (props) => {

    const [dataHTML, setDataHTML] = useState("");
    const onClickLoadOnline = useCallback(() => {
        dialogManager.showLoading();
        let params = {};
        new HTTPService().setPath(ApiPath.PRINT_TEMPLATES + "/10").GET(params).then((res) => {
            console.log("onClickLoadOnline res ", res);
            if (res) {
                setDataHTML(res.Content)
                // setFileLuuDuLieu(Constant.HTML_PRINT, "" + res.Content);
                props.output(res.Content)
            }
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("onClickLoadOnline err ", e);
            dialogManager.hiddenLoading()
        })
    }, [])

    useEffect(() => {
        onClickLoadOnline()
    }, [])

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : "none"}>
            <TextInput style={{
                margin: 5,
                marginRight: 0,
                padding: 0,
                flex: 1,
                paddingBottom: Platform.OS == "ios" ? 20 : 0, color: "#000"
            }}
                multiline={true} onChangeText={text => {
                    props.output(text)
                    setDataHTML(text)
                }} value={dataHTML} />
        </KeyboardAvoidingView>
    )
}
