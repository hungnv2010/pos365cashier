import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Switch } from 'react-native';
import { View, Platform, Text, Image, StyleSheet, TouchableOpacity, Modal, TextInput, NativeModules, Keyboard } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n'
import MainToolBar from '../main/MainToolBar';
import SettingSwitch from '../settings/SettingSwitch';
import PrintConnect from '../settings/PrintConnect';
import { TouchableWithoutFeedback } from 'react-native';
import { Constant } from '../../common/Constant';
import { RadioButton } from 'react-native-paper'
import { Metrics, Images } from '../../theme';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { useFocusEffect } from '@react-navigation/native';
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService } from "../../data/services/HttpService";
import { ScreenList } from '../../common/ScreenList';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import colors from '../../theme/Colors';
//import { in } from 'react-native/Libraries/Animated/src/Easing';
import Permissions, { requestMultiple, PERMISSIONS } from 'react-native-permissions';
const { Print } = NativeModules;
import moment from 'moment';
import 'moment/min/locales'
import DeviceInfo from 'react-native-device-info';
import DialogSettingPrinter from '../../components/dialog/DialogSettingPrinter'
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
import IonIcon from 'react-native-vector-icons/Ionicons'

export const DefaultSetting = {
    am_bao_thanh_toan: true,
    Printer: [
        {
            key: Constant.KEY_PRINTER.CashierKey,
            title: 'may_in_thu_ngan',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.KitchenAKey,
            title: 'may_in_bao_bep_a',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.KitchenBKey,
            title: 'may_in_bao_bep_b',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.KitchenCKey,
            title: 'may_in_bao_bep_c',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.KitchenDKey,
            title: 'may_in_bao_bep_d',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.BartenderAKey,
            title: 'may_in_bao_pha_che_a',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.BartenderBKey,
            title: 'may_in_bao_pha_che_b',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.BartenderCKey,
            title: 'may_in_bao_pha_che_c',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.BartenderDKey,
            title: 'may_in_bao_pha_che_d',
            type: '',
            size: '',
            ip: '',
            show: true
        },
        {
            key: Constant.KEY_PRINTER.StampPrintKey,
            title: 'may_in_tem',
            type: '',
            size: '',
            ip: '',
            show: true
        },
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
    const { printerObject, isFNB, orientaition, deviceType } = useSelector(state => {
        return state.Common
    });
    const [settingObject, setSettingObject] = useState(DefaultSetting)
    const [inforStore, setInforStore] = useState({})
    const [marginModal, setMargin] = useState(0)
    const [objTitle, setObjTitle] = useState({ isSettingPayment: true })
    const [language, setLanguage] = useState("vi");

    useFocusEffect(useCallback(() => {
        const getSetting = async () => {

            let data = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (data != "") {
                data = JSON.parse(data);
                console.log("getSetting isFNB ", isFNB);
                data.Printer.forEach(element => {
                    if (isFNB || element.key == Constant.KEY_PRINTER.CashierKey || element.key == Constant.KEY_PRINTER.StampPrintKey) {
                        element.show = true;
                    } else {
                        element.show = false;
                    }
                });
                console.log("getSetting data.Printer ", data.Printer);

                if (data.Printer.filter(item => item.key == Constant.KEY_PRINTER.StampPrintKey).length < 1) {
                    setSettingObject({
                        ...data, Printer: [...data.Printer, {
                            key: Constant.KEY_PRINTER.StampPrintKey,
                            title: 'may_in_tem',
                            type: '',
                            size: '',
                            ip: '',
                            show: true
                        }]
                    })
                } else
                    setSettingObject({ ...data })


            } else {
                DefaultSetting.Printer.forEach(element => {
                    if (isFNB || element.key == Constant.KEY_PRINTER.CashierKey) {
                        element.show = true;
                    } else {
                        element.show = false;
                    }
                });
                console.log("{ ...data, Printer: printer }2 ", { ...DefaultSetting, Printer: printer });
                setSettingObject({ ...DefaultSetting })
            }
        }

        getSetting()

        const setupLanguage = async () => {
            let lang = await getFileDuLieuString(Constant.LANGUAGE, true);
            console.log('lang ===  ', lang);
            if (lang && lang != "") {
                setLanguage(lang)
            } else {
                setLanguage('vi');
            }
        }

        setupLanguage()

    }, []))

    // useFocusEffect(
    //     React.useCallback(() => {

    //     }, [])
    // );

    useEffect(() => {
        console.log("setting object", settingObject);
    }, [settingObject])
    useFocusEffect(useCallback(() => {
        getCurentRetailer()

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

    const getCurentRetailer = async () => {
        let res = await new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET()
        setInforStore(res.CurrentRetailer)
    }

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
                    Print.keepTheScreenOn("")
                else
                    Print.keepTheScreenOff("")
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
        console.log("printer setting", settingObject.Printer[data.index]);
        setPrintertmp(settingObject.Printer[data.index])

    }

    const compare = (a, b) => {
        if (a === b) {
            return 0;
        }

        var a_components = a.split(".");
        var b_components = b.split(".");

        var len = Math.min(a_components.length, b_components.length);

        // loop while the components are equal
        for (var i = 0; i < len; i++) {
            // A bigger than B
            if (parseInt(a_components[i]) > parseInt(b_components[i])) {
                return 1;
            }

            // B bigger than A
            if (parseInt(a_components[i]) < parseInt(b_components[i])) {
                return -1;
            }
        }

        // If one's a prefix of the other, the longer one is greater.
        if (a_components.length > b_components.length) {
            return 1;
        }

        if (a_components.length < b_components.length) {
            return -1;
        }

        // Otherwise they are the same.
        return 0;
    }

    const outputSetPrinter = (data) => {
        setShowModal(false)
        console.log("outputSetPrinter data ", data);
        DeviceInfo.getSystemVersion().then(systemVersion => {
            console.log("systemVersion ", systemVersion);
            console.log("systemVersion compare = ", compare(systemVersion, "14"));
            if (compare(systemVersion, "14") == 1) {
                Print.requestLocalNetwork(data.ip)
            }
        });
        settingObject.Printer[positionPrint] = data
        savePrint({ ...settingObject })
        savePrintRedux(settingObject.Printer)
    }
    const savePrint = (object) => {
        setSettingObject(object)
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify(object))
    }
    const [showModalSize, setStateMoalSize] = useState(false)
    const onShowModalSize = () => {
        console.log(defaultType)
        if (defaultType == 'khong_in' || defaultType == '') {
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
    // const changePrintTypeKitchenA = () => {
    //     setStateMoalSize(false)
    //     if (defaultType == 'in_qua_mang_lan') {
    //         setStateModalLAN(!stateModalLAN)
    //     } else {
    //         settingObject.Printer[positionPrint] = { ...settingObject.Printer[positionPrint], type: defaultType, size: defaultSize, ip: '' }
    //         savePrint({ ...settingObject })
    //         savePrintRedux(settingObject.Printer)
    //     }
    // }
    // const setIpLANPrint = () => {
    //     setStateValueIp('192.168.99.')
    //     settingObject.Printer[positionPrint] = { ...settingObject.Printer[positionPrint], type: defaultType, size: defaultSize, ip: defaultIpLAN }
    //     savePrint({ ...settingObject })
    //     savePrintRedux(settingObject.Printer)
    //     setStateModalLAN(!stateModalLAN)
    // }
    // const [stateValueIp, setStateValueIp] = useState('192.168.99.')
    // const changeValueIp = (a) => {
    //     setStateValueIp(a)
    //     setDefaultIpLAN(a)
    // }
    const [modalStampPrint, setModalStampPrint] = useState(false)
    const [printerTmp, setPrintertmp] = useState({})
    const onShowModalStampPrint = (data) => {
        setPositionPrint(data.index)
        setDefautlType(settingObject.Printer[data.index].type)

        setModalStampPrint(data.stt)
        setTitlePrint(data.title)
    }
    const [titlePrint, setTitlePrint] = useState('')
    const [defaultType, setDefautlType] = useState('')
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
    const vendor = useRef({ Name: inforStore.Name, Address: inforStore.Address, Phone: inforStore.Phone })

    const outPut = (data) => {
        vendor.current = data
    }
    useEffect(() => {
        console.log("vendor", vendor.current);
    }, [vendor.current])
    const onClickOk = () => {
        let param = {
            Vendor: {
                Address: vendor.current.Address ? vendor.current.Address : inforStore.Address,
                Code: inforStore.Code,
                ExpiryDate: inforStore.ExpiryDate,
                FieldId: inforStore.FieldId,
                Id: inforStore.Id,
                LatestClearData: inforStore.LatestClearData,
                Logo: inforStore.Logo,
                Name: vendor.current.Name ? vendor.current.Name : inforStore.Name,
                Phone: vendor.current.Phone ? vendor.current.Phone : inforStore.Phone,
                Province: inforStore.Province,
                Status: inforStore.Status,
                TelephoneOfShopkeepers: inforStore.TelephoneOfShopkeepers,
                URL: "https://" + inforStore.Code + ".pos365.vn",
            }
        }
        new HTTPService().setPath(ApiPath.VENDOR).POST(param).then((res) => {
            console.log("mess", res);

        }).catch((e) => {
            console.log("error del", e);
        })
        setModalStoreInfor(false)
        getCurentRetailer()

    }

    const onSelectLanguage = (lang) => {
        // dispatch({ type: 'LANGUAGE', lang: lang })
        // props.onChangeLang(lang);
        I18n.locale = lang;
        moment.locale(lang)
        setLanguage(lang)
        setFileLuuDuLieu(Constant.LANGUAGE, lang);
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('setting')}
                outPutTextSearch={() => { }}
            />
            <View style={{ flexDirection: 'row', flex: 1 }}>
                {orientaition == Constant.LANDSCAPE ?
                    <View style={{ flex: 0.5, backgroundColor: '#fff', margin: 2 }}>
                        <TouchableOpacity style={styles.styleBtnGroupSetting} onPress={() => setObjTitle({ isSettingPayment: true })}>
                            <IconMaterial name={"qrcode"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingPayment == true ? colors.colorchinh : '#4a4a4a'} />
                            <Text style={[styles.styleTitleGroup, { color: objTitle.isSettingPayment == true ? colors.colorchinh : '#4a4a4a' }]}>{I18n.t('thiet_lap_thanh_toan')}</Text>
                            <Icon name={"navigate-next"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingPayment == true ? colors.colorchinh : '#4a4a4a'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.styleBtnGroupSetting} onPress={() => setObjTitle({ isSettingNofi: true })}>
                            <Icon name={"notifications"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingNofi == true ? colors.colorchinh : '#4a4a4a'} />
                            <Text style={[styles.styleTitleGroup, { color: objTitle.isSettingNofi == true ? colors.colorchinh : '#4a4a4a' }]}>{I18n.t('thong_bao')}</Text>
                            <Icon name={"navigate-next"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingNofi == true ? colors.colorchinh : '#4a4a4a'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.styleBtnGroupSetting} onPress={() => setObjTitle({ isSettingConnectPr: true })}>
                            <IconMaterial name={"printer-settings"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingConnectPr == true ? colors.colorchinh : '#4a4a4a'} />
                            <Text style={[styles.styleTitleGroup, { color: objTitle.isSettingConnectPr == true ? colors.colorchinh : '#4a4a4a' }]}>{I18n.t('ket_noi_may_in')}</Text>
                            <Icon name={"navigate-next"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingConnectPr == true ? colors.colorchinh : '#4a4a4a'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.styleBtnGroupSetting} onPress={() => setObjTitle({ isSettingPrinter: true })}>
                            <Icon name={"print"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingPrinter == true ? colors.colorchinh : '#4a4a4a'} />
                            <Text style={[styles.styleTitleGroup, { color: objTitle.isSettingPrinter == true ? colors.colorchinh : '#4a4a4a' }]}>{I18n.t('cai_dat_may_in')}</Text>
                            <Icon name={"navigate-next"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingPrinter == true ? colors.colorchinh : '#4a4a4a'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.styleBtnGroupSetting} onPress={() => setObjTitle({ isSettingFeature: true })}>
                            <IonIcon name={"ios-options"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingFeature == true ? colors.colorchinh : '#4a4a4a'} />
                            <Text style={[styles.styleTitleGroup, { color: objTitle.isSettingFeature == true ? colors.colorchinh : '#4a4a4a' }]}>{I18n.t('thiet_lap_tinh_nang')}</Text>
                            <Icon name={"navigate-next"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingFeature == true ? colors.colorchinh : '#4a4a4a'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.styleBtnGroupSetting} onPress={() => setObjTitle({ isSettingSystem: true })}>
                            <Icon name={"settings-applications"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingSystem == true ? colors.colorchinh : '#4a4a4a'} />
                            <Text style={[styles.styleTitleGroup, { color: objTitle.isSettingSystem == true ? colors.colorchinh : '#4a4a4a' }]}>{I18n.t('thiet_lap_he_thong')}</Text>
                            <Icon name={"navigate-next"} size={24} style={{ paddingHorizontal: 15, flex: 1 }} color={objTitle.isSettingSystem == true ? colors.colorchinh : '#4a4a4a'} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity>
                            <Text>{I18n.t('thiet_lap_diem_thuong')}</Text>
                        </TouchableOpacity> */}


                    </View>
                    : null}
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ marginBottom: 1 }} keyboardShouldPersistTaps="handled">
                        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff', margin: 2 }}>
                            {orientaition == Constant.PORTRAIT || orientaition == Constant.LANDSCAPE && objTitle.isSettingPayment == true ?
                                <TouchableOpacity onPress={() => screenSwitch(ScreenList.VNPayPaymentSetting, settingObject)} style={{ paddingVertical: 15, borderBottomWidth: 0.5, borderColor: '#f2f2f2' }}>
                                    <Text style={[styles.textTitleItem, { marginTop: 0 }]}>{I18n.t("thiet_lap_thanh_toan_vnpay")}</Text>
                                </TouchableOpacity>
                                : null
                            }
                            {/* <View style={styles.viewLine}></View> */}
                            {orientaition == Constant.PORTRAIT || orientaition == Constant.LANDSCAPE && objTitle.isSettingNofi == true ?
                                <View style={{ paddingVertical: 15, marginVertical: 2, borderBottomWidth: 0.5, borderColor: '#f2f2f2' }}>
                                    <Text style={styles.textTitle}>{I18n.t("thong_bao")}</Text>
                                    <SettingSwitch
                                        title={"am_bao_thanh_toan"} output={onSwitchTone} isStatus={settingObject.am_bao_thanh_toan}
                                    />
                                </View> : null
                            }
                            {/* <View style={styles.viewLine}>
                        </View> */}
                            {orientaition == Constant.PORTRAIT || orientaition == Constant.LANDSCAPE && objTitle.isSettingConnectPr == true ?
                                <View style={{ paddingVertical: 15, marginVertical: 2, borderBottomWidth: 0.5, borderColor: '#f2f2f2' }}>
                                    <Text style={styles.textTitle}>Print Connect</Text>
                                    {
                                        settingObject.Printer && settingObject.Printer.length > 0 ?
                                            settingObject.Printer.map((item, index) => {
                                                if (item.show)
                                                    return (
                                                        <PrintConnect key={index.toString()} title={I18n.t(item.title)} onSet={onShowModal} stylePrinter={(item.type ? I18n.t(item.type) : I18n.t('khong_in')) + (item.size ? ', size ' + item.size + ' mm ' : '') + (item.ip ? '(' + item.ip + ')' : '')} pos={index} status={showModal} />
                                                    )
                                            })
                                            : null
                                    }
                                </View>
                                : null}
                            {/* <View style={styles.viewLine}></View> */}
                            {orientaition == Constant.PORTRAIT || orientaition == Constant.LANDSCAPE && objTitle.isSettingPrinter == true ?
                                <View style={{ paddingVertical: 15, marginVertical: 2, borderBottomWidth: 0.5, borderColor: '#f2f2f2' }}>
                                    <Text style={styles.textTitle}>Print Setup</Text>
                                    <TouchableOpacity onPress={onShowModalStoreInfor}>
                                        <Text style={styles.textTitleItem}>{I18n.t("thong_tin_cua_hang")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => screenSwitch(ScreenList.PrintHtml)}>
                                        <Text style={styles.textTitleItem}>{I18n.t("thiet_lap_mau_in")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => screenSwitch(ScreenList.SetupTemp)}>
                                        <Text style={styles.textTitleItem}>{I18n.t("thiet_lap_mau_tem")}</Text>
                                    </TouchableOpacity>
                                    {isFNB ?
                                        <SettingSwitch title={"tu_dong_in_bao_bep"} output={onSwitchTone} isStatus={settingObject.tu_dong_in_bao_bep} />
                                        : null
                                    }
                                    <SettingSwitch title={"in_sau_khi_thanh_toan"} output={onSwitchTone} isStatus={settingObject.in_sau_khi_thanh_toan} />
                                    <SettingSwitch title={"in_hai_lien_cho_hoa_don"} output={onSwitchTone} isStatus={settingObject.in_hai_lien_cho_hoa_don} />
                                    {isFNB ?
                                        <SettingSwitch title={"in_hai_lien_cho_che_bien"} output={onSwitchTone} isStatus={settingObject.in_hai_lien_cho_che_bien} />
                                        : null}
                                    <SettingSwitch title={"in_tam_tinh"} output={onSwitchTone} isStatus={settingObject.in_tam_tinh} />
                                    <SettingSwitch title={"in_tem_truoc_thanh_toan"} output={onSwitchTone} isStatus={settingObject.in_tem_truoc_thanh_toan} />
                                    {/* <SettingSwitch title={"bao_che_bien_sau_thanh_toan"} output={onSwitchTone} isStatus={settingObject.bao_che_bien_sau_thanh_toan} /> */}
                                </View> : null}

                            {/* <View style={styles.viewLine}></View> */}
                            {orientaition == Constant.PORTRAIT || orientaition == Constant.LANDSCAPE && objTitle.isSettingFeature == true ?
                                <View style={{ paddingVertical: 15, marginVertical: 2, borderBottomWidth: 0.5, borderColor: '#f2f2f2' }}>
                                    <Text style={styles.textTitle}>{I18n.t("thiet_lap_tinh_nang")}</Text>
                                    <SettingSwitch title={"cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang"} output={onSwitchTone} isStatus={settingObject.cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang} />
                                    <SettingSwitch title={"cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang"} output={onSwitchTone} isStatus={settingObject.cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang} />
                                    <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => { props.navigation.navigate(ScreenList.SettingCashierScreen, {}) }}>
                                        <Text style={styles.textTitleItem}>{I18n.t("cai_dat_man_hinh_chon_san_pham")}</Text>
                                    </TouchableOpacity>
                                    {/* <SettingSwitch title={"khong_cho_phep_ban_hang_khi_het_ton_kho"} output={onSwitchTone} isStatus={settingObject.khong_cho_phep_ban_hang_khi_het_ton_kho} />
                        <SettingSwitch title={"mo_cashbox_sau_khi_thanh_toan"} output={onSwitchTone} isStatus={settingObject.mo_cashbox_sau_khi_thanh_toan} />
                        <SettingSwitch title={"nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly"} output={onSwitchTone} isStatus={settingObject.nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly} /> */}
                                </View> : null}
                            {/* <View style={styles.viewLine}></View> */}
                            {orientaition == Constant.PORTRAIT || orientaition == Constant.LANDSCAPE && objTitle.isSettingSystem == true ?
                                <View style={{ paddingVertical: 15, marginVertical: 2, borderBottomWidth: 0.5, borderColor: '#f2f2f2' }}>
                                    <Text style={styles.textTitle}>{I18n.t("thiet_lap_he_thong")}</Text>
                                    <SettingSwitch title={"giu_man_hinh_luon_sang"} output={onSwitchTone} isStatus={settingObject.giu_man_hinh_luon_sang} />
                                    <CurrencyUnit onSetModalCurrency={funSetModalCurrentcy} currencyUnit={settingObject.CurrencyUnit} />

                                    <View style={{ borderBottomWidth: 0.5, padding: 20, borderBottomColor: "#ddd", flexDirection: "column", }}>
                                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <Text style={{ marginTop: 0 }}>{I18n.t('ngon_ngu')}: <Text style={{ color: colors.colorLightBlue }}>{language == 'vi' ? I18n.t('tieng_viet') : I18n.t('tieng_anh')}</Text> </Text>
                                        </TouchableOpacity>

                                        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
                                            <TouchableOpacity onPress={() => onSelectLanguage('vi')} style={{ flexDirection: "row", alignItems: "center", marginLeft: -10 }}>
                                                <RadioButton.Android
                                                    style={{}}
                                                    color={colors.colorchinh}
                                                    status={language == 'vi' ? 'checked' : 'unchecked'}
                                                    onPress={() => onSelectLanguage('vi')}
                                                />
                                                <Image source={Images.icon_viet_nam} style={{ width: 30, height: 20, marginRight: 10 }} />
                                                <Text>{I18n.t('tieng_viet')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => onSelectLanguage('en')} style={{ flexDirection: "row", alignItems: "center", marginLeft: -10 }}>
                                                <RadioButton.Android
                                                    style={{}}
                                                    color={colors.colorchinh}
                                                    status={language != 'vi' ? 'checked' : 'unchecked'}
                                                    onPress={() => onSelectLanguage('en')}
                                                />
                                                <Image source={Images.icon_english} style={{ width: 30, height: 20, marginRight: 10 }} />
                                                <Text>{I18n.t('tieng_anh')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View> : null}

                            {/* <View style={styles.viewLine}></View> */}
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
                                    <View style={[styles.styleViewModal, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]} >
                                        <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                            {/* <Text style={styles.titleModal}>{I18n.t('chon_cong_nghe_in')}</Text>
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
                                    } */}
                                            <DialogSettingPrinter title={printerTmp.title} printer={printerTmp} outputPrinter={outputSetPrinter} />
                                            {/* <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setShowModal(false)} >
                                            <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={styles.styleTextBtnOk}>{I18n.t("dong_y")}</Text>
                                        </TouchableOpacity>
                                    </View> */}
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                            {/* <Modal animationType='fade'
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
                            <View style={[styles.styleViewModal, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]} >
                                <View style={{ width: Metrics.screenWidth * 0.8, }}>
                                    <Text style={styles.titleModal}>{I18n.t('thong_tin_cua_hang')}</Text>
                                    <Text style={{ fontSize: 18, justifyContent: 'center', marginTop: 10, marginLeft: 20 }}>{I18n.t('nhap_chieu_rong_kho_giay')}</Text>
                                    <TextInput returnKeyType='done' style={styles.textInputStyle} placeholder='58..80' placeholderTextColor="#808080" keyboardType="numbers-and-punctuation" onChangeText={text => setDefaultSize(parseInt(text) > 80 ? '80' : parseInt(text) < 58 ? '58' : text)}></TextInput>
                                    <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10 }} onPress={changePrintTypeKitchenA}>
                                        <View style={{ backgroundColor: colors.colorchinh, marginRight: 15, padding: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 5 }}>
                                            <Text style={[styles.styleTextBtnOk, {}]} >{I18n.t("dong_y")}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal> */}
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
                            {/* <Modal animationType='fade'
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
                            <View style={[styles.styleViewModal, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]} >
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
                    </Modal> */}
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
                                    <View style={[styles.styleViewModal, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]} >
                                        <View style={{ width: Metrics.screenWidth * 0.7 }}>
                                            <Text style={styles.titleModal}>{I18n.t('thong_tin_cua_hang')}</Text>
                                            <StoreInformation code={inforStore.Code} name={inforStore.Name} address={inforStore.Address} phoneNumber={inforStore.Phone} outPut={outPut} />
                                            <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                                <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setModalStoreInfor(false)} >
                                                    <Text style={styles.styleTextBtnHuy}>{I18n.t("huy")}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.styleButtonOK} onPress={onClickOk}>
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
            </View>
        </View >
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
    const vendor = useRef({})
    const getdata = (data) => {
        if (data.title == I18n.t('ten')) {
            vendor.current.Name = data.value
        } else if (data.title == I18n.t('dia_chi')) {
            vendor.current.Address = data.value
        } else {
            vendor.current.Phone = data.value
        }
    }
    useEffect(() => {
        props.outPut(vendor.current)
    }, [])

    return (
        <ScrollView style={{ marginTop: 10 }} >
            <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <Text style={styles.textTitleItemHint}>{I18n.t('link_dang_nhap')}</Text>
                <Text style={{ fontSize: 16, marginLeft: 20, marginTop: 10 }}>https://{props.code}.pos365.vn</Text>
            </View>
            <ItemStoreInfor title={I18n.t('ten')} titleHint={props.name} output={getdata}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('dia_chi')} titleHint={props.address} output={getdata}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('so_dien_thoai')} titleHint={props.phoneNumber} output={getdata}></ItemStoreInfor>
            <Footer title={I18n.t('chan_trang')} titleHint={I18n.t('xin_cam_on_va_hen_gap_lai')}></Footer>
            {/* <Footer title='Banner Ads1' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Banner Ads2' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Slideshow1' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Slideshow2' titleHint='https://www.pos365.vn/wp-content'></Footer>
            <Footer title='Slideshow3' titleHint='https://www.pos365.vn/wp-content'></Footer> */}
        </ScrollView>
    )
}
const ItemStoreInfor = (props) => {
    const [titleHint, setTitleHint] = useState(props.titleHint)
    const sendInput = (text) => {
        props.output({ title: props.title, value: text })
    }
    return (
        <View style={{ flex: 1, marginTop: 15 }}>
            <Text style={styles.textTitleItemHint}>{props.title}</Text>
            <TextInput style={styles.textInputStyle} value={titleHint} placeholderTextColor={'#4a4a4a'} onChangeText={text => { sendInput(text), setTitleHint(text) }}></TextInput>
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
        flex: 1, fontSize: 16, color: '#4a4a4a', marginLeft: 20,
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
        fontSize: 16, fontWeight: "bold", textAlign: "center", paddingVertical: 10, color: colors.colorchinh
    },
    textInputStyle: {
        borderWidth: 0.5, marginTop: 10, padding: 10, marginLeft: 20, marginRight: 20, fontSize: 14, borderRadius: 5, color: "#000"
    },
    styleTextBtnHuy: { textAlign: "center", color: colors.colorchinh, fontSize: 14 },
    styleTextBtnOk: { textAlign: "center", color: "#fff", fontSize: 14 },
    styleBtnGroupSetting: { paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    styleTitleGroup:{
        fontSize: 14, fontWeight: "bold", textAlign: "center", paddingVertical: 10, textTransform: 'uppercase', flex: 8
    }
})