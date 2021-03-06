import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import { useSelector } from 'react-redux';
import MainToolBar from '../main/MainToolBar';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';
import dialogManager from '../../components/dialog/DialogManager'

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const { isFNB, allPer } = useSelector(state => {
        return state.Common
    })

    const [perOrder, setPerOrder] = useState({
        read: true,
        create: true,
        update: true,
        delete: true,
        import: true,
        export: true
    })
    // useEffect(() => {
    //     console.log('props room table', props);
    //     if (props.route.params.permission) {
    //         let item = props.route.params.permission.items
    //         let allPer = {}
    //         item.forEach(element => {
    //             if (element.id == "Order_Read") allPer.read = element.Checked
    //             if (element.id == "Order_Create") allPer.create = element.Checked
    //             if (element.id == "Order_Update") allPer.update = element.Checked
    //             if (element.id == "Order_Delete") allPer.delete = element.Checked
    //             if (element.id == "Order_Import") allPer.import = element.Checked
    //             if (element.id == "Order_Export") allPer.export = element.Checked
    //         });
    //         setPerOrder(allPer)
    //     }

    // }, [props.itemPer])
    useEffect(() => {
        console.log("per", perOrder);
    }, [perOrder])

    const onClickPaymentVNPAYQR = () => {
        props.navigation.navigate(ScreenList.PaymentPendingList)
    }

    const onClickNavigation = (screen,param) => {
        props.navigation.navigate(screen,param)
    }
    const onClickNavigationRoomHistory = () =>{
        if(allPer.OtherTransaction_Read || allPer.IsAdmin){
            props.navigation.navigate(ScreenList.RoomHistory)
        }else{
            dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_don_hang')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.Invoice,{allPer:perOrder})}>
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
                {isFNB ?
                    <TouchableOpacity style={styles.button} onPress={() => onClickNavigationRoomHistory()}>
                        <Image style={styles.iconButton} source={Images.ic_lichsuhuytrahang} />
                        <Text style={styles.textButton}>{I18n.t('lich_su_huy_tra_do')}</Text>
                    </TouchableOpacity>
                    : null}
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