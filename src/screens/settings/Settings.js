import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Switch } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
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


export default (props) => {
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
    const DefaultSetting = {
        am_bao_thanh_toan: true,
        Printer: [
            {
                key:Constant.KEY_PRINTER.CashierKey,
                title: 'may_in_thu_ngan',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.KitchenAKey,
                title: 'may_in_bao_bep_a',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.KitchenBKey,
                title: 'may_in_bao_bep_b',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.KitchenCKey,
                title: 'may_in_bao_bep_c',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.KitchenDKey,
                title: 'may_in_bao_bep_d',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.BartenderAKey,
                title: 'may_in_bao_pha_che_a',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.BartenderBKey,
                title: 'may_in_bao_pha_che_b',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.BartenderCKey,
                title: 'may_in_bao_pha_che_c',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.BartenderDKey,
                title: 'may_in_bao_pha_che_d',
                type: '',
                size: '',
                ip: ''
            },
            {
                key:Constant.KEY_PRINTER.StampPrintKey,
                title: 'may_in_tem',
                type: '',
                size: '',
                ip: ''
            },
        ],
        InfoStore: '',
        HtmlPrint: '',
        TempPrint: '',
        tu_dong_in_bao_bep: true,
        in_sau_khi_thanh_toan: false,
        in_hai_lien_cho_hoa_don: false,
        in_hai_lien_cho_che_bien: false,
        in_tam_tinh: false,
        in_tem_truoc_thanh_toan: false,
        bao_che_bien_sau_thanh_toan: false,
        NumberCard: 0,
        cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang: false,
        cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang: false,
        khong_cho_phep_ban_hang_khi_het_ton_kho: false,
        mo_cashbox_sau_khi_thanh_toan: false,
        nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly: false,
        su_dung_hai_man_hinh: false,
        hien_thanh_dieu_huong: true,
        giu_man_hinh_luon_sang: false,
        CurrencyUnit: 'đ',
    }
    const [settingObject, setSettingObject] = useState(DefaultSetting)
    useFocusEffect(useCallback(() => {
        const getSetting = async () => {
            let data = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            let res = await new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET()
            console.log("setting res",res.Settings);
            if (data.length == 0) {
                setSettingObject(DefaultSetting)
                console.log("setting", JSON.stringify(settingObject))
            } else {
                setSettingObject(JSON.parse(data))
                setSettingObject({...settingObject,strings:JSON.parse(res.Settings)})
            }
        }
        getSetting()
    }, []))
    useEffect(() => {
        console.log("useEfect settingObject", settingObject.Printer)
    }, [settingObject])
    const saveState = (object) => {
        console.log("object", object)
        setSettingObject(object)
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify(object))
    }
    const onSwitchTone = (data) => {
        switch (data.title) {
            case 'am_bao_thanh_toan':
                saveState({ ...settingObject, am_bao_thanh_toan: data.stt})
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
                saveState({ ...settingObject, in_tam_tinh: data.stt, strings:{...settingObject.strings,AllowPrintPreview:data.stt}})
                break
            case 'in_tem_truoc_thanh_toan':
                saveState({ ...settingObject, in_tem_truoc_thanh_toan: data.stt })
                break
            case 'bao_che_bien_sau_thanh_toan':
                saveState({ ...settingObject, bao_che_bien_sau_thanh_toan: data.stt ,strings:{...settingObject.strings, PrintKitchenAfterSave:settingObject.bao_che_bien_sau_thanh_toan }})
                break
            case 'cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang':
                saveState({ ...settingObject, cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang: data.stt })
                break
            case 'cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang':
                saveState({ ...settingObject, cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang: data.stt,strings:{...settingObject.strings,AllowChangePrice:settingObject.cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang }})
                break
            case 'khong_cho_phep_ban_hang_khi_het_ton_kho':
                saveState({ ...settingObject, khong_cho_phep_ban_hang_khi_het_ton_kho: data.stt,strings:{...settingObject.strings, StockControlWhenSelling:settingObject.khong_cho_phep_ban_hang_khi_het_ton_kho}})
                break
            case 'mo_cashbox_sau_khi_thanh_toan':
                saveState({ ...settingObject, mo_cashbox_sau_khi_thanh_toan: data.stt })
                break
            case 'nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly':
                saveState({ ...settingObject, nhan_tin_nhan_thong_bao_tu_phuc_vu_quan_ly: data.stt })
                break
            case 'su_dung_hai_man_hinh':
                saveState({ ...settingObject, su_dung_hai_man_hinh: data.stt })
                break
            case 'hien_thanh_dieu_huong':
                saveState({ ...settingObject, hien_thanh_dieu_huong: data.stt })
                break
            case 'giu_man_hinh_luon_sang':
                saveState({ ...settingObject, giu_man_hinh_luon_sang: data.stt  })
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
    const [cardNumber, setCardNumber] = useState(0)
    const [numberState, setNumberState] = useState(0)
    const onChangeCardNumber = (number) => {
        saveState({ ...settingObject, NumberCard: number })
        setNumberState(0)
        setStateModalNumberCard(!stateModalNumberCard)
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
        }
    }
    const setIpLANPrint = () => {
        setStateValueIp('192.168.99.')
        settingObject.Printer[positionPrint] = { ...settingObject.Printer[positionPrint], type: defaultType, size: defaultSize, ip: defaultIpLAN }
        savePrint({ ...settingObject })
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

    const screenSwitch = (nameFun,pr)=>{
        let params = pr
        props.navigation.navigate(nameFun,params)
        props.navigation.closeDrawer();
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
            <ScrollView style={{ marginBottom: 30 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <TouchableOpacity onPress={()=>screenSwitch(ScreenList.VNPayPaymentSetting,settingObject)}>
                        <Text style={styles.textTitleItem}>{I18n.t("thiet_lap_thanh_toan_vnpay")}</Text>
                    </TouchableOpacity>
                    <View style={styles.viewLine}></View>

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
                                    <PrintConnect title={I18n.t(item.title)} onSet={index == 9 ? onShowModalStampPrint : onShowModal} stylePrinter={(item.type?I18n.t(item.type):I18n.t('khong_in')) + (item.size ? ', size ' + item.size + ' mm ' : '') + (item.ip ? '(' + item.ip + ')' : '')} pos={index} status={showModal} />
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
                        <TouchableOpacity onPress={()=>screenSwitch(ScreenList.PrintHtml)}>
                            <Text style={styles.textTitleItem}>HTML print</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>screenSwitch(ScreenList.PrintWebview)}>
                            <Text style={styles.textTitleItem}>Temp print</Text>
                        </TouchableOpacity>
                        <SettingSwitch title={"tu_dong_in_bao_bep"} output={onSwitchTone} isStatus={settingObject.tu_dong_in_bao_bep} />
                        <SettingSwitch title={"in_sau_khi_thanh_toan"} output={onSwitchTone} isStatus={settingObject.in_sau_khi_thanh_toan} />
                        <SettingSwitch title={"in_hai_lien_cho_hoa_don"} output={onSwitchTone} isStatus={settingObject.in_hai_lien_cho_hoa_don} />
                        <SettingSwitch title={"in_hai_lien_cho_che_bien"} output={onSwitchTone} isStatus={settingObject.in_hai_lien_cho_che_bien} />
                        <SettingSwitch title={"in_tam_tinh"} output={onSwitchTone} isStatus={settingObject.in_tam_tinh} />
                        <SettingSwitch title={"in_tem_truoc_thanh_toan"} output={onSwitchTone} isStatus={settingObject.in_tem_truoc_thanh_toan} />
                        <SettingSwitch title={"bao_che_bien_sau_thanh_toan"} output={onSwitchTone} isStatus={settingObject.bao_che_bien_sau_thanh_toan} />
                        <CardNumber onSetModal={funSetStateModal} number={settingObject.NumberCard} />
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
                        <SettingSwitch title={"su_dung_hai_man_hinh"} output={onSwitchTone} isStatus={settingObject.su_dung_hai_man_hinh} />
                        <SettingSwitch title={"hien_thanh_dieu_huong"} output={onSwitchTone} isStatus={settingObject.hien_thanh_dieu_huong} />
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
                                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => onSelectPrintType(item)}>
                                                    <RadioButton.Android
                                                        style={{ padding: 0, margin: 0 }}
                                                        color='orangered'
                                                        onPress={() => onSelectPrintType(item)}
                                                        status={(defaultType?defaultType:'khong_in') == item.name ? 'checked' : 'unchecked'}
                                                    />
                                                    <Text style={{ marginLeft: 0 }}>{I18n.t(item.name)}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setShowModal(false)} >
                                            <Text style={{ textAlign: "center", color: "orangered" }}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={{ textAlign: "center", color: "#fff" }}>{I18n.t("dong_y")}</Text>
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
                                    <Text style={{ fontSize: 18, justifyContent: 'center', marginTop: 10 }}>{I18n.t('nhap_chieu_rong_kho_giay')}</Text>
                                    <TextInput style={styles.textInputStyle} placeholder='58..80' keyboardType='numeric' onChangeText={text => setDefaultSize(text)}></TextInput>
                                    <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10 }} onPress={changePrintTypeKitchenA}>
                                        <Text style={{ textAlign: 'center', color: '#FF6600' }} >{I18n.t("dong_y")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='fade'
                        transparent={true}
                        visible={stateModalNumberCard}
                        supportedOrientations={['portrait', 'landscape']}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    setStateModalNumberCard(false)
                                    setCardNumber(cardNumber)
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
                                    <Text style={styles.titleModal}>{I18n.t('cai_dat_the_cung')}</Text>
                                    <Text style={{ fontSize: 18, justifyContent: 'center', marginTop: 10 }}>{I18n.t('nhap_so_luong_the')}</Text>
                                    <TextInput style={styles.textInputStyle} placeholder='00~99' keyboardType='numeric' onChangeText={text => setNumberState(text)}></TextInput>
                                    <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10 }} onPress={() => onChangeCardNumber(numberState)}>
                                        <Text style={{ textAlign: 'center', color: '#FF6600' }} >{I18n.t("dong_y")}</Text>
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
                                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => onSelectCurrentcy(item)}>
                                                    <RadioButton.Android
                                                        style={{ padding: 0, margin: 0 }}
                                                        color='orangered'
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
                                            <Text style={{ textAlign: "center", color: "orangered" }}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onSelectTypeCurrentcy}>
                                            <Text style={{ textAlign: "center", color: "#fff" }}>{I18n.t("dong_y")}</Text>
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
                                    <Text style={{ fontSize: 18, justifyContent: 'center', marginTop: 10 }}>{I18n.t('nhap_dia_chi_ip_may')}</Text>
                                    <TextInput style={styles.textInputStyle} value={stateValueIp} keyboardType='phone-pad' onChangeText={text => changeValueIp(text)} ></TextInput>
                                    <TouchableOpacity style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10, marginBottom: 10 }} onPress={setIpLANPrint}>
                                        <Text style={{ textAlign: 'center', color: '#FF6600' }} >{I18n.t("dong_y")}</Text>
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
                                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => onSelectPrintType(item)}>
                                                    <RadioButton.Android
                                                        style={{ padding: 0, margin: 0 }}
                                                        color='orangered'
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
                                            <Text style={{ textAlign: "center", color: "orangered" }}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={{ textAlign: "center", color: "#fff" }}>{I18n.t("dong_y")}</Text>
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
                                <View style={{ width: Metrics.screenWidth * 0.8, height: Metrics.screenHeight * 0.85 }}>
                                    <Text style={styles.textTitle}>{I18n.t('thong_tin_cua_hang')}</Text>
                                    <StoreInformation />
                                    <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                                        <TouchableOpacity style={styles.styleButtonHuy} onPress={() => setModalStoreInfor(false)} >
                                            <Text style={{ textAlign: "center", color: "orangered" }}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButtonOK} onPress={onShowModalSize}>
                                            <Text style={{ textAlign: "center", color: "#fff" }}>{I18n.t("dong_y")}</Text>
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
const CardNumber = (props) => {
    const onCLickNumberCard = () => {
        props.onSetModal(true)
    }
    return (
        <TouchableOpacity onPress={onCLickNumberCard}>
            <Text style={styles.textTitleItem}>{I18n.t('so_the_cung')}</Text>
            <Text style={styles.textTitleItemHint}>{props.number ? props.number : 0}</Text>
        </TouchableOpacity>
    )
}
const StoreInformation = (props) => {
    return (
        <ScrollView >
            <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <Text style={styles.textTitleItemHint}>{I18n.t('link_dang_nhap')}</Text>
                <Text style={styles.textTitleItem}></Text>
            </View>
            <ItemStoreInfor title={I18n.t('ten')}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('dia_chi')}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('so_dien_thoai')}></ItemStoreInfor>
            <ItemStoreInfor title={I18n.t('chan_trang')} titleHint='Xin cám ơn, hẹn gặp lại quý khách!'></ItemStoreInfor>
            <ItemStoreInfor title='Banner Ads1' titleHint='https://www.pos365.vn/wp-content'></ItemStoreInfor>
            <ItemStoreInfor title='Banner Ads2' titleHint='https://www.pos365.vn/wp-content'></ItemStoreInfor>
            <ItemStoreInfor title='Slideshow1' titleHint='https://www.pos365.vn/wp-content'></ItemStoreInfor>
            <ItemStoreInfor title='Slideshow2' titleHint='https://www.pos365.vn/wp-content'></ItemStoreInfor>
            <ItemStoreInfor title='Slideshow3' titleHint='https://www.pos365.vn/wp-content'></ItemStoreInfor>
        </ScrollView>
    )
}
const ItemStoreInfor = (props) => {
    return (
        <View style={{ flex: 1, marginTop: 10 }}>
            <Text style={styles.textTitleItemHint}>{props.title}</Text>
            <TextInput style={styles.textInputStyle} placeholder={props.titleHint}></TextInput>
        </View>
    )
}
const styles = StyleSheet.create({
    textTitle: {
        fontSize: 24,color: '#FF6600',marginLeft: 20
    },
    textTitleItem: {
        flex: 6,fontSize: 18,marginLeft: 20,marginTop: 20
    },
    textTitleItemHint: {
        flex: 1,fontSize: 18,color: 'silver',marginLeft: 20
    },
    switchButton: {
        flex: 2,
    },
    viewLine: {
        height: 1,width: '100%',alignSelf: 'center',backgroundColor: 'silver',marginVertical: 10
    },
    styleButtonOK: {
        flex: 1, backgroundColor: "#FF6600", borderRadius: 4, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end", marginLeft: 5, marginRight: 10, marginBottom: 10
    },
    styleButtonHuy: {
        flex: 1, backgroundColor: "#fff", borderWidth: 1, borderRadius: 4, justifyContent: 'flex-start', paddingVertical: 10, paddingHorizontal: 20, marginLeft: 10, marginRight: 5, marginBottom: 10
    },
    styleViewModal: {
        alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff", borderWidth: 1, borderRadius: 5,
    },
    titleModal: {
        fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 10, color: '#FF6600'
    },
    textInputStyle: {
        height: 45, borderWidth: 1, marginTop: 20, padding: 10, marginLeft: 5, marginRight: 5, borderRadius: 5, fontSize: 20
    },
})