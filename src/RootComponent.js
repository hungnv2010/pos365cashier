import React, { useState, useEffect, useFocusEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    NativeModules,
    Dimensions, ToastAndroid, NativeEventEmitter, AppState, View, Text, Linking, Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './navigator/stack/StackNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { Constant } from './common/Constant'
import { navigationRef } from './navigator/NavigationService';
import I18n from './common/language/i18n'
import signalRManager, { signalRInfo, isError } from './common/SignalR';
import { getFileDuLieuString, setFileLuuDuLieu } from './data/fileStore/FileStorage';
import { Snackbar } from 'react-native-paper';
import NetInfo from "@react-native-community/netinfo";
const { Print } = NativeModules;
const eventSwicthScreen = new NativeEventEmitter(Print);
import moment from 'moment';
import 'moment/min/locales'
import { DefaultSetting } from './screens/settings/Settings';
import dataManager from './data/DataManager';
import dialogManager from './components/dialog/DialogManager';
import { HTTPService } from './data/services/HttpService';
import DeviceInfo from 'react-native-device-info';

var numberInternetReachable = 0;

export default () => {

    const [forceUpdate, setForceUpdate] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [netInfo, setNetInfo] = useState(null)
    const [showStatusInternet, setShowStatusInternet] = useState(false);
    const dispatch = useDispatch();
    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;
    const hasInternet = useRef()
    const stateApp = useRef(AppState.currentState)


    const isPortrait = () => {
        const dim = Dimensions.get("screen");
        return dim.height >= dim.width ? Constant.PORTRAIT : Constant.LANDSCAPE;
    }

    const isTablet = () => {
        return (aspectRatio <= 1.6) ? Constant.TABLET : Constant.PHONE;
    }

    const checkVersionApplication = async () => {
        return new Promise((resolve) => {
            // new HTTPService().setLinkFileTinh("https://60a6046dc0c1fd00175f4f2b.mockapi.io/version").GET({}).then((res) => {
            new HTTPService().setLinkFileTinh("https://api.pos365.vn/appversion.json").GET({}).then((res) => {
                console.log("checkVersionApplication res ", res);
                if (res && res.iOS && res.iOS != "") {
                    DeviceInfo.getVersion().then(value => {
                        console.log("checkVersionApplication DeviceInfo.getVersion ", value);
                        console.log("checkVersionApplication res.iOS  ", res.iOS);

                        let arrayClientVersion = value.split(".")
                        let clientVersionNumber = arrayClientVersion.length > 0 ? arrayClientVersion[0] : 0;
                        let clientVersionDecimal = arrayClientVersion.length > 1 ? arrayClientVersion[1] : 0;

                        let arrayServerVersion = (typeof (res.iOS) === "string") ? res.iOS.split(".") : JSON.stringify(res.iOS).split(".")
                        let serverVersionNumber = arrayServerVersion.length > 0 ? arrayServerVersion[0] : 0;
                        let serverVersionDecimal = arrayServerVersion.length > 1 ? arrayServerVersion[1] : 0;

                        console.log("serverVersionNumber  ", serverVersionNumber, typeof (serverVersionNumber));
                        console.log("serverVersionDecimal  ", serverVersionDecimal, typeof (serverVersionDecimal));
                        console.log("clientVersionNumber  ", clientVersionNumber, typeof (clientVersionNumber));
                        console.log("clientVersionDecimal  ", clientVersionDecimal, typeof (clientVersionDecimal));

                        if (parseInt(clientVersionNumber) < parseInt(serverVersionNumber)) {
                            console.log("update now");
                            resolve(true);
                        } else if (parseInt(clientVersionNumber) == parseInt(serverVersionNumber) && parseInt(clientVersionDecimal) < parseInt(serverVersionDecimal)) {
                            console.log("update now");
                            resolve(true);
                        } else {
                            console.log("new application");
                            resolve(false);
                        }
                    });
                } else {
                    resolve(false);
                }
            }).catch((e) => {
                resolve(false);
                console.log(" err ", e);
            })
        })
    }

    const LinkUpdateVersionApp = () => {
        let APP_STORE = 'apps.apple.com/vn/app/pos365/id1541115617';
        Linking.openURL(("http://", "https://") + APP_STORE);
    };

    useEffect(() => {
        const updateVersionApplication = async () => {
            let status = await checkVersionApplication();
            if (status) {
                dialogManager.showPopupTwoButton(I18n.t('thong_bao_cap_nhat_phien_ban_moi'), I18n.t("thong_bao"), res => {
                    if (res == 1) {
                        LinkUpdateVersionApp()
                    }
                })
            }
        }
        updateVersionApplication()
        const savePrinter = async () => {
            let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (setting && setting != "") {
                setting = JSON.parse(setting);
                console.log("savePrinter setting ", setting);
                let objectPrint = {}
                setting.Printer.forEach(element => {
                    objectPrint[element.key] = { ip: element.ip, size: element.size };
                });
                console.log("savePrinter objectPrint ", objectPrint);
                dispatch({ type: 'PRINT_OBJECT', printerObject: objectPrint })

                if (setting.giu_man_hinh_luon_sang == true)
                    Print.keepTheScreenOn("")
                else
                    Print.keepTheScreenOff("")

            } else {
                setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify(DefaultSetting))
            }
        }
        savePrinter()

    }, [])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected == true && state.isInternetReachable == true) {
                setNetInfo(true)
                // dispatch({ type: 'NET_INFO', netInfo: true })
                setTimeout(() => {
                    setShowStatusInternet(false)
                }, 1500);
            } else {
                if (numberInternetReachable > 0) {
                    setNetInfo(false)
                    // dispatch({ type: 'NET_INFO', netInfo: false })
                    setShowStatusInternet(true)
                }
            }
            numberInternetReachable++;
        });

        return () => {
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        console.log('isError', isError);
        if (netInfo === false) {
            hasInternet.current = false
        }
        if (netInfo === true) {
            if (hasInternet.current === false) {
                if (signalRInfo != "") {
                    signalRManager.reconnect()
                }
                hasInternet.current = true
            }
        }
        console.log('netInfo', netInfo, 'hasInternet.current', hasInternet.current);
    }, [netInfo])

    useEffect(() => {
        Dimensions.addEventListener('change', handleChange)
        return () => {
            Dimensions.removeEventListener('change', handleChange)
        }
    }, [])

    useEffect(() => {

        setForceUpdate(!forceUpdate);
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })

        const getCurrentIP = async () => {
            let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
            console.log('getCurrentIP ', getCurrentIP);
            if (getCurrentIP && getCurrentIP != "") {
                let size = await getFileDuLieuString(Constant.SIZE_INPUT, true);
                if (size && size != "") {
                    Print.registerPrint(getCurrentIP + "_" + size)
                } else {
                    Print.registerPrint(getCurrentIP + "_72")
                }
            }
        }

        getCurrentIP()

    }, [])

    useEffect(() => {
        const event = eventSwicthScreen.addListener('sendSwicthScreen', (text) => {
            console.log("eventSwicthScreen ", text);
            if ((text.indexOf("Error") > -1)) {
                setToastDescription(I18n.t('kiem_tra_ket_noi_may_in') + " " + (text.split("::")[0].indexOf('null') ? "" : text.split("::")[0]))
                setShowToast(true)
            }
        });

        return () => {
            eventSwicthScreen.removeListener(event);
        }
    }, [])

    useEffect(() => {
        const setupLanguage = async () => {
            let lang = await getFileDuLieuString(Constant.LANGUAGE, true);
            console.log('lang ===  ', lang);
            if (lang && lang != "") {
                I18n.locale = lang;
                moment.locale(lang);
            } else {
                I18n.locale = "vi";
                moment.locale('vi');
                setFileLuuDuLieu(Constant.LANGUAGE, 'vi');
            }
        }
        setupLanguage()
    }, [])

    useEffect(() => {

        AppState.addEventListener('change', handleChangeState);

        return () => {
            AppState.removeEventListener('change', handleChangeState);
        }

    }, [])

    const handleChangeState = (newState) => {
        console.log('handleChangeState', newState, isError);
        dispatch({ type: 'APP_STATE', appState: newState })
        if ((stateApp.current === 'background' || stateApp.current === 'inactive') && newState === 'active') {
            if (signalRInfo != "") {
                signalRManager.reconnect()
            }
            // signalRManager.sendMessage(Constant.SERVER_EVENT)
            // dataManager.updateServerEvent(Constant.SERVER_EVENT, Constant.SERVER_EVENT.JsonContent)
            // console.log('signalRManager.sendMessage(Constant.SERVER_EVENT)', Constant.SERVER_EVENT); 
        }
        stateApp.current = newState
    }

    const handleChange = () => {
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })
    }


    return (

        <NavigationContainer ref={navigationRef}>
            {
                showStatusInternet ?
                    <View style={[styles.viewStatusInternet, { backgroundColor: netInfo ? "green" : "#ddd", }]}>
                        <Text style={{ color: netInfo ? "#fff" : "#000" }}>{netInfo ? I18n.t("da_ket_noi") : I18n.t("khong_co_ket_noi")}</Text>
                    </View>
                    : null
            }

            <StackNavigation />
            <Snackbar
                duration={1500}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    viewStatusInternet: { alignItems: "center", padding: 4 },

});