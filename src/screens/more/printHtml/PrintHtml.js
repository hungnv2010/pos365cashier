import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TouchableWithoutFeedback, Modal, Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import ToolBarPrintHtml from '../../../components/toolbar/ToolBarPrintHtml';
import { Images, Colors, Metrics } from '../../../theme';
import { Snackbar, RadioButton } from 'react-native-paper';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import htmlKitchen from '../../../data/html/htmlKitchen';

const ListTemplatePrint = [
    {
        Id: 1,
        Name: I18n.t('don_hang')
    },
    {
        Id: 2,
        Name: I18n.t('bao_che_bien')
    }
]

export default (props) => {

    const [tabType, setTabType] = useState(1);
    const [dataHtml, setDataHtml] = useState(htmlDefault);
    const [template, setTemplate] = useState(ListTemplatePrint[0]);
    const [itemTemplate, setItemTemplate] = useState(ListTemplatePrint[0]);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [showModal, setShowModal] = useState(false);

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {
        const getDataHtml = async () => {
            let HtmlPrint = await getFileDuLieuString(Constant.HTML_PRINT, true)
            console.log("getDataHtml HtmlPrint ", HtmlPrint, typeof (HtmlPrint));
            if (HtmlPrint != undefined && HtmlPrint != "")
                setDataHtml(HtmlPrint)
            else {
                setDataHtml(htmlDefault)
            }
        }
        getDataHtml();
    }, [])

    useEffect(() => {
        if (template) {
            onSelectTab(1);
        }
    }, [template])

    const onSelectTab = (number) => {
        if (number == 1) {
            if (template.Id == 1) {
                setDataHtml(htmlDefault)
                setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
            } else if (template.Id == 2) {
                setDataHtml(htmlKitchen)
                setFileLuuDuLieu(Constant.PRINT_KITCHEN, htmlKitchen);
            }
        } else {
            dialogManager.showLoading();
            let params = {};
            let id = template.Id == 1 ? 10 : 15;
            new HTTPService().setPath(ApiPath.PRINT_TEMPLATES + `/${id}`).GET(params).then((res) => {
                console.log("onClickLoadOnline res ", res);
                if (res && res.Content) {
                    setDataHtml(res.Content)
                    if (template.Id == 1) {
                        setFileLuuDuLieu(Constant.HTML_PRINT, "" + res.Content);
                    } else {
                        setFileLuuDuLieu(Constant.PRINT_KITCHEN, "" + res.Content);
                    }
                } else {
                    if (template.Id == 1) {
                        setDataHtml(htmlDefault)
                        setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
                    } else {
                        setDataHtml(htmlKitchen)
                        setFileLuuDuLieu(Constant.PRINT_KITCHEN, htmlKitchen);
                    }
                }
                dialogManager.hiddenLoading()
            }).catch((e) => {
                console.log("onClickLoadOnline err ", e);
                dialogManager.hiddenLoading()
            })
        }
    }

    const onSelectPrintTemplate = () => {
        setItemTemplate(template);
        setShowModal(true)
    }

    const onClickOkFilter = () => {
        setTemplate(itemTemplate);
        setShowModal(false)
    }

    const onClickCancelFilter = () => {
        setShowModal(false)
    }

    const onSelectTemplate = (item) => {
        setItemTemplate(item)
    }

    const renderFilter = () => {
        return (
            <View style={styles.viewFilter}>
                <Text style={styles.titleFilter}>{I18n.t('chon_mau_in')}</Text>
                <ScrollView style={{ maxHeight: Metrics.screenWidth }}>
                    {
                        ListTemplatePrint.map((item, index) => {
                            return (
                                <TouchableOpacity key={index.toString()} onPress={() => onSelectTemplate(item)} style={styles.viewRadioButton}>
                                    <RadioButton.Android
                                        status={itemTemplate.Id == item.Id ? 'checked' : 'unchecked'}
                                        onPress={() => onSelectTemplate(item)}
                                        color={colors.colorchinh}
                                    />
                                    <Text style={{}}>{item.Name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
                <View style={styles.viewBottomFilter}>
                    <TouchableOpacity style={styles.viewButtonCancel} onPress={onClickCancelFilter}>
                        <Text style={styles.textButtonCancel}>{I18n.t("huy")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.viewButtonOk} onPress={onClickOkFilter}>
                        <Text style={styles.textButtonOk}>{I18n.t("dong_y")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const childRef = useRef();

    const ViewInputHtml = () => {
        return (
            <View style={{ flex: 1 }}>

                <View style={{ padding: 5, justifyContent: "space-between", flexDirection: "row" }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Icon style={{ paddingHorizontal: 10 }} name="printer" size={22} color="black" />
                        <Text style={{ padding: 0, fontSize: 16 }}>{I18n.t('chon_mau_in')}</Text>
                    </View>
                    <TouchableOpacity style={styles.buttonPrintTemplate} onPress={() => { onSelectPrintTemplate() }}>
                        <Text style={styles.textButtonPrintTemplate}>{template.Name}</Text>
                        <FontAwesome style={{ paddingLeft: 8 }} name="caret-down" size={22} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 5, justifyContent: "space-between", flexDirection: "row" }}>
                    <TouchableOpacity style={styles.button} onPress={() => { onSelectTab(1) }}>
                        <Text style={styles.textButton}>{I18n.t('mac_dinh')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { onSelectTab(2) }}>
                        <Text style={styles.textButton}>LOAD ONLINE</Text>
                    </TouchableOpacity>
                    {deviceType == Constant.PHONE ?
                        <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate("PrintWebview", { data: dataHtml, type: template.Id == 1 ? 10 : 15 }) }}>
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
                title={I18n.t('thiet_lap_mau_in')}
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
                        <PrintWebview {...props} ref={childRef} data={dataHtml} type={template == 1 ? 10 : 15} />
                    </View>
                </View>
            }
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={styles.viewModal}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>
                    </TouchableWithoutFeedback>
                    <View style={[styles.viewModalContent]}>
                        <View style={styles.viewContentPopup}>
                            {renderFilter()}
                        </View>
                    </View>
                </View>
            </Modal>
            <Snackbar
                duration={1500}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonPrintTemplate: { flexDirection: "row", padding: 9, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 15, borderColor: colors.colorLightBlue, borderWidth: 1 },
    button: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
    textButtonPrintTemplate: { color: colors.colorLightBlue, textTransform: "uppercase" },

    viewModal: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    viewModalContent: { justifyContent: 'center', alignItems: 'center', },
    viewContentPopup: {
        padding: 0,
        borderRadius: 4, marginHorizontal: 20,
        width: Metrics.screenWidth * 0.8
    },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    },
    textButtonCancel: { textAlign: "center", color: "#000" },
    textButtonOk: { textAlign: "center", color: "#fff" },
    viewButtonOk: { marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingVertical: 10, justifyContent: "flex-end" },
    viewButtonCancel: { flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, alignItems: 'center', justifyContent: "center" },
    viewRadioButton: { flexDirection: "row", alignItems: "center", padding: 3 },
    viewFilter: { backgroundColor: "#fff", padding: 15, maxHeight: Metrics.screenHeight * 0.7, borderRadius: 4 },
    titleFilter: { paddingBottom: 10, fontWeight: "bold", textTransform: "uppercase", color: colors.colorLightBlue, textAlign: "left", width: "100%" },
    viewBottomFilter: { justifyContent: "center", flexDirection: "row", paddingTop: 10 },

})