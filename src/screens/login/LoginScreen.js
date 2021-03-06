import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
    View, Text, Image,
    StyleSheet, TouchableOpacity, TextInput, Keyboard, Linking, NativeModules
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
import Permissions, { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import htmlDefault from '../../data/html/htmlDefault';
const { Print } = NativeModules;


let error = "";

const LoginScreen = (props) => {
    const [extraHeight, setExtraHeight] = useState(0);
    const [shop, setShop] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showToast, setShowToast] = useState(false);
    // const [logIn, setLogIn] = useState(false);
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

                let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
                console.log('Login data====', JSON.parse(data));
                // let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
                // branch = JSON.parse(branch)
                // console.log("getDataRetailerInfo branch ", branch);
                // if (data != '')
                //     data = JSON.parse(data)
                // if (data.Branchs[0].Id != branch.Id) {
                //     let params = { branchId: data.Branchs[0].Id }
                //     new HTTPService().setPath(ApiPath.CHANGE_BRANCH).GET(params).then(async (res) => {
                //         console.log("onClickItemBranch res ", res);
                //         getRetailerInfoAndNavigate()
                //     }).catch((e) => {
                //         getRetailerInfoAndNavigate()
                //     })

                // }else{
                //     getRetailerInfoAndNavigate()
                // }
                getRetailerInfoAndNavigate()
                // navigateToHome()
            } else {
                let rememberAccount = await getFileDuLieuString(Constant.REMEMBER_ACCOUNT, true);
                console.log('rememberAccount', rememberAccount);
                dialogManager.hiddenLoading()
                if (rememberAccount && rememberAccount != "") {
                    rememberAccount = JSON.parse(rememberAccount);
                    setHasLogin(false)
                    setShop(rememberAccount.Link)
                    setUserName(rememberAccount.UserName)
                } else {
                    setHasLogin(false)
                }
            }
        }
        getCurrentAccount()
    }, [])

    const onClickLogin = () => {
        // if (!logIn) return
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
            }, err => {
                dialogManager.hiddenLoading();
                dialogManager.showPopupOneButton(I18n.t('loi_dang_nhap'), I18n.t('thong_bao'))
            }).catch((e) => {
                dialogManager.hiddenLoading();
                dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
                console.log("onClickLogin err ", e);
            })
        }
    }


    const handlerLoginSuccess = async (params, res) => {
        let account = { SessionId: res.SessionId, UserName: params.UserName, Link: shop.trim() };
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, JSON.stringify(account));
        await realmStore.deleteAllForFnb()
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

    const getRetailerInfoAndNavigate = async () => {
        let inforParams = {};
        new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET(inforParams, getHeaders()).then(async (res) => {
            console.log("getDataRetailerInfo res ", res);
            setFileLuuDuLieu(Constant.VENDOR_SESSION, JSON.stringify(res))

            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            console.log("getDataRetailerInfo branch ", branch);
            if (branch == undefined || branch == '') {
                if (res && res.Branchs.length > 0) {
                    console.log("getDataRetailerInfo branch done ");
                    setFileLuuDuLieu(Constant.CURRENT_BRANCH, JSON.stringify(res.Branchs[0]))
                }
            }

            if (res && res.CurrentUser && res.CurrentUser.IsActive) {
                if (userName != '') {
                    let account = { UserName: userName, Link: shop.trim() };
                    setFileLuuDuLieu(Constant.REMEMBER_ACCOUNT, JSON.stringify(account));
                }
                if (!res.CurrentUser.IsAdmin) {
                    let params = {
                        ShowAll: true,
                        BranchId: res.Branchs[0].Id
                    }
                    let arr = {}
                    res.PermissionMap.forEach(item => {
                        if (item.Branches.indexOf(res.CurrentBranchId) > -1)
                            arr[item.Key] = true
                        else
                            arr[item.Key] = false
                    })
                    console.log("arr", arr);
                    dispatch({ type: 'PERMISSION', allPer: arr })
                    let apiPath = ApiPath.PRIVILEGES.replace('{userId}', res.CurrentUser.Id)
                    let privileges = await new HTTPService().setPath(apiPath).GET(params, getHeaders())
                    console.log('privileges login', res.PermissionMap);
                    setFileLuuDuLieu(Constant.PRIVILEGES, JSON.stringify(privileges));
                    setFileLuuDuLieu(Constant.ALLPER, JSON.stringify(arr));
                } else {
                    dispatch({ type: 'PERMISSION', allPer: { IsAdmin: true } })
                    setFileLuuDuLieu(Constant.ALLPER, JSON.stringify({ IsAdmin: true }));
                }
                setFileLuuDuLieu(Constant.HTML_PRINT, htmlDefault);
                navigateToHome()
            } else {
                dialogManager.showPopupOneButton(I18n.t('ban_khong_co_quyen_truy_cap'), I18n.t('thong_bao'));
            }
            dialogManager.hiddenLoading();
        }).catch(async(e) => {
            dialogManager.hiddenLoading();
            console.log("getDataRetailerInfo err ", e);
            let per = await getFileDuLieuString(Constant.ALLPER, true)
            console.log("getDataRetailerInfo per ", per, typeof(per));
            if (per && per != '') {
                console.log("getDataRetailerInfo per ok ");
                dispatch({ type: 'PERMISSION', allPer: JSON.parse(per) })
            }
            navigateToHome();
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

    const actionPhone = async () => {
        let phone_number = "tel: " + Constant.HOTLINE;
        Linking.openURL(phone_number);
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
                                onPress={onClickLogin}>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{I18n.t("thu_ngan").toUpperCase()}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ height: 50, width: Metrics.screenWidth - 50, marginTop: 15, borderColor: "#fff", borderWidth: 1, borderRadius: 5, justifyContent: "center", alignItems: "center" }}
                                onPress={async () => {
                                    // Print.openAppOrder((status) => {
                                    //     console.log("openAppOrder status ", status)
                                    //     if(status == "false"){
                                    //         Linking.openURL('https://apps.apple.com/us/app/pos365-order/id1517773105')
                                    //     }
                                    // })
                                    const supported = await Linking.canOpenURL("orderapp://open");
                                    console.log("Open supported ", supported);
                                    if (supported) {
                                        await Linking.openURL("orderapp://open");
                                    } else {
                                        Linking.openURL('https://apps.apple.com/us/app/pos365-order/id1517773105')
                                    }
                                }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{I18n.t("nhan_vien_order").toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 0 }}>
                        <Text style={{ color: "#fff" }}>{I18n.t("tong_dai_ho_tro")} 24/7</Text>
                        <TouchableOpacity onPress={actionPhone} style={{ flexDirection: "row", marginTop: 7, marginBottom: 10 }}>
                            <Image source={Images.icon_phone_header} style={{ width: 20, height: 20, marginRight: 7 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>{Constant.HOTLINE}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>

                <Snackbar
                    duration={1500}
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