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


export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    const onClickNavigationProduct = () => {
        props.navigation.navigate(ScreenList.Product)
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_hang_hoa')}
                outPutTextSearch={() => { }}
            />

            <View style={styles.viewContent}>
                <TouchableOpacity style={styles.button} onPress={() => onClickNavigationProduct(ScreenList.Product)}>
                    <Image style={styles.iconButton} source={Images.ic_danhsachhanghoa} />
                    <Text style={styles.textButton}>{I18n.t('danh_sach_hang_hoa')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {onClickNavigation(ScreenList.ListExtraTopping)}}>
                    <View style={{backgroundColor:'#36a3f7',borderRadius:16, height:42,width:42,alignItems:'center',justifyContent:'center',marginRight:10}}>
                        <Icon name={'puzzle-outline'} size={21} color={'#fff'} />
                    </View>
                    <Text style={styles.textButton}>{I18n.t('thiet_lap_extra_topping')}</Text>
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