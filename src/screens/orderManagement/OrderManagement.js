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

    const onClickNavigation = (screen) => {
        props.navigation.navigate(screen)
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_don_hang')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.Invoice)}>
                    <Image style={styles.iconButton} source={Images.ic_danhsachdonhang} />
                    <Text style={styles.textButton}>{I18n.t('danh_sach_don_hang')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.OrderOffline)}>
                    <Image style={styles.iconButton} source={Images.ic_donhangoffline} />
                    <Text style={styles.textButton}>{I18n.t('don_hang_offline')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onClickPaymentVNPAYQR}>
                    <Image style={styles.iconButton} source={Images.ic_donhangthanhtoanvnpayqr} />
                    <Text style={styles.textButton}>{I18n.t('don_hang_cho_thanh_toan_vnpay_qr')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.RoomHistory)}>
                    <Image style={styles.iconButton} source={Images.ic_lichsuhuytrahang} />
                    <Text style={styles.textButton}>{I18n.t('lich_su_huy_tra_do')}</Text>
                </TouchableOpacity>
            </View>
            <Snackbar
                duration={1500}
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
    iconButton: { width: 40, height: 40, marginRight: 10 },
    viewContent: { paddingHorizontal: 10, margin: 10 },
    textButton: { color: colors.colorLightBlue, fontWeight: "bold" },
    button: { flexDirection: "row", marginTop: 10, width: "100%", height: 60, justifyContent: "flex-start", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingLeft: 10 },
})