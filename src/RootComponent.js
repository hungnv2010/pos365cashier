import React, { useState, useEffect, useFocusEffect, useCallback } from 'react';
import {
    StyleSheet,
    NativeModules,
    Dimensions, ToastAndroid, NativeEventEmitter, AppState, View, Text
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './navigator/stack/StackNavigation';
import { useDispatch } from 'react-redux';
import { Constant } from './common/Constant'
import { navigationRef } from './navigator/NavigationService';
import RNExitApp from "react-native-exit-app";
import I18n from './common/language/i18n'
import signalRManager, { signalRInfo } from './common/SignalR';
import { getFileDuLieuString } from './data/fileStore/FileStorage';
import { Snackbar } from 'react-native-paper';
import NetInfo from "@react-native-community/netinfo";
const { Print } = NativeModules;
let time = 0;
const eventSwicthScreen = new NativeEventEmitter(Print);
import moment from 'moment';
import 'moment/min/locales'
import { Metrics } from './theme';

var numberInternetReachable = 0;

export default () => {

    const [forceUpdate, setForceUpdate] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [netInfo, setNetInfo] = useState(true);
    const [showStatusInternet, setShowStatusInternet] = useState(false);
    const dispatch = useDispatch();

    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;

    const isPortrait = () => {
        const dim = Dimensions.get("screen");
        return dim.height >= dim.width ? Constant.PORTRAIT : Constant.LANDSCAPE;
    }

    const isTablet = () => {
        return (aspectRatio <= 1.6) ? Constant.TABLET : Constant.PHONE;
    }

    useEffect(() => {
        const savePrinter = async () => {
            let setting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            if (setting && setting != "") {
                setting = JSON.parse(setting);
                console.log("savePrinter setting ", setting);
                let objectPrint = {}
                setting.Printer.forEach(element => {
                    objectPrint[element.key] = element.ip;
                });
                console.log("savePrinter objectPrint ", objectPrint);
                dispatch({ type: 'SETTING_OBJECT', printerObject: objectPrint })
            }
        }
        savePrinter()

        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected == true && state.isInternetReachable == true) {
                setNetInfo(true)
                setTimeout(() => {
                    setShowStatusInternet(false)
                }, 1500);
            } else {
                if (numberInternetReachable > 0) {
                    setNetInfo(false)
                    setShowStatusInternet(true)
                }
            }
            numberInternetReachable++;
        });

    }, [])

    useEffect(() => {
        // signalRManager.init()

        AppState.addEventListener('change', handleChangeState);

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
        let check = false;
        const printListenner = () => {
            const event = eventSwicthScreen.addListener('sendSwicthScreen', (text) => {
                console.log("eventSwicthScreen ", text);
                if (text.indexOf("Ok") > -1) {
                    check = true;
                    setTimeout(() => {
                        check = false;
                    }, 2000);
                };
                if ((text.indexOf("Error") > -1) && check == false) {
                    setToastDescription(I18n.t('kiem_tra_ket_noi_may_in') + " " + text.split("::")[0])
                    setShowToast(true)
                }
            });
        }
        getCurrentIP()
        printListenner()


        return () => {
            AppState.removeEventListener('change', handleChangeState);
            eventSwicthScreen.removeListener();
        }


    }, [])

    const handleChangeState = (newState) => {
        if (newState === "active") {
            if (signalRInfo != "") {
                signalRManager.killSignalR();
                signalRManager.startSignalR();
            }
            let currentLocale = I18n.currentLocale()
            console.log("currentLocale ", currentLocale);
            if (currentLocale.indexOf('vi') > -1) {
                I18n.locale = "vi";
                moment.locale('vi');
            } else {
                I18n.locale = "en";
                moment.locale('en');
            }
        }
    }

    const handleChange = () => {
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })
    }

    useEffect(() => {
        Dimensions.addEventListener('change', handleChange)
        return () => {
            Dimensions.removeEventListener('change', handleChange)
        }
    })

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
                duration={5000}
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