import React, { useState, useEffect, useFocusEffect, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    NativeModules,
    Dimensions, ToastAndroid, NativeEventEmitter, AppState
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
import printService from './data/html/PrintService';
import { Snackbar } from 'react-native-paper';
const { Print } = NativeModules;
let time = 0;
const eventSwicthScreen = new NativeEventEmitter(Print);
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import 'moment/min/locales'

export default () => {

    const [forceUpdate, setForceUpdate] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
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
        // signalRManager.init()

        AppState.addEventListener('change', handleChangeState);

        // let currentLocale = I18n.currentLocale()
        // // const currentLocale = DeviceInfo.getDeviceLocale()
        // console.log("currentLocale ", currentLocale);
        // if (currentLocale.indexOf('vi') > -1) {
        //     I18n.locale = "vi";
        // } else {
        //     I18n.locale = "en";
        // }

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
            // let i = 0;
            const event = eventSwicthScreen.addListener('sendSwicthScreen', (text) => {
                console.log("eventSwicthScreen ", text);
                if (text.indexOf("Ok") > -1) {
                    // i = 1;
                    check = true;
                    setTimeout(() => {
                        check = false;
                    }, 2000);
                };
                // if (text.indexOf("Error") > -1) i = 0;
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
            let currentLocale = I18n.currentLocale()
            if (signalRInfo != "") {
                signalRManager.killSignalR();
                signalRManager.startSignalR();
            }
            // const currentLocale = DeviceInfo.getDeviceLocale()
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


    const clickBack = () => {
        if (time + 1000 > new Date().getTime()) {
            RNExitApp.exitApp();
        } else {
            time = new Date().getTime();
            let thongbao = "Nhấn back 2 lần nữa để thoát";
            ToastAndroid.show(thongbao, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
    }

    // const backButtonHandler = useCallback(() => {
    //     console.log(navigationRef.current, 'back buttom');
    //     if (navigationRef.current.getRootState().index == 1) {
    //         clickBack()
    //         return true
    //     }
    // }, [])



    // useEffect(() => {
    //     BackHandler.addEventListener("hardwareBackPress", backButtonHandler);

    //     return () => {
    //         BackHandler.removeEventListener("hardwareBackPress", backButtonHandler);
    //     };
    // }, [backButtonHandler]);

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

});