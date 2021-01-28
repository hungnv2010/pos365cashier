import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Switch } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, NativeModules } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n'
import MainToolBar from '../main/MainToolBar';
import SettingSwitch from '../settings/SettingSwitch';
import PrintConnect from '../settings/PrintConnect';
import { TouchableWithoutFeedback } from 'react-native';
import { Constant } from '../../common/Constant';
import { RadioButton } from 'react-native-paper'
import { Metrics } from '../../theme';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { useFocusEffect } from '@react-navigation/native';
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService } from "../../data/services/HttpService";
import { ScreenList } from '../../common/ScreenList';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import colors from '../../theme/Colors';
const { Print } = NativeModules;

export const DefaultSetting = {
    am_bao_thanh_toan: true,
    Printer: [
        {
            key: Constant.KEY_PRINTER.CashierKey,
            title: 'may_in_thu_ngan',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.KitchenAKey,
            title: 'may_in_bao_bep_a',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.KitchenBKey,
            title: 'may_in_bao_bep_b',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.KitchenCKey,
            title: 'may_in_bao_bep_c',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.KitchenDKey,
            title: 'may_in_bao_bep_d',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.BartenderAKey,
            title: 'may_in_bao_pha_che_a',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.BartenderBKey,
            title: 'may_in_bao_pha_che_b',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.BartenderCKey,
            title: 'may_in_bao_pha_che_c',
            type: '',
            size: '',
            ip: ''
        },
        {
            key: Constant.KEY_PRINTER.BartenderDKey,
            title: 'may_in_bao_pha_che_d',
            type: '',
            size: '',
            ip: ''
        },
        // {
        //     key: Constant.KEY_PRINTER.StampPrintKey,
        //     title: 'may_in_tem',
        //     type: '',
        //     size: '',
        //     ip: ''
        // },
    ],
    InfoStore: '',
    HtmlPrint: '',
    TempPrint: '',
    tu_dong_in_bao_bep: false,
    in_sau_khi_thanh_toan: true,
    in_hai_lien_cho_hoa_don: false,
    in_hai_lien_cho_che_bien: false,
    in_tam_tinh: false,
    in_tem_truoc_thanh_toan: false,
    bao_che_bien_sau_thanh_toan: false,
    cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang: false,
    cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang: false,
    khong_cho_phep_ban_hang_khi_het_ton_kho: false,
    mo_cashbox_sau_khi_thanh_toan: false,
    nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly: false,
    giu_man_hinh_luon_sang: false,
    CurrencyUnit: 'đ',
}

export default (props) => {
    const dispatch = useDispatch();
    const PrintType = {
        id: 0,
        printTypeId: 0,
        name: "khong_in",
    }
    const Currentcy = {
        id: 0,
        currentId: 0,
        name: 'VND',
        value: 'đ'
    }

    const [settingObject, setSettingObject] = useState(DefaultSetting)
    const [inforStore, setInforStore] = useState({})
    useFocusEffect(useCallback(() => {
        const getSetting = async () => {
            let data = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            console.log("setting data", JSON.parse(data));
            let res = await new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET()
            setSettingObject(JSON.parse(data))
            if (res.length != 0)
                setSettingObject({ ...JSON.parse(data), strings: res.Settings })
            console.log("setting object", settingObject);


        }

        getSetting()
    }, []))
    useEffect(() => {
        console.log("setting object", settingObject);
    }, [settingObject])
    useFocusEffect(useCallback(() => {
        const getCurentRetailer = async () => {
            let res = await new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET()
            setInforStore(res.CurrentRetailer)
        }
        getCurentRetailer()
    }, []))
    const printerObject = useSelector(state => {
        return state.Common.printerObject
    });
    useEffect(() => {
        console.log("Printer Object", (printerObject));
    }, [settingObject])

    const saveState = (object) => {
        setSettingObject(object)
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify(object))
    }
    const updateSetting = (key, value) => {
        let params = {
            Key: key,
            Value: value
        }
        new HTTPService().setPath(ApiPath.UPDATE_SETTING).POST(params)
            .then(res => {
                if (res) {
                    console.log("res");
                } else {
                    console.log('aaa');
                }
            })
            .catch(err => {
                console.log('onClickApply err', err);
            })
    }
    const onSwitchTone = (data) => {
        switch (data.title) {
            case 'am_bao_thanh_toan':
                saveState({ ...settingObject, am_bao_thanh_toan: data.stt })
                break
            case 'tu_dong_in_bao_bep':
                saveState({ ...settingObject, tu_dong_in_bao_bep: data.stt })
                break
            case 'in_sau_khi_thanh_toan':
                saveState({ ...settingObject, in_sau_khi_thanh_toan: data.stt })
                break
            case 'in_hai_lien_cho_hoa_don':
                saveState({ ...settingObject, in_hai_lien_cho_hoa_don: data.stt })
                break
            case 'in_hai_lien_cho_che_bien':
                saveState({ ...settingObject, in_hai_lien_cho_che_bien: data.stt })
                break
            case 'in_tam_tinh':
                saveState({ ...settingObject, in_tam_tinh: data.stt })
                updateSetting('AllowPrintPreview', data.stt)
                break
            case 'in_tem_truoc_thanh_toan':
                saveState({ ...settingObject, in_tem_truoc_thanh_toan: data.stt })
                break
            case 'bao_che_bien_sau_thanh_toan':
                saveState({ ...settingObject, bao_che_bien_sau_thanh_toan: data.stt })
                updateSetting('PrintKitchenAfterSave', data.stt)
                break
            case 'cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang':
                saveState({ ...settingObject, cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang: data.stt })
                break
            case 'cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang':
                saveState({ ...settingObject, cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang: data.stt })
                updateSetting('AllowChangePrice', data.stt)
                break
            case 'khong_cho_phep_ban_hang_khi_het_ton_kho':
                saveState({ ...settingObject, khong_cho_phep_ban_hang_khi_het_ton_kho: data.stt })
                updateSetting('StockControlWhenSelling', data.stt)
                break
            // case 'mo_cashbox_sau_khi_thanh_toan':
            //     saveState({ ...settingObject, mo_cashbox_sau_khi_thanh_toan: data.stt })
            //     break
            // case 'nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly':
            //     saveState({ ...settingObject, nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly: data.stt })
            //     break
            case 'giu_man_hinh_luon_sang':
                if (data.stt == true)
                    Print.keepTheScreenOn("ok")
                else
                    Print.keepTheScreenOff("ok")
                saveState({ ...settingObject, giu_man_hinh_luon_sang: data.stt })
                break
        }
    }
    const [modalStoreInfor, setModalStoreInfor] = useState(false)
    const onShowModalStoreInfor = () => {
        setModalStoreInfor(!modalStoreInfor)
    }
    const [showModal, setShowModal] = useState(false)
    const onShowModal = (data) => {
        setShowModal(data.stt)
        setTitlePrint(data.title)
        setPositionPrint(data.index)
        setDefautlType(settingObject.Printer[data.index].type)

    }
    const savePrint = (object) => {
        setSettingObject(object)
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify(object))
    }
    const [showModalSize, setStateMoalSize] = useState(false)
    const onShowModalSize = () => {
        console.log(defaultType)
        if (defaultType == 'khong_in') {
            setShowModal(false)
            setModalStampPrint(false)
            setStateMoalSize(false)
            settingObject.Printer[positionPrint] = { ...settingObject.Printer[positionPrint], type: defaultType, size: '', ip: '' }
            savePrint({ ...settingObject })
            // dispatch({ type: 'PRINT_OBJECT', printerObject: JSON.stringify(settingObject.Printer) })

            savePrintRedux(settingObject.Printer)
        }
        else {
            setStateMoalSize(!showModalSize)
            if (!showModalSize == true) {
                setShowModal(false)
                setModalStampPrint(false)
            }
        }
    }
    const [stateModalNumberCard, setStateModalNumberCard] = useState(false)
    const funSetStateModal = (data) => {
        setStateModalNumberCard(data)
    }
    const funSetModalCurrentcy = (data) => {
        setStateCurrentcy(data.stt)
        setCurrentcy(data.currency)
    }
    const [stateCurrentcy, setStateCurrentcy] = useState(false)
    const onChangeStateCurrentcy = () => {
        setStateCurrentcy(!stateCurrentcy)
        setCurrentcy(typeCurrentcy)
        setTypeCurrentcy(currentcy)
    }
    const [itemPrintType, setItemPrintType] = useState(PrintType);
    const onSelectPrintType = (item) => {
        setItemPrintType({ ...item, PrintTypeId: item.key })
        setDefautlType(item.name)
    }
    const [itemCurrentcy, setItemCurrency] = useState(Currentcy);
    const [currentcy, setCurrentcy] = useState(typeCurrentcy)
    const [typeCurrentcy, setTypeCurrentcy] = useState(currentcy)
    const onSelectTypeCurrentcy = () => {
        saveState({ ...settingObject, CurrencyUnit: currentcy })
        setTypeCurrentcy(currentcy)
        setStateCurrentcy(false)
    }
    const onSelectCurrentcy = (item) => {
        setItemCurrency({ ...item, currentId: item.key })
        setCurrentcy(item.value)
    }
    const changePrintTypeKitchenA = () => {
        setStateMoalSize(false)
        if (defaultType == 'in_qua_mang_lan') {
            setStateModalLAN(!stateModalLAN)
        } else {
            settingObject.Printer[positionPrint] = { ...settingObject.Printer[positionPrint], type: defaultType, size: defaultSize, ip: '' }
            savePrint({ ...settingObject })
            savePrintRedux(settingObject.Printer)
        }
    }
    const setIpLANPrint = () => {
        setStateValueIp('192.168.99.')
        settingObject.Printer[positionPrint] = { ...settingObject.Printer[positionPrint], type: defaultType, size: defaultSize, ip: defaultIpLAN }
        savePrint({ ...settingObject })
        savePrintRedux(settingObject.Printer)
        setStateModalLAN(!stateModalLAN)
    }
    const [stateValueIp, setStateValueIp] = useState('192.168.99.')
    const changeValueIp = (a) => {
        setStateValueIp(a)
        setDefaultIpLAN(a)
    }
    const [modalStampPrint, setModalStampPrint] = useState(false)
    const onShowModalStampPrint = (data) => {
        setPositionPrint(data.index)
        setDefautlType(settingObject.Printer[data.index].type)
        setModalStampPrint(data.stt)
        setTitlePrint(data.title)
    }
    const [stateModalLAN, setStateModalLAN] = useState(false)
    const [titlePrint, setTitlePrint] = useState('')
    const [defaultType, setDefautlType] = useState('')
    const [defaultSize, setDefaultSize] = useState('')
    const [defaultIpLAN, setDefaultIpLAN] = useState('')
    const [positionPrint, setPositionPrint] = useState()

    const screenSwitch = (nameFun, pr) => {
        let params = pr
        props.navigation.navigate(nameFun, params)
        props.navigation.closeDrawer();
    }

    const savePrintRedux = (Printer) => {
        let objectPrint = {}
        Printer.forEach(element => {
            objectPrint[element.key] = { ip: element.ip, size: element.size };
        });
        console.log("savePrinter objectPrint ", objectPrint);
        dispatch({ type: 'PRINT_OBJECT', printerObject: objectPrint })
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
                    />
            }
            <ScrollView style={{ marginBottom: 1 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    {/* <TouchableOpacity onPress={() => screenSwitch(ScreenList.VNPayPaymentSetting, settingObject)}>
                        <Text style={styles.textTitleItem}>{I18n.t("thiet_lap_thanh_toan_vnpay")}</Text>
                    </TouchableOpacity>
                    <View style={styles.viewLine}></View> */}

                    <View>
                        <Text style={styles.textTitle}>{I18n.t("thong_bao")}</Text>
                        <SettingSwitch
                            title={"am_bao_thanh_toan"} output={onSwitchTone} isStatus={settingObject.am_bao_thanh_toan}
                        />
                    </View>
                    <View style={styles.viewLine}>
                    </View>
                    <View>
                        <Text style={styles.textTitle}>Print Connect</Text>
                        {
                            settingObject.Printer.map((item, index) => {
                                return (
                                    <PrintConnect key={index.toString()} title={I18n.t(item.title)} onSet={index == 9 ? onShowModalStampPrint : onShowModal} stylePrinter={(item.type ? I18n.t(item.type) : I18n.t('khong_in')) + (item.size ? ', size ' + item.size + ' mm ' : '') + (item.ip ? '(' + item.ip + ')' : '')} pos={index} status={showModal} />
                                )
                            })
                        }
                    </View>
                    <View style={styles.viewLine}></View>
                    <View>
                        <Text style={styles.textTitle}>Print Setup</Text>
                        <TouchableOpacity onPress={onShowModalStoreInfor}>
                            <Text style={styles.textTitleItem}>{I18n.t("thong_tin_cua_hang")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => screenSwitch(ScreenList.PrintHtml)}>
                            <Text style={styles.textTitleItem}>HTML print</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => screenSwitch(ScreenList.PrintWebview)}>
                            <Text style={styles.textTitleItem}>Temp print</Text>
                        </TouchableOpacity> */}
                        <SettingSwitch title={"tu_dong_in_bao_bep"} output={onSwitchTone} isStatus={settingObject.tu_dong_in_bao_bep} />
                        <SettingSwitch title={"in_sau_khi_thanh_toan"} output={onSwitchTone} isStatus={settingObject.in_sau_khi_thanh_toan} />
                        <SettingSwitch title={"in_hai_lien_cho_hoa_don"} output={onSwitchTone} isStatus={settingObject.in_hai_lien_cho_hoa_don} />
                        <SettingSwitch title={"in_hai_lien_cho_che_bien"} output={onSwitchTone} isStatus={settingObject.in_hai_lien_cho_che_bien} />
                        <SettingSwitch title={"in_tam_tinh"} output={onSwitchTone} isStatus={settingObject.in_tam_tinh} />
                        {/* <SettingSwitch title={"in_tem_truoc_thanh_toan"} output={onSwitchTone} isStatus={settingObject.in_tem_truoc_thanh_toan} /> */}
                        {/* <SettingSwitch title={"bao_che_bien_sau_thanh_toan"} output={onSwitchTone} isStatus={settingObject.bao_che_bien_sau_thanh_toan} /> */}
                    </View>
                    <View style={styles.viewLine}></View>
                    <View>
                        <Text style={styles.textTitle}>{I18n.t("thiet_lap_tinh_nang")}</Text>
                        <SettingSwitch title={"cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang"} output={onSwitchTone} isStatus={settingObject.cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang} />
                        <SettingSwitch title={"cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang"} output={onSwitchTone} isStatus={settingObject.cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang} />
                        <SettingSwitch title={"khong_cho_phep_ban_hang_khi_het_ton_kho"} output={onSwitchTone} isStatus={settingObject.khong_cho_phep_ban_hang_khi_het_ton_kho} />
                        <SettingSwitch title={"mo_cashbox_sau_khi_thanh_toan"} output={onSwitchTone} isStatus={settingObject.mo_cashbox_sau_khi_thanh_toan} />
                        <SettingSwitch title={"nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly"} output={onSwitchTone} isStatus={settingObject.nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly} />
                    </View>
                    <View style={styles.viewLine}></View>
                    <View>
                        <Text style={styles.textTitle}>{I18n.t("thiet_lap_he_thong")}</Text>
                        <SettingSwitch title={"giu_man_hinh_luon_sang"} output={onSwitchTone} isStatus={settingObject.giu_man_hinh_luon_sang} />
                        <CurrencyUnit onSetModalCurrency={funSetModalCurrentcy} currencyUnit={settingObject.CurrencyUnit} />
                    </View>
                    <View style={styles.viewLine}></View>
                </View>
                <View style={{ alignItems: "center", justifyContent: 'center' }}>
                    <Modal animationType='none'
                        transparent={true}
                        visible={showModal}
                        supportedOrientations={["portrait", "landscape"]}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setShowModal(false)
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
                            <View style={styles.styleViewModal} >
                                <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                    <Text style={styles.titleModal}>{I18n.t('chon_cong_nghe_in')}</Text>
                                    {
                                        Constant.CATYGORY_PRINT && [PrintType].concat(Constant.CATYGORY_PRINT).map((item, index) => {
                                            return (
                                                <TouchableOpacity key={index.toString()} style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }} onPress={() => onSelectPrintType(item)}>
                                                    <RadioButton.Android
                                                        style={{ padding: 0, margin: 0 }}
                                                        color='#FF4500'
                                                        onPress={() => onSelectPrintType(item)}
                                                        status={(defaultType ? defaultType : 'khong_in') == item.name ? 'checked' : 'unchecked'}
                                                    />
                                                    <Text style={{ marginLeft: 0 }}>{I18n.t(item.name)}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setShowModal(false)} >
                                            <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={styles.styleTextBtnOk}>{I18n.t("dong_y")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='fade'
                        transparent={true}
                        visible={showModalSize}
                        supportedOrientations={['portrait', 'landscape']}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setStateMoalSize(false)
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
                            <View style={styles.styleViewModal} >
                                <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                    <Text style={styles.titleModal}>{I18n.t('thong_tin_cua_hang')}</Text>
                                    <Text style={{ fontSize: 18, justifyContent: 'center', marginTop: 10, marginLeft: 20 }}>{I18n.t('nhap_chieu_rong_kho_giay')}</Text>
                                    <TextInput returnKeyType='done' style={styles.textInputStyle} placeholder='58..80' placeholderTextColor="#808080" keyboardType="numbers-and-punctuation" onChangeText={text => setDefaultSize(text)}></TextInput>
                                    <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10 }} onPress={changePrintTypeKitchenA}>
                                        <View style={{ backgroundColor: colors.colorchinh, marginRight: 15, padding: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 5 }}>
                                            <Text style={[styles.styleTextBtnOk, {}]} >{I18n.t("dong_y")}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='none'
                        transparent={true}
                        visible={stateCurrentcy}
                        supportedOrientations={["portrait", "landscape"]}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setStateCurrentcy(false)
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
                            <View style={styles.styleViewModal} >
                                <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                    <Text style={styles.titleModal}>{I18n.t('don_vi_tien_te')}</Text>
                                    {
                                        Constant.CURRENTCY_UNIT && [Currentcy].concat(Constant.CURRENTCY_UNIT).map((item, index) => {
                                            return (
                                                <TouchableOpacity key={index.toString()} style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }} onPress={() => onSelectCurrentcy(item)}>
                                                    <RadioButton.Android
                                                        style={{ padding: 0, margin: 0 }}
                                                        color='#FF4500'
                                                        onPress={() => onSelectCurrentcy(item)}
                                                        status={currentcy == item.value ? 'checked' : 'unchecked'}
                                                    />
                                                    <Text style={{ marginLeft: 0 }}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={onChangeStateCurrentcy} >
                                            <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onSelectTypeCurrentcy}>
                                            <Text style={styles.styleTextBtnOk}>{I18n.t("dong_y")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='fade'
                        transparent={true}
                        visible={stateModalLAN}
                        supportedOrientations={['portrait', 'landscape']}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setStateModalLAN(false)
                                    setStateValueIp('192.168.99.')
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
                            <View style={styles.styleViewModal} >
                                <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                    <Text style={styles.titleModal}>{titlePrint}</Text>
                                    <Text style={{ fontSize: 18, justifyContent: 'center', marginTop: 10, marginLeft: 20 }}>{I18n.t('nhap_dia_chi_ip_may')}</Text>
                                    <TextInput returnKeyType='done' style={styles.textInputStyle} value={stateValueIp} keyboardType='numbers-and-punctuation' onChangeText={text => changeValueIp(text)} ></TextInput>
                                    <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10, }} onPress={setIpLANPrint}>
                                        <View style={{ backgroundColor: colors.colorchinh, marginRight: 15, padding: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 5 }}>
                                            <Text style={[styles.styleTextBtnOk, {}]} >{I18n.t("dong_y")}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='none'
                        transparent={true}
                        visible={modalStampPrint}
                        supportedOrientations={["portrait", "landscape"]}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setModalStampPrint(false)
                                    setStateValueIp('192.168.99.')
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
                            <View style={styles.styleViewModal} >
                                <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                    <Text style={styles.titleModal}>{I18n.t('chon_cong_nghe_in')}</Text>
                                    {
                                        Constant.STAMP_PRINTER && [PrintType].concat(Constant.STAMP_PRINTER).map((item, index) => {
                                            return (
                                                <TouchableOpacity key={index.toString()} style={{ flexDirection: "row", alignItems: "center" }} onPress={() => onSelectPrintType(item)}>
                                                    <RadioButton.Android
                                                        style={{ padding: 0, margin: 0 }}
                                                        color='#FF4500'
                                                        onPress={() => onSelectPrintType(item)}
                                                        status={defaultType == item.name ? 'checked' : 'unchecked'}
                                                    />
                                                    <Text style={{ marginLeft: 0 }}>{I18n.t(item.name)}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setModalStampPrint(false)} >
                                            <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={styles.styleTextBtnOk}>{I18n.t("dong_y")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='none'
                        transparent={true}
                        visible={modalStoreInfor}
                        supportedOrientations={["portrait", "landscape"]}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setModalStoreInfor(false)
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
                            <View style={styles.styleViewModal} >
                                <View style={{ width: Metrics.screenWidth * 0.7, height: Metrics.screenHeight * 0.7 }}>
                                    <Text style={styles.titleModal}>{I18n.t('thong_tin_cua_hang')}</Text>
                                    <StoreInformation code={inforStore.Code} name={inforStore.Name} address={inforStore.Address} phoneNumber={inforStore.Phone} />
                                    <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setModalStoreInfor(false)} >
                                            <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={styles.styleTextBtnOk}>{I18n.t("dong_y")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </View>
    )

}
const CurrencyUnit = (props) => {
    const onClickNumberCard = () => {
        props.onSetModalCurrency({ stt: true, currency: props.currencyUnit })
    }
    return (
        <TouchableOpacity onPress={onClickNumberCard}>
            <Text style={styles.textTitleItem}>{I18n.t('don_vi_tien_te')}</Text>
            <Text style={styles.textTitleItemHint}>{props.currencyUnit ? props.currencyUnit : 'đ'}</Text>
        </TouchableOpacity>
    )
}
const StoreInformation = (props) => {
    return (
        <ScrollView style={{ marginTop: 10 }} >
            <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <Text style={styles.textTitleItemHint}>{I18n.t('link_dang_nhap')}</Text>
                <Text style={{ fontSize: 16, marginLeft: 20, marginTop: 10 }}>https://{props.code}.pos365.vn</Text>
            </View>
            <ItemStoreInfor title={I18n.t('ten')} titleHint={props.name}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('dia_chi')} titleHint={props.address}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('so_dien_thoai')} titleHint={props.phoneNumber}></ItemStoreInfor>
            <Footer title={I18n.t('chan_trang')} titleHint={I18n.t('xin_cam_on_va_hen_gap_lai')}></Footer>
            <Footer title='Banner Ads1' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Banner Ads2' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Slideshow1' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Slideshow2' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Slideshow3' titleHint='https://www.pos365.vn/wp-content'></Footer>
        </ScrollView>
    )
}
const ItemStoreInfor = (props) => {
    return (
        <View style={{ flex: 1, marginTop: 15 }}>
            <Text style={styles.textTitleItemHint}>{props.title}</Text>
            <TextInput style={styles.textInputStyle} value={props.titleHint}></TextInput>
        </View>
    )
}
const Footer = (props) => {
    return (
        <View style={{ flex: 1, marginTop: 15 }}>
            <Text style={styles.textTitleItemHint}>{props.title}</Text>
            <TextInput style={{ height: 45, borderBottomWidth: 1, marginTop: 5, padding: 10, marginLeft: 20, marginRight: 20, fontSize: 16, color: 'silver' }} placeholder={props.titleHint} placeholderTextColor="#808080"></TextInput>
        </View>
    )
}
const styles = StyleSheet.create({
    textTitle: {
        fontSize: 16, color: colors.colorchinh, marginLeft: 20, marginTop: 10
    },
    textTitleItem: {
        flex: 6, fontSize: 16, marginLeft: 20, marginTop: 30
    },
    textTitleItemHint: {
        flex: 1, fontSize: 16, color: 'silver', marginLeft: 20
    },
    switchButton: {
        flex: 2,
    },
    viewLine: {
        height: 1, width: '100%', alignSelf: 'center', backgroundColor: 'silver', marginVertical: 10, marginTop: 10
    },
    styleButtonOK: {
        flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end", marginLeft: 10, marginRight: 20, marginBottom: 10
    },
    styleButtonHuy: {
        flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.colorchinh, borderRadius: 4, justifyContent: 'flex-start', paddingVertical: 10, paddingHorizontal: 20, marginLeft: 20, marginRight: 10, marginBottom: 10
    },
    styleViewModal: {
        alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff", borderRadius: 5,
    },
    titleModal: {
        fontSize: 18, fontWeight: "bold", textAlign: "center", paddingVertical: 10, color: colors.colorchinh
    },
    textInputStyle: {
        borderWidth: 0.5, marginTop: 10, padding: 10, marginLeft: 20, marginRight: 20, fontSize: 14, borderRadius: 5, color: "#000"
    },
    styleTextBtnHuy: { textAlign: "center", color: colors.colorchinh, fontSize: 14 },
    styleTextBtnOk: { textAlign: "center", color: "#fff", fontSize: 14 },
})