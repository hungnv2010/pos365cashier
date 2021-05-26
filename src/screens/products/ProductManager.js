import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import { useSelector } from 'react-redux';
import MainToolBar from '../main/MainToolBar';
import colors from '../../theme/Colors';
import { ScreenList } from '../../common/ScreenList';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dialogManager from '../../components/dialog/DialogManager';


export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    // const [perProduct, setPerProduct] = useState({
    //     read: true,
    //     create: true,
    //     update: true,
    //     delete: true,
    //     viewCost: true,
    //     updateCost: true
    // })
    // const [perImport, setPerImport] = useState({
    //     read: true,
    //     create: true,
    //     update: true,
    //     delete: true,
    //     viewCost: true,
    //     updateCost: true
    // })
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    // useEffect(() => {
    //     console.log('props product manager', props);
    //     let itemProduct = props.route.params.perProduct.items
    //     let itemImport = props.route.params.perImport.items
    //     let allPerProduct = {}
    //     let allPerImport = {}
    //     itemProduct.forEach(element => {
    //         if (element.id == "Product_Read") allPerProduct.read = element.Checked
    //         if (element.id == "Product_Create") allPerProduct.create = element.Checked
    //         if (element.id == "Product_Update") allPerProduct.update = element.Checked
    //         if (element.id == "Product_Delete") allPerProduct.delete = element.Checked
    //         if (element.id == "Product_ViewCost") allPerProduct.viewCost = element.Checked
    //         if (element.id == "Product_UpdateCost") allPerProduct.updateCost = element.Checked
    //     });
    //     itemImport.forEach(element => {
    //         if (element.id == "PurchaseOrder_Read") allPerImport.read = element.Checked
    //         if (element.id == "PurchaseOrder_Create") allPerImport.create = element.Checked
    //         if (element.id == "PurchaseOrder_Update") allPerImport.update = element.Checked
    //         if (element.id == "PurchaseOrder_Delete") allPerImport.delete = element.Checked
    //         if (element.id == "PurchaseOrder_ViewCost") allPerImport.viewCost = element.Checked
    //         if (element.id == "PurchaseOrder_UpdateCost") allPerImport.updateCost = element.Checked
    //     })
    //     setPerProduct(allPerProduct)
    //     setPerImport(allPerImport)
    // }, [])

    const onClickNavigationProduct = () => {
        // if (perProduct.read) 
        props.navigation.navigate(ScreenList.Product, { permission: '' })
        // else {
        //     dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
        //         dialogManager.destroy();
        //     }, null, null, I18n.t('dong'))
        // }
    }

    const onClickNavigationExtra = () => {
        props.navigation.navigate(ScreenList.ListExtraTopping)
    }

    const onClickToListGroup = () => {
        //if (perProduct.read)
         props.navigation.navigate(ScreenList.ListGroupProduct, { permission: '' })
        // else {
        //     dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
        //         dialogManager.destroy();
        //     }, null, null, I18n.t('dong'))
        // }
    }

    const onClickListOrderStock = () => {
        // if (perImport.read)
         props.navigation.navigate(ScreenList.ListOrderStock, { permission: '' })
        // else {
        //     dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
        //         dialogManager.destroy();
        //     }, null, null, I18n.t('dong'))
        // }
    }



    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_hang_hoa')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>
                <TouchableOpacity style={styles.button} onPress={() => onClickToListGroup()}>
                    <Image style={styles.iconButton} source={Images.ic_nhomhanghoa} />
                    <Text style={styles.textButton}>{I18n.t('nhom_hang_hoa')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigationProduct()}>
                    <Image style={styles.iconButton} source={Images.ic_danhsachhanghoa} />
                    <Text style={styles.textButton}>{I18n.t('danh_sach_hang_hoa')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { onClickNavigationExtra() }}>
                    <View style={{ backgroundColor: '#36a3f7', borderRadius: 16, height: 42, width: 42, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <Icon name={'puzzle-outline'} size={21} color={'#fff'} />
                    </View>
                    <Text style={styles.textButton}>{I18n.t('thiet_lap_extra_topping')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { onClickListOrderStock() }}>
                    <Image style={styles.iconButton} source={Images.ic_nhaphang} />
                    <Text style={styles.textButton}>{I18n.t('nhap_hang')}</Text>
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
    viewContent: { paddingHorizontal: 5, margin: 5 },
    textButton: { color: colors.colorLightBlue, fontWeight: "bold" },
    button: { flexDirection: "row", marginTop: 10, width: "100%", height: 60, justifyContent: "flex-start", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingLeft: 10 },
})