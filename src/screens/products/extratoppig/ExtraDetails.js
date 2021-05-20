import React, { useState, useCallback, useEffect, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Platform, ScrollView, TouchableWithoutFeedback, Modal, Keyboard } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import { useFocusEffect } from '@react-navigation/native';
import I18n from '../../../common/language/i18n';
import { useSelector } from 'react-redux';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import ToolBarExtraTopping from '../../../components/toolbar/ToolBarExtraTopping';
import { change_alias, currencyToString } from '../../../common/Utils';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import { Constant } from '../../../common/Constant';
import Icon from 'react-native-vector-icons/Entypo';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { RadioButton } from 'react-native-paper'
import dataManager from '../../../data/DataManager';
import dialogManager from '../../../components/dialog/DialogManager';
import NetInfo from "@react-native-community/netinfo";

export default (props) => {
    const [extraTopping, setExtraTopping] = useState({})
    const [category, setCategory] = useState([])
    const [showModal, setOnShowModal] = useState(false)
    const modalType = useRef()
    const [textInput, setTextInput] = useState('')
    const [defaultGroup, setDefaultGroup] = useState()
    const [marginModal, setMargin] = useState(0)
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });
    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            getData(props.route.params)
        }
    }, [])
    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            setExtraTopping({...JSON.parse(JSON.stringify(props.data))})
            setCategory([...JSON.parse(JSON.stringify(props.cate))])
        }
    }, [props.data, props.cate])

    const getData = (param) => {
        setExtraTopping({ ...JSON.parse(JSON.stringify(param.extra)) })
        console.log("data product", JSON.parse(JSON.stringify(param.extra)));
        setCategory([...JSON.parse(JSON.stringify(param.categoryExtra))])
        console.log("category", category);
    }
    const onClickAdd = () => {
        if(textInput!=''){
        setCategory([...category, textInput])
        setExtraTopping({...extraTopping,ExtraGroup:textInput})
        setTextInput()
        setOnShowModal(false)
        setTextInput('')
        }
        
    }
    useEffect(() => {
        setDefaultGroup(extraTopping.ExtraGroup)
    }, [extraTopping])
    const onClickSubmit = () => {
        setExtraTopping({ ...extraTopping, ExtraGroup: defaultGroup })
        setOnShowModal(false)
    }
    useFocusEffect(useCallback(() => {

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }


    }, []))

    const _keyboardDidShow = () => {
        setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }
    const onChangeTextInput = (text) => {
        console.log("onChangeTextInput text ===== ", text, props.route);
        if (text == "") {
            text = 0;
        } else {
            text = text.replace(/,/g, "");
            text = Number(text);
        }
        return text
    }
    const onClickDel = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_hang_hoa'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(ApiPath.DELETE_EXTRATOPPING).DELETE({ ProductExtraId: extraTopping.Id })
                    .then(res => {
                        console.log('onClickDelete', res)
                        if (res) {
                            if (res.ResponseStatus && res.ResponseStatus.Message) {
                                dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                    dialogManager.destroy();
                                }, null, null, I18n.t('dong'))
                            } else {
                                if (deviceType == Constant.PHONE) {
                                    props.route.params.onCallBack('xoa')
                                    props.navigation.pop()
                                } else {

                                }
                                props.handleSuccessTab('xoa')
                            }
                        }
                    })
                    .catch(err => console.log('ClickDelete err', err))
            }
        })

    }
    const onClickSubmitUpdate = async() => {
        let param = {
            ExtraId: extraTopping.Id,
            Price: extraTopping.Price,
            Quantity: extraTopping.Quantity,
            ExtraGroup: extraTopping.ExtraGroup
        }
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
        new HTTPService().setPath(`api/products/extra/updateall`).POST(param).then(res => {
            console.log("res...", res.Message);
            if (deviceType == Constant.PHONE) {
                props.route.params.onCallBack('sua')
                props.navigation.pop()
            } else {
                props.handleSuccessTab('sua')

            }
        })
    }else{
        dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
            dialogManager.destroy();
        }, null, null, I18n.t('dong'))
    }

    }

    const renderModal = () => {
        return (
            <View style={{ backgroundColor: '#fff', borderRadius: 5 }}>
                {modalType.current == 1 ?
                    <View style={{ flexDirection: 'column', padding: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' ,paddingVertical:10}}>{I18n.t('them_moi_nhom')}</Text>
                        <TextInput style={{ paddingVertical: 15, fontSize: 14, paddingHorizontal: 10,color:'#000',backgroundColor:'#f2f2f2',borderRadius:10 }} value={textInput} placeholder={I18n.t('nhap_ten_nhom')} onChangeText={(text) => setTextInput(text)}></TextInput>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                            <View style={{ flex: 1 }}></View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 10 }}>
                                <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setOnShowModal(false) }}>
                                    <Text style={{ fontSize: 14,color:colors.colorchinh }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => onClickAdd()}>
                                    <Text style={{ fontSize: 14, color:textInput!='' ? colors.colorLightBlue : '#bbbbbb' }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    : <View style={{ flexDirection: 'column', padding: 10 }}>
                        <Text style={{ fontSize: 16, textAlign: 'center', fontWeight: 'bold', paddingVertical: 10 }}>{I18n.t('chon_nhom')}</Text>
                        {
                            category.map((item, index) => {
                                return (
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <RadioButton.Android
                                            style={{ padding: 0, margin: 0 }}
                                            color='#FF4500'
                                            onPress={() => { setDefaultGroup(item) }}
                                            status={defaultGroup == item ? 'checked' : 'unchecked'}
                                        />
                                        <Text>{item}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View></View>
                            <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 20 }} onPress={() => { onClickSubmit() }}>
                                <Text style={{ color: colors.colorchinh }}>{I18n.t('dong_y')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </View>
        )
    }
    return (
        <View style={{ flex: 1, borderLeftWidth: deviceType == Constant.TABLET ? 0.5 : 0 }}>
            {deviceType == Constant.PHONE ?
                <ToolBarExtraTopping
                    {...props}
                    title={extraTopping ? extraTopping.Name : null}
                /> :
                <View style={{ backgroundColor: '#fff', height: 44, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0.3, borderColor: '#4a4a4a' }}>
                    <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: colors.colorLightBlue }}>{I18n.t('cap_nhat_extra_topping')}</Text>
                </View>
            }
            <View style={{ backgroundColor: '#fff', flexDirection: 'column', flex: 1 }}>
                <Text style={styles.styleTitle}>{I18n.t('ten_extra_topping')}</Text>
                <Text style={[styles.styleTitle, { fontWeight: 'bold', color: '#36a3f7', fontSize: 16 }]}>{extraTopping ? extraTopping.Name : ''}</Text>
                <Text style={styles.styleTitle}>{I18n.t('ten_nhom')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 }}>
                    <TouchableOpacity style={{ flex: 8, backgroundColor: '#f2f2f2', borderRadius: 10 }} onPress={() => { modalType.current = 2, setOnShowModal(true) }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 10 }}>
                            <Text style={{ color: extraTopping.ExtraGroup ? '#36a3f7' : '#000', fontWeight: 'bold' }}>{extraTopping.ExtraGroup ? extraTopping.ExtraGroup : I18n.t('chon_nhom')}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 24, height: 24 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { modalType.current = 1, setOnShowModal(true) }}>
                        <Icon name={'squared-plus'} size={40} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.styleTitle}>{I18n.t('so_luong_tru_kho_khi_ban')}</Text>
                <TextInput style={styles.styleTextInput} value={currencyToString(extraTopping.Quantity)} keyboardType={'numbers-and-punctuation'} onChangeText={(text) => setExtraTopping({ ...extraTopping, Quantity: onChangeTextInput(text) })} />
                <Text style={styles.styleTitle}>{I18n.t('gia_ban')}</Text>
                <TextInput style={styles.styleTextInput} value={currencyToString(extraTopping.Price)} keyboardType={'numbers-and-punctuation'} onChangeText={(text) => setExtraTopping({ ...extraTopping, Price: onChangeTextInput(text) })} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end',paddingHorizontal:2,marginBottom:5 }}>
                <TouchableOpacity style={{ backgroundColor: '#f21e3c',borderRadius:5, paddingHorizontal:5,paddingVertical:8, flex: 1, marginRight: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => onClickDel()}>
                    <IconMaterial name={'delete'} color={'#fff'} size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, padding: 10, flex: 9, marginLeft: 1, justifyContent: 'center', alignItems: 'center',borderRadius:5 }} onPress={() => onClickSubmitUpdate()}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16 }}>{I18n.t('xong')}</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setOnShowModal(false)
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
                    <View style={{ width: Metrics.screenWidth * 0.8 ,marginBottom: Platform.OS == 'ios' ? marginModal : 0 }}>
                        {renderModal()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTextInput: {
        paddingHorizontal: 10, paddingVertical: 15, backgroundColor: '#f2f2f2', color: '#36a3f7', fontWeight: 'bold', marginHorizontal: 10, borderRadius: 10
    },
    styleTitle: {
        paddingHorizontal: 10, paddingVertical: 10
    }
})