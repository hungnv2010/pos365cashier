import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import realmStore from '../../data/realm/RealmStore';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';

const FLASH_ON = "flash"
const FLASH_OFF = "flash-off"

export default (props) => {

    const [flash, setFlash] = useState(FLASH_ON)
    let refQRCodeScanner = null;

    console.log('QRCode data  props ====', props);

    useEffect(() => {
        console.log("props ", props);

    }, [])

    const orientation = useSelector(state => {
        return state.Common.orientaition
    });

    const onSuccess = async e => {
        console.log("e ", e);
        if (e.data) {
            props.navigation.pop();
            props.route.params._onSelectQR(e.data, 2);
        } else {
            notifyErr()
        }
    };

    const notifyErr = () => {
        dialogManager.showPopupOneButton(I18n.t('ma_khong_hop_le'), I18n.t('thong_bao'), (res) => {
            console.log("notifyErr res ", res);
            if (refQRCodeScanner)
                refQRCodeScanner.reactivate();
        })
    }

    return (
        <View style={styles.container}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title="QRCode"
                clickLeftIcon={() => {
                    props.navigation.goBack()
                }}
                clickRightIcon={() => {
                    if (flash == FLASH_ON) {
                        setFlash(FLASH_OFF)
                    } else {
                        setFlash(FLASH_ON)
                    }
                }}
                rightIcon={flash}
            />
            <QRCodeScanner
                ref={(ref) => refQRCodeScanner = ref}
                reactivate={false}
                onRead={(e) => onSuccess(e)}
                showMarker={true}
                customMarker={
                    <View style={styles.viewCustom}>
                        <View style={styles.viewTopCustom}></View>
                        <View style={{ height: "45%", width: orientation == Constant.PORTRAIT ? Metrics.screenWidth : Metrics.screenHeight, flexDirection: 'row' }}>
                            <View style={{ backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: "5%", }}></View>
                            <View style={[{ backgroundColor: 'transparent', height: "100%", width: "90%", }, styles.rectangle]}></View>
                            <View style={{ backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: "5%", }}></View>
                        </View>
                        <View style={styles.viewBottomCustom}></View>
                    </View>
                }
                flashMode={flash != FLASH_ON ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
            />
            {/* <RNCamera
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.on}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                onBarCodeRead={({data}) => {
                    alert(JSON.stringify(data))
                }}
            /> */}
            <Text style={styles.textQRCode}>{I18n.t('quet_barcode_hoac_qrcode')}</Text>
        </View>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    rectangle: {
        borderWidth: 1,
        borderColor: "#fff",
    },
    viewCustom: { backgroundColor: 'transparent' },
    viewCenterCustom: { flex: 4.4, flexDirection: 'row' },
    // viewCenterContent: { backgroundColor: 'transparent', height: "100%", width: 8 * (Metrics.screenHeight / orientation == Constant. 22) },
    // viewCenterLeft: { backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: Metrics.screenHeight / 10 },
    // viewCenterRight: { backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: Metrics.screenHeight / 10 },
    viewBottomCustom: { flex: 3.5, backgroundColor: 'rgba(1,1,1,0.5)', height: Metrics.screenWidth / 3, width: Metrics.screenHeight },
    viewTopCustom: { backgroundColor: 'rgba(1,1,1,0.5)', flex: 2, width: Metrics.screenHeight },
    textQRCode: { position: "absolute", bottom: 20, color: "#fff", textAlign: "center", width: "100%" }
})
