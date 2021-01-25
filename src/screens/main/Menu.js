import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity, NativeModules, Modal, TextInput, Linking, ScrollView } from 'react-native';
import { Images, Colors, Metrics, Fonts } from '../../theme';
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';
import I18n from '../../common/language/i18n'
import { Switch, Snackbar, Paragraph } from 'react-native-paper';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService, getHeaders } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons'
import colors from '../../theme/Colors';
import { Checkbox, RadioButton } from 'react-native-paper';
import dataManager from '../../data/DataManager';
import { navigate } from '../../navigator/NavigationService';
import { useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import signalRManager from '../../common/SignalR';
import { ScreenList } from '../../common/ScreenList';
const { Print } = NativeModules;
const IP_DEFAULT = "192.168.99.";

const KEY_FUNC = {
    HOME: ScreenList.Home,
    CUSTOMER: ScreenList.Customer,
    SETTING_FUNC: ScreenList.Settings,
    VERSION: "VERSION",
    MORE: ScreenList.More,
    HISTORY: ScreenList.History,
    ROOM_CATALOG: ScreenList.RoomList,
    OVERVIEW: ScreenList.OverView,
    INVOICE: ScreenList.Invoice,
    CASH_FLOW: ScreenList.CashFlow,
    ROOM_HISTORY: ScreenList.RoomHistory,
    ORDER_OFFLINE: ScreenList.OrderOffline,
    VOUCHERS: ScreenList.Vouchers,
    PRODUCT: ScreenList.Product,
}

const LIST_FUNCITION = [
    {
        func: KEY_FUNC.HOME,
        icon: Images.icon_cashier,
        title: "man_hinh_thu_ngan"
    },

    {
        func: KEY_FUNC.ORDER_OFFLINE,
        icon: Images.icon_oder_offline,
        title: "don_hang_offline"
    },
    // {
    //     func: KEY_FUNC.HISTORY,
    //     icon: Images.icon_customer,
    //     title: "lich_su_goi_mon"
    // },
    {
        func: KEY_FUNC.ROOM_CATALOG,
        icon: Images.icon_room_table,
        title: "danh_muc_phong_ban"
    },
    // {
    //     func: KEY_FUNC.MORE,
    //     icon: Images.icon_star,
    //     title: "them"
    // },
    {
        func: KEY_FUNC.OVERVIEW,
        icon: Images.icon_overview,
        title: "tong_quan"
    },
    {
        func: KEY_FUNC.CUSTOMER,
        icon: Images.icon_customer,
        title: "khach_hang"
    },
    {
        func: KEY_FUNC.PRODUCT,
        icon: Images.icon_product,
        title: "hang_hoa"
    },
    {
        func: KEY_FUNC.CASH_FLOW,
        icon: Images.icon_income,
        title: "thu_chi_"
    },
    {
        func: KEY_FUNC.INVOICE,
        icon: Images.icon_invoice,
        title: "hoa_don"
    },
    {
        func: KEY_FUNC.ROOM_HISTORY,
        icon: Images.icon_room_history,
        title: 'lich_su_huy_tra_do'
    },
    {
        func: KEY_FUNC.VOUCHERS,
        icon: Images.icon_vouchers,
        title: 'voucher'
    },
    {
        func: KEY_FUNC.SETTING_FUNC,
        icon: Images.icon_setting,
        title: "cai_dat"
    },
    {
        func: KEY_FUNC.VERSION,
        icon: Images.icon_version,
        title: "phien_ban_ngay"
    },
]

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const handlerToast = (text) => {
        setToastDescription(text)
        setShowToast(true)
    }

    return (
        <View style={{ flex: 1 }}>
            <HeaderComponent {...props} showToast={(text) => handlerToast(text)} />
            <ContentComponent {...props} />
            <Snackbar
                duration={5000}
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

const HeaderComponent = (props) => {

    const [Logo, setLogo] = useState("");
    const [Name, setName] = useState("");
    const [Branch, setBranch] = useState({});
    const [listBranch, setListBranch] = useState([]);
    const [vendorSession, setVendorSession] = useState({});
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('HeaderComponent data', data);
            data = JSON.parse(data)
            setVendorSession(data);
            if (data.CurrentRetailer && data.CurrentRetailer.Logo) {
                setLogo(data.CurrentRetailer.Logo)
            }
            if (data.CurrentRetailer && data.CurrentRetailer.Name) {
                setName(data.CurrentRetailer.Name)
            }
            if (data.Branchs.length > 0) {
                let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
                branch = JSON.parse(branch)
                if (branch) {
                    data.Branchs.forEach(item => {
                        item.checked = false
                        if (item.Id == branch.Id) {
                            item.checked = true
                        }
                    })
                    setBranch(branch)
                } else {
                    data.Branchs.forEach((item, index) => {
                        item.checked = false
                        if (index == 0) {
                            item.checked = true
                        }
                    })
                    setBranch(data.Branchs([0]))
                }

                setListBranch(data.Branchs)
            }

        }
        getVendorSession()
    }, [])



    const onClickBranh = () => {
        console.log("onClickBranh ", vendorSession);
        if (vendorSession.Branchs.length > 1) {
            setShowModal(true)
        } else {
            props.showToast(I18n.t('ban_dang_co_it_hon_hai_chi_nhanh'))
        }
    }

    const onClickItemBranch = (item) => {
        listBranch.forEach(lp => {
            lp.checked = false
            if (lp.Id == item.Id) {
                lp.checked = true
            }
        })
        setListBranch([...listBranch])
    }

    const onDoneClickItemBranch = () => {
        let selectBranch = listBranch.filter(item => item.checked)
        selectBranch = selectBranch.length > 0 ? selectBranch[0] : {}
        if (Branch.Id == selectBranch.Id) {
            setShowModal(false)
            return;
        }
        let params = { branchId: selectBranch.Id }
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.CHANGE_BRANCH).GET(params).then(async (res) => {
            console.log("onClickItemBranch res ", res);
            if (res) {
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, JSON.stringify(selectBranch));
                setBranch(selectBranch)
                dispatch({ type: 'IS_FNB', isFNB: null })
                // dispatch({ type: 'ALREADY', already: false })
                signalRManager.killSignalR();
                getRetailerInfoAndNavigate();
                dialogManager.hiddenLoading();
            } else {
                dialogManager.hiddenLoading();
            }
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("onClickItemBranch err ", e);
            dialogManager.hiddenLoading()
        })
        setShowModal(false)
    }

    const navigateToHome = () => {
        props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Home' },
                ]
            })
        )
    }

    const getRetailerInfoAndNavigate = () => {
        navigateToHome()
    }

    const onClickLogOut = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_dang_xuat'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                dispatch({ type: 'IS_FNB', isFNB: null })
                dispatch({ type: 'ALREADY', already: false })
                setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
                signalRManager.killSignalR();
                navigate('Login', {}, true);
            }
        })
    }

    return (
        <View style={{ backgroundColor: Colors.colorchinh, justifyContent: "space-between", flexDirection: "row", alignItems: "center", padding: 20 }}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {
                        Logo != "" ?
                            <Image key="1" resizeMethod="scale"
                                source={{ uri: Logo }}
                                style={[{ width: 50, height: 50, marginRight: 20, borderRadius: 25, borderWidth: 2, backgroundColor: "#fff" }]} />
                            :
                            <Image key="2" source={Images.icon_person} style={[{ width: 50, height: 50, marginRight: 20 }]} />
                    }
                    <Text style={{ marginTop: 10, color: "#fff" }}>{Name}</Text>
                </View>
                <View style={{ marginTop: 15, }}>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }} onPress={() => onClickBranh()}>
                        <Icon name="location-on" size={20} color="#fff" />
                        <Text numberOfLines={2} style={{ color: "#fff" }}>{Branch.Name}</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ alignItems: "flex-end" }}
                        onPress={() => onClickLogOut()}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ textDecorationLine: "underline", color: "#fff" }}>{I18n.t('logout')}</Text>
                            <Image source={Images.icon_logout} style={{ width: 12, height: 15, marginLeft: 5 }}></Image>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
                        }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <View style={{ padding: 10 }}>
                                <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>{I18n.t('chon_chi_nhanh')}</Text>
                                {
                                    listBranch.map((item, index) => {
                                        return (
                                            <TouchableOpacity style={{ flexDirection: "row", }} key={index} onPress={() => onClickItemBranch(item)}>
                                                <RadioButton.Android
                                                    color="orange"
                                                    status={item.checked ? 'checked' : 'unchecked'}
                                                    onPress={() => onClickItemBranch(item)}
                                                />
                                                <Text style={{ paddingVertical: 12 }}>{item.Name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                                <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 15, alignItems: "center" }}>
                                    <TouchableOpacity style={{ paddingRight: 20 }} onPress={() => { setShowModal(false) }}>
                                        <Text style={{ padding: 10 }}>{I18n.t('huy')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onDoneClickItemBranch}>
                                        <Text style={{ paddingVertical: 10, backgroundColor: Colors.colorchinh, borderRadius: 5, paddingHorizontal: 20, color: "white" }}>{I18n.t('dong_y')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>

    )
}

const ContentComponent = (props) => {

    const [showModal, setShowModal] = useState(false);
    const [ipInput, setIpInput] = useState(IP_DEFAULT);
    const [ip, setIp] = useState(IP_DEFAULT);
    const [isSwitchOn, setSwitchOn] = useState(false);
    const [paperSize, setPaperSize] = useState("");
    const dispatch = useDispatch();
    const [version, setVersion] = useState("");
    const [currentItemMenu, setCurrentItemMenu] = useState(0);
    const [numberOrderOffline, setNumberOrderOffline] = useState(0);

    realmStore.queryOrdersOffline().then(orderOffline => {
        console.log("Abc orderOffline ", orderOffline.length);
        setNumberOrderOffline(orderOffline.length)
    })

    useEffect(() => {
        const getCurrentIP = async () => {
            let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
            console.log('getCurrentIP ', getCurrentIP);
            if (getCurrentIP && getCurrentIP != "") {
                setIp(getCurrentIP)
            }
            let provisional = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('provisional ', provisional);
            if (provisional && provisional != "" && provisional == Constant.PROVISIONAL_PRINT) {
                setSwitchOn(true);
            }
            DeviceInfo.getVersion().then(res => {
                console.log("DeviceInfo.getVersion() ===  ", res);
                setVersion(res)
            });
            // 
        }
        getCurrentIP()
    }, [])

    const onClickLogOut = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_dang_xuat'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
                navigate('Login', {}, true);
            }
        })
    }

    const onClickSaveIP = () => {
        if (ipInput.length > 11) {
            setIp(ipInput)
            setFileLuuDuLieu(Constant.IPPRINT, ipInput)
            console.log("paperSize ", paperSize);
            setFileLuuDuLieu(Constant.SIZE_INPUT, paperSize)
            let size = paperSize != "" ? paperSize : "72";
            Print.registerPrint(ipInput + "_" + size)
        }
        setShowModal(false)
    }

    const onClickHotLine = () => {
        let phone_number = "tel:" + Constant.HOTLINE;
        Linking.openURL(phone_number);
    }

    const _renderDivider = () => {
        return (
            <View style={{ height: 8, width: "100%", backgroundColor: "#d6d6d6" }} ></View>
        )
    }

    const onClickItem = (chucnang, index) => {
        console.log("onClickItem props ", props);
        if (chucnang.func == KEY_FUNC.VERSION) return;
        let params = {};
        if (chucnang.func == ScreenList.Home || chucnang.func == ScreenList.Customer || chucnang.func == ScreenList.Settings || chucnang.func == ScreenList.Invoice || chucnang.func == ScreenList.OverView || chucnang.func == ScreenList.RoomHistory || chucnang.func == ScreenList.Vouchers) {
            setCurrentItemMenu(index)
        }
        props.navigation.navigate(chucnang.func, params)
        props.navigation.closeDrawer();
    }


    const _renderItem = (chucnang = {}, indexchucnnag = 0) => {
        return (
            <View key={indexchucnnag} style={{ width: "100%", backgroundColor: currentItemMenu == indexchucnnag ? "#EEEEEE" : "#fff" }}>
                <TouchableOpacity
                    style={{ with: Metrics.screenWidth * 1, flexDirection: "row", alignItems: "center"}}
                    onPress={() => onClickItem(chucnang, indexchucnnag)}>
                    {chucnang.icon && chucnang.icon != "" ?
                        <Image
                            resizeMode="contain"
                            style={[styles.icon_menu]}
                            source={chucnang.icon}
                        />
                        : null}
                    <View style={styles.row_menu}>

                        <Paragraph style={styles.text_menu}>
                            {I18n.t(chucnang.title)}
                            {chucnang.title == "don_hang_offline" ?
                                <Text style={{ color: Colors.colorBlueText }}>{numberOrderOffline > 0 ? `[${numberOrderOffline}]` : null}</Text> : null}
                            {chucnang.title == "hotline" ?
                                <Text style={{ color: Colors.colorBlueText }}> {Constant.HOTLINE}</Text> : null}
                            {chucnang.title == "phien_ban_ngay" ?
                                <Text style={{ color: Colors.colorBlueText }}> {version}</Text> : null}
                        </Paragraph>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, width: "100%", }} keyboardShouldPersistTaps={'handled'}>
                {LIST_FUNCITION.map((item, index) => {
                    return (
                        _renderItem(item, index)
                    )
                })}
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
                        }]}></View>
                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <View style={{ padding: 10 }}>
                                <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>IP connect</Text>
                                <TextInput style={{ padding: 10, borderRadius: 5, borderWidth: 1, borderColor: "#ddd", color: "#000" }} onChangeText={(text) => setIpInput(text)} value={ipInput} placeholderTextColor="#808080" placeholder={I18n.t('dia_chi_ip')} />
                                {/* <TextInput style={{ padding: 10, borderRadius: 5, borderWidth: 1, borderColor: "#ddd", marginTop: 15 , color: "#000"}} onChangeText={(text) => setPaperSize(text)} value={paperSize} placeholder="Khổ giấy 58..80" /> */}
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => {
                                        setShowModal(false)
                                    }}>
                                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500", marginRight: 15, color: "red" }}>{I18n.t('huy')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => onClickSaveIP()}>
                                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500" }}>{I18n.t('dong_y')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    icon_menu: {
        width: 48, height: 48, margin: 0
    },
    row_menu: {
        width: "100%", borderBottomWidth: 0, borderBottomColor: "#ddd",
        flexDirection: "row", alignItems: "flex-start", paddingVertical: 12, justifyContent: "flex-start"
    },
    text_menu: {
        margin: 0, color: Colors.colorText, fontSize: Fonts.size.mainSize
    },
})