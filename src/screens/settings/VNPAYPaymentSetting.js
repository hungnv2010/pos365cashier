import React, { useState, useEffect, useCallback, useRef } from 'react'
import SettingSwitch from '../settings/SettingSwitch';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native';
import { ScrollView } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import { useFocusEffect } from '@react-navigation/native';
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService } from "../../data/services/HttpService";
import { TouchableWithoutFeedback } from 'react-native';
import { Metrics } from '../../theme';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
export default (props) => {
    const [qrcodeEnable, setQRCodeEnable] = useState(false)
    const [stateModal, setStateModal] = useState(false)
    const [titileModal, setTitleModal] = useState()
    const [input, setInput] = useState()
    const [merchantCategory, setMerchantCategory] = useState()
    const [defaultMerchantCode, setMerchantCode] = useState()
    const [defaultMerchantName, setMerchantName] = useState()
    const [settingObject, setSettingObject] = useState()
    const [printInvoice, setPrintInvoice] = useState(false)
    const [paymentPosMachine, setPaymentPosMachine] = useState(false)
    const [marginModal, setMargin] = useState(0)
    const isPost = useRef(false)

    useFocusEffect(useCallback(() => {
        const getQrCodeEnable = async () => {
            let setting = await new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET()
            let objectSetting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            setSettingObject(JSON.parse(objectSetting))
            setPrintInvoice(JSON.parse(objectSetting).PrintInvoiceBeforePaymentVNPayQR ? JSON.parse(objectSetting).PrintInvoiceBeforePaymentVNPayQR : false)
            console.log("QR", setting.Settings.QrCodeEnable);
            setQRCodeEnable(setting.Settings.QrCodeEnable)
            setMerchantCode(setting.Settings.MerchantCode)
            setMerchantName(setting.Settings.MerchantName)
            setMerchantCategory(setting.Settings.SmartPOS_MCC)
            console.log("props params", props.params);
        }
        getQrCodeEnable()
    }, []))
    useEffect(() => {
        console.log("VNPay", settingObject);
    }, [settingObject])
    const funSetStateModal = (data) => {
        setStateModal(data.status)
        setTitleModal(data.title)
    }
    const getData = (data) => {
        setStateModal(data.status)
        setTitleModal(data.title)
    }
    const onClick = (data) => {
        setQRCodeEnable(data.stt)
        updateSetting('QrCodeEnable', data.stt)

    }
    const onClickPrintInvoice = (data) => {
        setPrintInvoice(data.stt)
        setSettingObject({ ...settingObject, PrintInvoiceBeforePaymentVNPayQR: data.stt })
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify({ ...settingObject, PrintInvoiceBeforePaymentVNPayQR: data.stt }))
    }
    const onClickPaymentPosMachine = (data) => {
        setPaymentPosMachine(data.status)
    }
    const setInfoModal = (value) => {
        if (titileModal == 'Merchant Code') {
            setMerchantCode(value)
            updateSetting('MerchantCode', value)
        }
        else if (titileModal == 'Merchant Name') {
            setMerchantName(value)
            updateSetting('MerchantName', value)
        }
        else {
            setMerchantCategory(value)
            updateSetting('SmartPOS_MCC', value)
        }
        setStateModal(false)
    }
    useFocusEffect(useCallback(() => {

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }


    }, []))
    const _keyboardDidShow = () => {
        setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }
    const updateSetting = (key, value) => {
        let params = {
            Key: key,
            Value: value
        }
        console.log("clickkkkkkkkkk");

        new HTTPService().setPath(ApiPath.UPDATE_SETTING).POST(params)
            .then(res => {
                console.log('onClickApply res', res);
                if (res) {
                    console.log("res");
                    setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify({ ...settingObject, key: value }))
                    new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET().then(async (res) => {
                        console.log("getDataRetailerInfo res ", res);
                        setFileLuuDuLieu(Constant.VENDOR_SESSION, JSON.stringify(res))
                    })
                }
            })
            .catch(err => {
                console.log('onClickApply err', err);
            })

    }
    return (
        <View style={{ flex: 1 }}>
            {
                props.route.params._onSelect ?
                    <ToolBarDefault
                        {...props}
                        navigtion={props.navigtion}
                        clickLeftIcon={() => {
                            props.navigtion.goBack()
                        }}
                        title={I18n.t('setting')} />
                    :
                    <MainToolBar
                        navigation={props.navigation}
                        title={I18n.t('setting')}
                        outPutTextSearch={() => { }}
                    />
            }
            <ScrollView>
                <SettingSwitch title={'thanh_toan_vnpayqr'} output={onClick} isStatus={qrcodeEnable} />
                <SettingSwitch title={'in_hoa_don_truoc_khi_thanh_toan_VNPAYQR_thanh_cong'} output={onClickPrintInvoice} isStatus={printInvoice} />
                {/* <SettingSwitch title={'thanh_toan_vnpaypos_qua_may_pos'} outPut = {onClickPaymentPosMachine} isStatus={paymentPosMachine}/> */}
                <View>
                    <HideView enable={qrcodeEnable} outPut={getData} merchantCode={defaultMerchantCode} merchantName={defaultMerchantName} />
                </View>
                <Merchant name={'Merchant Category Name'} onShowModal={funSetStateModal} value={merchantCategory} />
            </ScrollView>
            <Modal animationType='fade'
                transparent={true}
                visible={stateModal}
                supportedOrientations={['portrait', 'landscape']}
            >
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setStateModal(false)
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={{
                            backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}></View>

                    </TouchableWithoutFeedback>
                    <View style={[styles.styleViewModal, , { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]} >
                        <View style={{ width: Metrics.screenWidth * 0.8, }}>
                            <Text style={styles.titleModal}>{I18n.t('thong_tin_cua_hang')}</Text>
                            <Text style={{ fontSize: 16, justifyContent: 'center', marginTop: 5, marginLeft: 20 }}>Mời nhập {titileModal} </Text>
                            <TextInput style={styles.textInputStyle} autoFocus onChangeText={text => setInput(text)}></TextInput>
                            <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10, borderRadius: 10 }} onPress={() => setInfoModal(input)}>
                                <Text style={{ textAlign: 'center', color: '#FFF', marginRight: 40, backgroundColor: colors.colorchinh, paddingVertical: 10, paddingHorizontal: 20 }} >{I18n.t("dong_y")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const HideView = (props) => {
    if (props.enable == true) {
        const funSendData = (data) => {
            props.outPut(data)
        }
        return (
            <View>
                <Merchant name={'Merchant Code'} onShowModal={funSendData} value={props.merchantCode} />
                <Merchant name={'Merchant Name'} onShowModal={funSendData} value={props.merchantName} />
            </View>
        )
    } else {
        return (null)
    }
}
const Merchant = (props) => {
    const onClick = () => {
        props.onShowModal({ status: true, title: props.name, titleHint: props.value })
    }
    return (
        <TouchableOpacity onPress={onClick}>
            <View style={{ flex: 1 }} >
                <Text style={{ fontSize: 16, marginLeft: 20, marginTop: 20 }} onPress={onClick}>{props.name}</Text>
                <Text style={{ fontSize: 16, marginLeft: 20, color: 'grey' }} onPress={onClick} >{props.value}</Text>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create(
    {
        styleSettingSwitch: {
            marginLeft: 10,
            marginTop: 10,

        },
        stylePrintConect: {
            marginTop: 10,
            marginLeft: 10,

        },
        styleViewModal: {
            alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff", borderWidth: 0.5, borderRadius: 5,
        },
        textInputStyle: {
            height: 45, borderBottomWidth: 0.5, marginTop: 20, padding: 10, marginLeft: 20, marginRight: 20, borderRadius: 5, fontSize: 16, color: '#000'
        },
        titleModal: {
            fontSize: 16, fontWeight: "bold", textAlign: "center", paddingVertical: 10, color: '#FF6600'
        },

    }
)
