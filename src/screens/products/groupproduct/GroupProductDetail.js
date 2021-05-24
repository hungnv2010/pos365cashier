import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarNoteBook';
import CustomerToolBar from '../../../screens/customerManager/customer/CustomerToolBar';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import dialogManager from '../../../components/dialog/DialogManager';
import useDebounce from '../../../customHook/useDebounce';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';
import DialogInput from '../../../components/dialog/DialogInput'
import Ionicons from 'react-native-vector-icons/Fontisto';
import NetInfo from "@react-native-community/netinfo";

export default (props) => {
    const [data, setData] = useState({})
    const [marginModal, setMargin] = useState(0)
    const [showModal, setOnShowModal] = useState(false)
    const [inforGr, setInforGr] = useState({})
    const dataTmp = useRef({})

    let editCate = [{
        Name: 'ten_nhom',
        Hint: 'nhap_ten_nhom_hang_hoa',
        Key: 'CategoryName',
        Value: data.Name ? data.Name : '',
        isNum: false
    }]
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
            dataTmp.current = JSON.parse(JSON.stringify(props.categoryItem))
            setData({ ...dataTmp.current })
            editCate.Value = dataTmp.current.Name
            getInforGr(dataTmp.current.Id)
        }
    }, [props.categoryItem])
    const getData = (param) => {
        console.log(param);
        dataTmp.current = JSON.parse(JSON.stringify(param.data))
        setData({ ...dataTmp.current })
        editCate.Value = dataTmp.current.Name
        getInforGr(dataTmp.current.Id)
    }
    const getInforGr = (id) => {
        new HTTPService().setPath(`${ApiPath.CATEGORIES_PRODUCT}/${id}`).GET().then(res => {
            if (res != null) {
                setInforGr(res)
                console.log('res', res);
            }
        })
    }
    const onClickEditCate = () => {
        setOnShowModal(true)
    }
    const onCLickDelCate = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_nhom_hang_hoa'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(`${ApiPath.CATEGORIES_PRODUCT}/${data.Id}`).DELETE()
                    .then(res => {
                        console.log('onClickDelete', res)
                        if (res) {
                            if (res.ResponseStatus && res.ResponseStatus.Message) {
                                dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                    dialogManager.destroy();
                                }, null, null, I18n.t('dong'))
                            } else {
                                if (deviceType == Constant.PHONE) {
                                    props.route.params.onCallBack('xoa', 1)
                                    props.navigation.pop()
                                } else
                                    props.handleSuccessTab('xoa', 1)
                            }
                        }
                    })
                    .catch(err => console.log('ClickDelete err', err))
            }
        })
    }
    const editCategory = async (value) => {
        console.log(value.CategoryName);
        let param = {
            Category: {
                CreatedBy: inforGr.CreatedBy,
                CreatedDate: inforGr.CreatedDate,
                Id: inforGr.Id,
                Name: value.CategoryName,
                Position: inforGr.Position,
                RetailerId: inforGr.RetailerId
            }
        }
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
            dialogManager.showLoading()
            if (value.CategoryName != '') {
                new HTTPService().setPath(ApiPath.CATEGORIES_PRODUCT).POST(param).then(res => {
                    if (res) {
                        if (res.ResponseStatus && res.ResponseStatus.Message) {
                            dialogManager.showLoading()
                            dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                dialogManager.destroy();
                                dialogManager.hiddenLoading()
                            }, null, null, I18n.t('dong'))
                        } else {
                            if (deviceType == Constant.PHONE) {
                                props.route.params.onCallBack('them', 1)
                                handleSuccess('sua', value.CategoryName)
                            } else
                             setData({ ...data, Name: value.CategoryName })
                            props.handleSuccessTab('sua', 1,{ ...data, Name: value.CategoryName })
                        }
                    }
                })
            } else {
                dialogManager.showPopupOneButton(I18n.t('vui_long_nhap_day_du_thong_tin_truoc_khi_luu'), I18n.t('thong_bao'), () => {
                    dialogManager.destroy();
                }, null, null, I18n.t('dong'))
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
        setOnShowModal(false)
    }
    const handleSuccess = (type, name) => {
        setData({ ...data, Name: name })
        dialogManager.showPopupOneButton(`${I18n.t(type)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
        dialogManager.hiddenLoading()
    }
    return (
        <View style={{ flex: 1, borderLeftWidth: 0.3, borderColor: '#bbbbbb' }}>
            {deviceType == Constant.PHONE ?
                <ToolBarDefault
                    {...props}
                    title={I18n.t('chi_tiet_nhom_hang_hoa')}
                /> :
                <View style={{ backgroundColor: '#fff', height: 44, borderBottomWidth: 0.3, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>{I18n.t('chi_tiet_nhom_hang_hoa')}</Text>
                </View>
            }
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: '#fff' }}>
                    <View style={{ marginHorizontal: 30, marginVertical: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2', paddingVertical: 10, borderRadius: 10 }}>
                        <Image source={Images.ic_default_group} />
                        <Text style={{ color: colors.colorLightBlue, marginTop: 10, fontWeight: 'bold' }}>{data.Name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 50 }}>
                        <View style={{ flex: 1, marginRight: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => onClickEditCate()}>
                                <Image source={Images.icon_edit} style={{ width: 16, height: 16 }} />
                                <Text style={{ marginLeft: 8, color: '#f6871e', fontSize: 16 }}>{I18n.t('chinh_sua')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => onCLickDelCate()}>
                                <Ionicons name={'trash'} size={17} color={'#f21e3c'} />
                                <Text style={{ marginLeft: 8, color: '#f21e3c', fontSize: 16 }}>{I18n.t('xoa')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View>
                    <View style={{ paddingVertical: 15, paddingHorizontal: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('hang_hoa_trong_nhom')}</Text>
                        <Text style={{ fontWeight: 'bold' }}>{data.Sum}</Text>
                    </View>
                    {data.ListPr && data.ListPr.length > 0 ?
                        <ScrollView>
                            {
                                data.ListPr.map((item, index) => {
                                    return (
                                        <View style={{ backgroundColor: '#fff', marginVertical: 2, marginHorizontal: 5, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, flexDirection: 'row' }} key={index.toString()}>
                                            <Image style={{ height: 48, width: 48, borderRadius: 10 }} source={item.ProductImages && JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.ic_default_group} />
                                            <View style={{ marginLeft: 15, paddingVertical: 10 }}>
                                                <Text>{item.Name}</Text>
                                                <Text style={{ color: '#bbbbbb', marginTop: 5 }}>{item.Code}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </ScrollView> :
                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: Metrics.screenHeight / 5 }}>
                            <Image source={Images.logo_365_long_color} />
                        </View>
                    }
                </View>
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
                    <View style={[{ width: Metrics.screenWidth * 0.8 }, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]}>
                        <DialogInput listItem={editCate} title={I18n.t('cap_nhat_nhom_hang_hoa')} titleButton={I18n.t('cap_nhat')} outputValue={editCategory} />
                    </View>
                </View>
            </Modal>
        </View>
    )
}