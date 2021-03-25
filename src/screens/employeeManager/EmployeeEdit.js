import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, Modal, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { FlatList, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Fontisto';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { change_alias, dateToDate, dateToStringFormatUTC, dateUTCToMoment } from '../../common/Utils';
import useDebounce from '../../customHook/useDebounce';
import { Chip, Snackbar, FAB, Checkbox, RadioButton } from 'react-native-paper';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { ceil, set } from 'react-native-reanimated';
import { Metrics, Images } from '../../theme';
import DatePicker from 'react-native-date-picker';
import dialogManager from '../../components/dialog/DialogManager';

export default (props) => {
    const [user, setUser] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [typeModal, setTypeModal] = useState()
    const [date, setDate] = useState(new Date());
    const [title, setTitle] = useState()
    const dateTmp = useRef(new Date())
    const [password,setPassword] = useState('')
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
        if(user !={}){
            setTitle('sua')
        }else{
            setTitle('them')
        }
    }, [])
    const onChangeDate = (selectedDate) => {
        const currentDate = dateTmp.current;
        let date = selectedDate.getDate();
        let month = selectedDate.getMonth();
        let year = selectedDate.getFullYear();
        currentDate.setDate(date)
        currentDate.setMonth(month)
        currentDate.setFullYear(year)
        console.log("onChangeTime Date ", currentDate);
        dateTmp.current = currentDate;
    };
    const onClickOk = () => {
        let param = { User: { ...user,PlainPassword:password } }
        new HTTPService().setPath(ApiPath.USERS).POST(param).then(res => {
            if (res && res.ResponseStatus && res.ResponseStatus.Message) {
                dialogManager.showLoading()
                dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                    dialogManager.destroy();
                    dialogManager.hiddenLoading()
                    props.navigation.goBack()
                }, null, null, I18n.t('dong'))
            } else {
                if (deviceType == Constant.PHONE) {
                    handleSuccess(title)
                } else
                    props.handleSuccess(title)
            }
        })
    }
    const handleSuccess = async (type1) => {
        console.log("type", type1);
        dialogManager.showLoading()
        try {
            dialogManager.showPopupOneButton(`${I18n.t(type1)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }

    const renderModal = () => {
        return (
            <View>
                {
                    typeModal == 1 ?
                        <View style={{borderWidth:0.5,borderRadius:10}}>
                            <Text style={{ textAlign: 'center', paddingVertical: 10 }}>{I18n.t('chon_nhom')}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { setUser({ ...user, IsAdmin: false }), setShowModal(false) }} >
                                    <Icons name={user.IsAdmin == false ? 'radiobox-marked' : 'radiobox-blank'} style={{ marginRight: 10, marginLeft: 10 }} size={20} color={colors.colorchinh}
                                    />
                                    <Text>{I18n.t('nhan_vien')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { setUser({ ...user, IsAdmin: true }), setShowModal(false) }} >
                                    <Icons name={user.IsAdmin == true ? 'radiobox-marked' : 'radiobox-blank'} style={{ marginRight: 10, marginLeft: 10 }} size={20} color={colors.colorchinh}
                                    />
                                    <Text>{I18n.t('quan_ly')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View> :
                        typeModal == 2 ?
                            <View style={{ alignItems: "center", backgroundColor: "#fff" }}>
                                <DatePicker date={date}
                                    onDateChange={onChangeDate}
                                    mode={'date'}
                                    display="default"
                                    locale="vi-VN" />
                                <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 5, backgroundColor: '#36a3f7', paddingHorizontal: 40, marginBottom: 10, borderRadius: 10 }} onPress={() => { setShowModal(false), setUser({ ...user, DOB: dateUTCToMoment(dateTmp.current) }) }}>
                                    <Text style={{ color: '#fff' }}>Ok</Text>
                                </TouchableOpacity>
                            </View>
                            : null
                }
            </View>
        )
    }
    return (
        <View>
            {
                deviceType == Constant.PHONE ?
                    <ToolBarDefault
                        {...props}
                        title={user.Name}
                    /> : null
            }
            <ScrollView>
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: '#fff' }}>
                    <Image source={Images.icon_employee} style={{ width: 100, height: 100 }} />
                </View>
                <View style={{ marginTop: 10, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('ten_dang_nhap')}</Text>
                    <TextInput style={styles.styleTextIput} value={user.UserName} onChangeText={(text) => setUser({ ...user, UserName: text })}></TextInput>
                    <Text>{I18n.t('mat_khau')}</Text>
                    <TextInput style={[styles.styleTextIput, {}]} value={password} autoCompleteType={'password'} onChangeText={(text) => setPassword(text)}></TextInput>
                    <Text>{I18n.t('ten_nhan_vien')}</Text>
                    <TextInput style={styles.styleTextIput} value={user.Name} onChangeText={text => setUser({ ...user, Name: text })}></TextInput>
                    <Text>{I18n.t('ngay_sinh')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.styleTextIput, { flex: 9 }]} >{user.DOB ? dateToDate(user.DOB) : ''}</Text>
                        <TouchableOpacity style={{ flex: 1, marginLeft: 10 }} onPress={() => { setTypeModal(2), setShowModal(true) }}>
                            <Icons name={'calendar-month'} size={24} color={'#36a3f7'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ marginTop: 10, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>Email</Text>
                    <TextInput style={styles.styleTextIput} value={user.Email} onChangeText={(text) => setUser({ ...user, Email: text })}></TextInput>
                    <Text>{I18n.t('so_dien_thoai')}</Text>
                    <TextInput style={styles.styleTextIput} value={user.Phone} onChangeText={(text) => setUser({ ...user, Phone: text })}></TextInput>
                    <Text>{I18n.t('dia_chi')}</Text>
                    <TextInput style={styles.styleTextIput} value={user.Address} onChangeText={(text) => setUser({ ...user, Address: text })}></TextInput>
                </View>
                <View style={{ marginTop: 10, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('vi_tri')}</Text>
                    <TouchableOpacity onPress={() => { setShowModal(true), setTypeModal(1) }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, backgroundColor: '#f2f2f2', alignItems: 'center', borderRadius: 10, marginVertical: 10 }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#36a3f7' }}>{user.IsAdmin == false ? I18n.t('nhan_vien') : I18n.t('quan_ly')}</Text>
                            <Icons name={'menu-right'} color={'#36a3f7'} size={40} />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10, marginBottom: 44, backgroundColor: '#36a3f7', borderRadius: 10, marginVertical: 10 }} onPress={() => {
                    onClickOk()
                }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{I18n.t('ap_dung')}</Text>
                </TouchableOpacity>

                <Modal animationType='none'
                    transparent={true}
                    visible={showModal}
                    supportedOrientations={["portrait", "landscape"]}
                >
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={() => {
                                setShowModal(false)
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0
                            }}>
                            <View style={{
                                backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0
                            }}></View>

                        </TouchableWithoutFeedback>
                        <View style={styles.styleViewModal} >
                            <View style={{ width: Metrics.screenWidth * 0.8, backgroundColor: '#fff' }}>
                                {renderModal()}
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

        </View>
    )
}
const styles = StyleSheet.create({
    styleTextIput: {
        paddingVertical: 10, paddingHorizontal: 10, fontWeight: 'bold', color: '#36a3f7', backgroundColor: '#f2f2f2', borderRadius: 10, marginVertical: 10
    },
    styleViewModal: {
        alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff", borderRadius: 5,
    }
})