import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import { useSelector } from 'react-redux';
import MainToolBar from '../main/MainToolBar';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    useEffect(() => {

    }, [])

    const onClickPaymentVNPAYQR = () => {
        props.navigation.navigate(ScreenList.PaymentPendingList)
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_don_hang')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.textButton}>{I18n.t('danh_sach_don_hang')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onClickPaymentVNPAYQR}>
                    <Text style={styles.textButton}>{I18n.t('don_hang_cho_thanh_toan_vnpay_qr')}</Text>
                </TouchableOpacity>
            </View>
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


const styles = StyleSheet.create({
    viewContent: { paddingHorizontal: 10, margin: 10 },
    textButton: { color: colors.colorLightBlue, fontWeight: "bold" },
    button: { marginTop: 10, width: "100%", height: 50, justifyContent: "center", backgroundColor: "#fff", borderRadius: 5, paddingLeft: 20 },
})