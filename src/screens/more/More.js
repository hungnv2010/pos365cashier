import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity, NativeModules, Modal, TextInput, Linking, ScrollView } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';
import I18n from '../../common/language/i18n'
import { Switch, Snackbar } from 'react-native-paper';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService, getHeaders } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../../theme/Colors';
import dataManager from '../../data/DataManager';
import { navigate } from '../../navigator/NavigationService';
import { useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import signalRManager from '../../common/SignalR';
const { Print } = NativeModules;
const IP_DEFAULT = "192.168.99.";

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
    const [vendorSession, setVendorSession] = useState({});
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('HeaderComponent data', JSON.parse(data));
            data = JSON.parse(data)
            setVendorSession(data);
            if (data.CurrentRetailer && data.CurrentRetailer.Logo) {
                setLogo(data.CurrentRetailer.Logo)
            }
            if (data.CurrentRetailer && data.CurrentRetailer.Name) {
                setName(data.CurrentRetailer.Name)
            }

            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            if (branch) {
                console.log('HeaderComponent branch', JSON.parse(branch));
                setBranch(JSON.parse(branch))
            } else {
                if (data.Branchs.length > 0)
                    setBranch(data.Branchs[0])
            }
        }
        getVendorSession()
    }, [])

    useEffect(() => {

    }, [Logo])

    const onClickBranh = () => {
        console.log("onClickBranh ", vendorSession);
        if (vendorSession.Branchs.length > 1) {
            setShowModal(true)
        } else {
            props.showToast(I18n.t('ban_dang_co_it_hon_hai_chi_nhanh'))
        }
    }

    const onClickItemBranch = (item) => {
        console.log("onClickItemBranch ", item);
        setShowModal(false)
        if (Branch.Id == item.Id) {
            return;
        }
        let params = { branchId: item.Id }
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.CHANGE_BRANCH).GET(params).then(async (res) => {
            console.log("onClickItemBranch res ", res);
            if (res) {
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, JSON.stringify(item));
                setBranch(item)
                dispatch({ type: 'ALREADY', already: false })
                dataManager.dataChoosing = [];
                // await realmStore.deleteAll(),
                signalRManager.killSignalR();
                getRetailerInfoAndNavigate();
            } else {
                dialogManager.hiddenLoading();
            }
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("onClickItemBranch err ", e);
            dialogManager.hiddenLoading()
        })
    }

    const navigateToHome = () => {
        props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Home' },
                ],
            })
        )
    }

    const getRetailerInfoAndNavigate = () => {
        let inforParams = {};
        new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET(inforParams, getHeaders()).then((res) => {
            console.log("getDataRetailerInfo res ", res);
            if (res && res.CurrentUser) {
                if (res.CurrentRetailer && (res.CurrentRetailer.FieldId == 3 || res.CurrentRetailer.FieldId == 11)) {
                    setFileLuuDuLieu(Constant.VENDOR_SESSION, JSON.stringify(res))
                    navigateToHome()
                } else {
                    dialogManager.showPopupOneButton(I18n.t("vui_long_chon_linh_vuc_ban_le_ho_tro_shop_thoi_trang_sieu_thi"), I18n.t('thong_bao'));
                }
            } else {
                dialogManager.showPopupOneButton(I18n.t('ban_khong_co_quyen_truy_cap'), I18n.t('thong_bao'));
            }
            dialogManager.hiddenLoading();
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("getDataRetailerInfo err ", e);
        })
    }

    return (
        <View style={{ backgroundColor: Colors.colorchinh, justifyContent: "space-between", flexDirection: "row", alignItems: "center", padding: 20 }}>
            <View >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {
                        Logo != "" ?
                            <Image key="1" resizeMethod="scale"
                                source={{ uri: Logo }}
                                style={[{ width: 50, height: 50, marginRight: 20, borderRadius: 25, borderWidth: 2 }]} />
                            :
                            <Image key="2" source={Images.icon_person} style={[{ width: 50, height: 50, marginRight: 20 }]} />
                    }
                    <Text style={{ marginTop: 10, color: "#fff" }}>{Name}</Text>
                </View>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }} onPress={() => onClickBranh()}>
                    <Icon name="location-on" size={20} color="#fff" />
                    <Text style={{ color: "#fff" }}>{Branch.Name && Branch.Name != "" ? Branch.Name : I18n.t('chi_nhanh')}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => onClickLogOut()}>
                <Text style={{ textDecorationLine: "underline", color: "#fff" }}>{I18n.t('logout')}</Text>
            </TouchableOpacity> 
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
                                    vendorSession.Branchs && vendorSession.Branchs.length > 0 ?
                                        vendorSession.Branchs.map((item, index) => (
                                            <TouchableOpacity key={index} onPress={() => onClickItemBranch(item)}>
                                                <Text style={{ paddingVertical: 12 }}>{item.Name}</Text>
                                            </TouchableOpacity>
                                        ))
                                        : null
                                }
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
        }
        getCurrentIP()
    }, [])

    const onClickLogOut = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_dang_xuat'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
                dataManager.dataChoosing = []
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

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flexGrow: 1 }}>
                <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                    <Text style={{ color: Colors.colorchinh, fontSize: 18 }}>{I18n.t('ket_noi_may_in')}</Text>
                    <TouchableOpacity style={{ paddingVertical: 10, paddingTop: 20 }} onPress={async () => {
                        setShowModal(true)
                        let size = await getFileDuLieuString(Constant.SIZE_INPUT, true);
                        console.log('size ', size);
                        if (size && size != "") {
                            setPaperSize(size)
                        }
                    }}>
                        <Text style={{}}>{I18n.t('may_in_tam_tinh')} ({I18n.t('qua_mang_lan')} {ip})</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                    <Text style={{ color: Colors.colorchinh, fontSize: 18 }}>{I18n.t('cai_dat_may_in')}</Text>
                    <TouchableOpacity style={{ paddingVertical: 10, paddingTop: 20 }} onPress={() => {
                        props.navigation.navigate("PrintHtml")
                        // props.navigation.navigate("PrintWebview")
                    }}>
                        <Text >HTML print</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
                        <View style={{ flex: 1, flexDirection: "column", height: 40, justifyContent: "center" }}>
                            <Text style={{ textAlign: "left", }}>{I18n.t('in_tam_tinh')}</Text>
                        </View>
                        <Switch
                            color={Colors.colorchinh}
                            value={isSwitchOn}
                            onValueChange={() => {
                                if (isSwitchOn == false)
                                    setFileLuuDuLieu(Constant.PROVISIONAL_PRINT, Constant.PROVISIONAL_PRINT)
                                else
                                    setFileLuuDuLieu(Constant.PROVISIONAL_PRINT, "")
                                setSwitchOn(!isSwitchOn)
                            }
                            }
                        />
                    </View>
                </View>
                <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                    <TouchableOpacity onPress={() => onClickHotLine()} style={{ padding: 20 }}>
                        <Text style={{ marginTop: 0 }}>{I18n.t('ho_tro')} <Text style={{ color: colors.colorLightBlue }}>{Constant.HOTLINE}</Text></Text>
                    </TouchableOpacity>
                </View>
                <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                    <View style={{ padding: 20 }}>
                        <Text style={{ marginTop: 0 }}>{I18n.t('phien_ban_ngay')} <Text style={{ color: colors.colorLightBlue }}> {version}</Text></Text>
                    </View>
                </View>
                <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                    <TouchableOpacity onPress={() => onClickLogOut()} style={{ padding: 20 }}>
                        <Text style={{ marginTop: 0 }}>{I18n.t('logout')}</Text>
                    </TouchableOpacity>
                </View>
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
