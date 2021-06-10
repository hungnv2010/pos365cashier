
import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import { useSelector } from 'react-redux';
import MainToolBar from '../main/MainToolBar';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';
import dialogManager from '../../components/dialog/DialogManager';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [permissionEndDay, setPermission] = useState(true)
    const { isFNB, allPer } = useSelector(state => {
        return state.Common
    })

    // useEffect(() => {
    //     console.log('props report', props);
    //     if(props.route.params.permission){
    //     let item = props.route.params.permission.items
    //     let per = item.filter(elm => elm.id == "EndOfDay_Read")
    //     setPermission(per[0].Checked)
    //     }
    // }, [])

    const onClickEndOfDay = (screen) => {
        if (allPer.EndOfDay_Read || allPer.IsAdmin) {
            props.navigation.navigate(screen)
        } else {
            dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('bao_cao')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>

                {/* <TouchableOpacity style={styles.button} onPress={onClickNavigation()}>
                    <Image style={styles.iconButton} source={Images.ic_donhangthanhtoanvnpayqr} />
                    <Text style={styles.textButton}>{I18n.t('don_hang_cho_thanh_toan_vnpay_qr')}</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.button} onPress={() => onClickEndOfDay(ScreenList.ReportEndDay)}>
                    <Image style={styles.iconButton} source={Images.ic_lichsuhuytrahang} />
                    <Text style={styles.textButton}>{I18n.t('bao_cao_cuoi_ngay')}</Text>
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