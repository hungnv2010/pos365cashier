
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
    const [permission, setPermission] = useState({
        read: true,
        create: true,
        update: true,
        delete: true
    })
    const [toastDescription, setToastDescription] = useState("")
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    useEffect(() => {
        console.log('propssss', props);
        if (props.route.params.permission) {
            let item = props.route.params.permission.items
            let allPer = {}
            item.forEach(element => {
                if (element.id == "Partner_Read") allPer.read = element.Checked
                if (element.id == "Partner_Create") allPer.create = element.Checked
                if (element.id == "Partner_Update") allPer.update = element.Checked
                if (element.id == "Partner_Delete") allPer.delete = element.Checked
            });
            setPermission(allPer)
        }
    }, [])

    const onClickNavigation = (screen) => {
        if (permission.read) {
            props.navigation.navigate(screen, { permission: permission })
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
                title={I18n.t('khach_hang')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>

                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.GroupCustomer)}>
                    <Image style={styles.iconButton} source={Images.ic_nhomkhachhang} />
                    <Text style={styles.textButton}>{I18n.t('nhom_khach_hang')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.Customer)}>
                    <Image style={styles.iconButton} source={Images.ic_danhsachkhachhang} />
                    <Text style={styles.textButton}>{I18n.t('danh_sach_khach_hang')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.GroupSuppier)}>
                    <Image style={styles.iconButton} source={Images.ic_nhomnhacungcap} />
                    <Text style={styles.textButton}>{I18n.t('nhom_nha_cung_cap')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigation(ScreenList.ListSupplier)}>
                    <Image style={styles.iconButton} source={Images.ic_danhsachkhachhang} />
                    <Text style={styles.textButton}>{I18n.t('danh_sach_nha_cung_cap')}</Text>
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