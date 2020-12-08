import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
    View, Text, Image,
    StyleSheet, TouchableOpacity, TextInput, Keyboard
} from "react-native";
import { Snackbar, } from "react-native-paper";
import I18n from '../../common/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Images, Colors, Metrics } from "../../theme";
import { Constant } from "../../common/Constant";
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService, getHeaders, URL } from "../../data/services/HttpService";
import { useSelector, useDispatch } from 'react-redux';
import { saveDeviceInfoToStore } from "../../actions/Common";
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import dialogManager from '../../components/dialog/DialogManager';
import { CommonActions } from '@react-navigation/native';
import realmStore from '../../data/realm/RealmStore';


let error = "";

const LoginScreen = (props) => {
    const [extraHeight, setExtraHeight] = useState(0);
    const [shop, setShop] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [logIn, setLogIn] = useState(false);
    const [hasLogin, setHasLogin] = useState(true);
    const dispatch = useDispatch();

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });

    useEffect(() => {
        const getCurrentAccount = async () => {
            dialogManager.showLoading();
            let currentAccount = await getFileDuLieuString(Constant.CURRENT_ACCOUNT, true);
            console.log('currentAccount', currentAccount);
            if (currentAccount && currentAccount != "") {
                currentAccount = JSON.parse(currentAccount);
                URL.link = "https://" + currentAccount.Link + ".pos365.vn/";
                dispatch(saveDeviceInfoToStore({ SessionId: currentAccount.SessionId }))
                navigateToHome();
            } else {
                let rememberAccount = await getFileDuLieuString(Constant.REMEMBER_ACCOUNT, true);
                console.log('rememberAccount', rememberAccount);
                if (rememberAccount && rememberAccount != "") {
                    rememberAccount = JSON.parse(rememberAccount);
                    setHasLogin(false)
                    setShop(rememberAccount.Link)
                    setUserName(rememberAccount.UserName)
                } else {
                    setHasLogin(false)
                }
                dialogManager.hiddenLoading()
                dispatch({ type: 'ALREADY', already: false })
                await realmStore.deleteAll()
            }
        }
        getCurrentAccount()
    }, [])

    const onClickLogin = useCallback(() => {
        if (!logIn) return
        if (!checkDataLogin()) {
            return
        } else {
            dialogManager.showLoading();
            URL.link = "https://" + shop.trim() + ".pos365.vn/";
            console.log("onClickLogin URL ", URL, shop);
            let params = { UserName: userName, Password: password };
            new HTTPService().setPath(ApiPath.LOGIN).POST(params, getHeaders({}, true)).then((res) => {
                console.log("onClickLogin res ", res);
                if (res && res.SessionId && res.SessionId != "") {
                    dispatch(saveDeviceInfoToStore({ SessionId: res.SessionId }))
                    handlerLoginSuccess(params, res);
                }
                if (res == null) {
                    dialogManager.hiddenLoading();
                    dialogManager.showPopupOneButton(I18n.t('loi_dang_nhap'), I18n.t('thong_bao'))
                }
            }).catch((e) => {
                dialogManager.hiddenLoading();
                dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
                console.log("onClickLogin err ", e);
            })
        }
    }, [logIn])

    useEffect(() => {
        onClickLogin()
        return () => {
            setLogIn(false)
        }
    }, [onClickLogin])

    const handlerLoginSuccess = (params, res) => {
        let account = { SessionId: res.SessionId, UserName: params.UserName, Link: shop.trim() };
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, JSON.stringify(account));
        getRetailerInfoAndNavigate();
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
        dialogManager.hiddenLoading();
    }

    const getRetailerInfoAndNavigate = () => {
        let inforParams = {};
        new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET(inforParams, getHeaders()).then(async (res) => {
            console.log("getDataRetailerInfo res ", res);
            setFileLuuDuLieu(Constant.VENDOR_SESSION, JSON.stringify(res))

            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            console.log("getDataRetailerInfo branch ", branch);
            if (branch != undefined || branch != '') {
                if (res && res.Branchs.length > 0) {
                    console.log("getDataRetailerInfo branch done ");
                    setFileLuuDuLieu(Constant.CURRENT_BRANCH, JSON.stringify(res.Branchs[0]))
                }
            }

            if (res && res.CurrentUser) {
                if (userName != '') {
                    let account = { UserName: userName, Link: shop.trim() };
                    setFileLuuDuLieu(Constant.REMEMBER_ACCOUNT, JSON.stringify(account));
                }

                // if (res.CurrentRetailer && (res.CurrentRetailer.FieldId == 3 || res.CurrentRetailer.FieldId == 11)) {
                //     dispatch({ type: 'IS_FNB', isFNB: true })
                // } else {
                //     // dialogManager.showPopupOneButton(I18n.t("vui_long_chon_li÷nh_vuc_ban_le_ho_tro_shop_thoi_trang_sieu_thi"), I18n.t('thong_bao'));
                //     dispatch({ type: 'IS_FNB', isFNB: false })
                // }

                navigateToHome()
            } else {
                dialogManager.showPopupOneButton(I18n.t('ban_khong_co_quyen_truy_cap'), I18n.t('thong_bao'));
            }
            dialogManager.hiddenLoading();
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("getDataRetailerInfo err ", e);
        })
    }



    const onChangeText = (text, type) => {
        if (type == 1) {
            setShop(text.trim())
        } else if (type == 2) {
            setUserName(text.trim())
        } else if (type == 3) {
            setPassword(text.trim())
        }
    }


    const checkDataLogin = () => {
        if (shop == '') {
            error = I18n.t('quy_khach_vui_long_nhap_ten_cua_hang');
            setShowToast(true)
            return false;
        } else if (userName == '') {
            error = I18n.t('quy_khach_vui_long_nhap_ten_tai_khoan');
            setShowToast(true)
            return false;
        } else if (password == '') {
            error = I18n.t('quy_khach_vui_long_nhap_mat_khau');
            setShowToast(true)
            return false;
        }
        return true;
    }

    if (hasLogin) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.colorchinh }}>
            </View>
        );
    }

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            colors={['#FFAB40', '#FF5722']}
            style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

                <KeyboardAwareScrollView style={{}} enableOnAndroid={true} extraHeight={extraHeight}
                    showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={{ flex: 1, height: orientaition == Constant.PORTRAIT ? Metrics.screenHeight - 60 : Metrics.screenWidth - 60, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ height: 70, width: 225, marginBottom: 50 }} resizeMethod="scale" source={Images.logo_365_boss_white} />
                        <View style={[styles.inputtext, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={{ height: 24, width: 24, margin: 10 }} resizeMethod="auto" source={Images.icon_shop} />
                            <TextInput
                                onChangeText={text => onChangeText(text, 1)}
                                value={shop}
                                onFocus={() => { setExtraHeight(270) }}
                                keyboardType={"default"}
                                style={{ height: 40, flex: 1, marginRight: 5, color: "#000" }}
                                placeholderTextColor="#808080"
                                placeholder={I18n.t('ten_cua_hang')} />
                            <Text style={{ opacity: 0.5 }}>.pos365.vn</Text>
                        </View>
                        <View style={[styles.inputtext, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={{ height: 24, width: 24, margin: 10 }} resizeMethod="auto" source={Images.icon_user_name} />
                            <TextInput
                                onChangeText={text => onChangeText(text, 2)}
                                value={userName}
                                onFocus={() => { setExtraHeight(200) }}
                                keyboardType={"default"}
                                style={{ height: 40, flex: 1, color: "#000" }}
                                placeholderTextColor="#808080"
                                placeholder={I18n.t('ten_dang_nhap')} />
                        </View>
                        <View style={[styles.inputtext, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={{ height: 24, width: 24, margin: 10 }} resizeMethod="auto" source={Images.icon_password} />
                            <TextInput
                                onChangeText={text => onChangeText(text, 3)}
                                value={password}
                                onFocus={() => { setExtraHeight(130) }}
                                keyboardType={"default"}
                                style={{ height: 40, margin: 0, flex: 1, color: "#000" }}
                                placeholder={I18n.t('mat_khau')}
                                placeholderTextColor="#808080"
                                secureTextEntry={true} />
                        </View>
                        <View style={{}}>
                            <TouchableOpacity style={{ height: 50, width: Metrics.screenWidth - 50, marginTop: 15, borderColor: "#fff", borderWidth: 1, borderRadius: 5, justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setLogIn(!logIn)
                                }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{I18n.t("thu_ngan").toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 0 }}>
                        <Text style={{ color: "#fff" }}>{I18n.t("tong_dai_ho_tro")} 24/7</Text>
                        <TouchableOpacity onPress={() => { }} style={{ flexDirection: "row", marginTop: 7, marginBottom: 10 }}>
                            <Image source={Images.icon_phone_header} style={{ width: 20, height: 20, marginRight: 7 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>{Constant.HOTLINE}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>

                <Snackbar
                    duration={5000}
                    visible={showToast}
                    onDismiss={() => setShowToast(false)}
                >
                    {error}
                </Snackbar>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    inputtext: {
        backgroundColor: "#FFA951",
        margin: 10, padding: 10, borderColor: Colors.colorchinh, borderRadius: 5, borderWidth: 1, height: 50, width: Metrics.screenWidth - 50
    }
});

export default React.memo(LoginScreen)