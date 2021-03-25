import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { FlatList, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Fontisto';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { change_alias, dateToDate, dateToStringFormatUTC } from '../../common/Utils';
import useDebounce from '../../customHook/useDebounce';
import { Chip, Snackbar, FAB, Checkbox } from 'react-native-paper';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import Images from '../../theme/Images';
import { ceil, set } from 'react-native-reanimated';
import { ScreenList } from '../../common/ScreenList';
import dialogManager from '../../components/dialog/DialogManager';

export default (props) => {
    const [user, setUser] = useState({})
    const [check, setCheck] = useState(false)
    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });
    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            const getData = (param) => {
                setUser({ ...JSON.parse(JSON.stringify(param.user)) })
            }
            getData(props.route.params)
        }
    }, [])
    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            setUser(props.userData)
        }
    }, [props.userData])
    const onClickEditUser = () =>{
        if(deviceType == Constant.PHONE){
            props.navigation.navigate(ScreenList.EmployeeEdit, { user:user })
        }
    }

    const onCLickLock = () =>{
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_' + user.IsActive == true?'khoa':'mo khoa'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                let param = {User:{...user,IsActive:!user.IsActive}}
                new HTTPService().setPath(ApiPath.USERS).POST(param)
                    .then(res => {
                        console.log('onClickDelete', res)
                        if (res && res.ResponseStatus && res.ResponseStatus.Message) {
                            dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                dialogManager.destroy();
                            }, null, null, I18n.t('dong'))
                        } else {
                            if (deviceType == Constant.PHONE) {
                                setUser({...user,IsActive:!user.IsActive})
                            } else
                                props.handleSuccess('xoa')
                        }
                    })
                    .catch(err => console.log('onClickDelete err', err))
            }
        })
    }

    const clickLogoutDevice = () =>{
        setCheck(true)
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_dang_xuat_tai_khoan'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(ApiPath.USERS + `/${user.Id}/kick`).POST()
                    .then(res => {
                        if (res && res.ResponseStatus && res.ResponseStatus.Message) {
                            dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                dialogManager.destroy();
                                setCheck(false)
                            }, null, null, I18n.t('dong'))
                        } else {
                            if (deviceType == Constant.PHONE) {
                                setCheck(false)
                                console.log(res);
                            } else
                                setCheck(false)
                                console.log(res);
                        }
                    })
                    .catch(err => console.log('onClickDelete err', err))
            }
        })

    }
    return (
        <View style={{}}>
            {deviceType == Constant.PHONE ?
                <ToolBarDefault
                    {...props}
                    title={user.Name}
                /> : null}
            <View style={{ backgroundColor: '#fff', marginTop: deviceType == Constant.PHONE ? 10 : 0 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }}>
                    <Image source={Images.icon_employee} style={{ width: 100, height: 100 }} />
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: 50 }}>
                    <View style={{ flex: 1, marginRight: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={()=>onClickEditUser()}>
                            <Image source={Images.icon_edit} style={{ width: 16, height: 16 }} />
                            <Text style={{ marginLeft: 8, color: '#f6871e', fontSize: 16 }}>{I18n.t('chinh_sua')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={()=> onCLickLock()}>
                            <Ionicons name={user.IsActive == false ? 'unlocked' : 'locked'} size={17} color={user.IsActive == false ? '#00c75f' : '#f21e3c'} />
                            <Text style={{ marginLeft: 8, color: user.IsActive == true ? '#f21e3c' : '#00c75f', fontSize: 16 }}>{user.IsActive == true ? I18n.t('khoa') : I18n.t('mo_khoa')}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={{ marginTop: 20, paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('ma_nhan_vien')}</Text>
                    <Text style={styles.styleBold}>{user.Id}</Text>
                </View>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('ten_nhan_vien')}</Text>
                    <Text style={styles.styleBold}>{user.Name}</Text>
                </View>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('ten_dang_nhap')}</Text>
                    <Text style={{}}>{user.UserName}</Text>
                </View>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('ngay_sinh')}</Text>
                    <Text style={{}}>{user.DOB ? dateToDate(user.DOB) : ''}</Text>
                </View>
            </View>
            <View style={{ marginTop: 10, paddingVertical: 10, backgroundColor: '#fff' }}>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('so_dien_thoai')}</Text>
                    <Text style={{}}>{user.Phone}</Text>
                </View>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>Email</Text>
                    <Text style={{}}>{user.Email}</Text>
                </View>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('dia_chi')}</Text>
                    <Text style={{}}>{user.Address}</Text>
                </View>
            </View>
            <View style={{ marginTop: 10, backgroundColor: '#fff' }}>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('trang_thai')}</Text>
                    <Text style={[styles.styleBold, { color: user.IsActive == true ? '#00c75f' : '#f21e3c' }]}>{user.IsActive == true ? I18n.t('hoat_dong') : I18n.t('khoa')}</Text>
                </View>
                <View style={{ paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={styles.styleTitle}>{I18n.t('vi_tri')}</Text>
                    <Text style={{}}>{user.IsAdmin == false? I18n.t('nhan_vien'): I18n.t('quan_li')}</Text>
                </View>
                <TouchableOpacity style={{ marginHorizontal: 13, justifyContent: 'center', paddingVertical: 15, alignItems: 'center', borderColor: '#36a3f7', borderRadius: 10, borderWidth: 1, marginVertical: 15 }}>
                    <Text style={styles.styleBold}>{I18n.t('thiet_lap_quyen')}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', paddingVertical: 10, marginHorizontal: 13, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => clickLogoutDevice()}>
                        <Icons name={check == false ? 'checkbox-blank-outline' : 'checkbox-marked-outline'} size={24} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 10 }}>{I18n.t('dang_xuat_tai_khoan_tren_cac_thiet_bi_dang_dung')}</Text>
                </View>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    styleTitle: {
        color: '#c3c3c3', fontSize: 16
    },
    styleBold: {
        fontWeight: 'bold', color: '#36a3f7',
        fontSize: 16
    }
})