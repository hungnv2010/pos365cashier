import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
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
import GroupProductDetail from '../../products/groupproduct/GroupProductDetail'
import { useFocusEffect } from '@react-navigation/native';

export default (props) => {
    const [category, setCategory] = useState({})
    const [listPr, setListPr] = useState([])
    const [dataView, setDataView] = useState([])
    const productTmp = useRef([])
    const [allPer, setPer] = useState(props.route.params.permission ? props.route.params.permission : {})
    const categoryTmp = useRef([])
    const dataTmp = useRef([])
    const [textSearch, setTextSearch] = useState()
    const debouncedVal = useDebounce(textSearch)
    const [marginModal, setMargin] = useState(0)
    const [showModal, setOnShowModal] = useState(false)
    const currentBranch = useRef({})
    const addCate = useRef([{
        Name: 'ten_nhom',
        Hint: 'nhap_ten_nhom_hang_hoa',
        Key: 'CategoryName',
        Value: '',
        isNum: false
    }])

    const { deviceType, isFNB } = useSelector(state => {
        return state.Common
    })
    useEffect(() => {
        dialogManager.showLoading()
        getDataFromRealm()
        if (isFNB) {
            getBranch()
        }
    }, [])
    const getBranch = async () => {

        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        if (branch) {
            currentBranch.current = JSON.parse(branch)
            console.log("abc", branch);
        }
    }
    const getDataFromRealm = async () => {
        productTmp.current = (await realmStore.queryProducts())
        productTmp.current = productTmp.current.filtered(`TRUEPREDICATE SORT(Id DESC) DISTINCT(Id)`)
        console.log("productTmp", productTmp.current);
        categoryTmp.current = await realmStore.queryCategories()
        getSum(categoryTmp.current, productTmp.current)

    }
    const getSum = (cate, pr) => {
        let data = []
        cate.forEach(item => {
            let list = pr
            console.log(list);
            list = list.filter(el => el.CategoryId == item.Id)
            item.Sum = list.length
            item.ListPr = list
            data.push(item)
        })
        setDataView(data)
        dataTmp.current = data
        dialogManager.hiddenLoading()
    }
    useEffect(() => {
        console.log(dataView);
    }, [dataView])
    const outputTextSearch = (value) => {
        setTextSearch(value)
    }
    useEffect(() => {
        console.log(debouncedVal);
        if (debouncedVal != '') {
            setDataView([...dataTmp.current.filter(item => change_alias(item.Name).indexOf(change_alias(debouncedVal)) > -1)])
        } else {
            setDataView(dataTmp.current)
        }
    }, [debouncedVal])
    const onClickAddItem = () => {
        setOnShowModal(true)
    }
    const addCategory = (data) => {
        addCate.current = [{
            Name: 'ten_nhom',
            Hint: 'nhap_ten_nhom_hang_hoa',
            Key: 'CategoryName',
            Value: ''
        }]
        console.log(data);
        let param = {
            Category: {
                Id: 0,
                Name: data.CategoryName,
                //ShowOnBranchId: 21883
            }
        }
        setOnShowModal(false)
        if (param.Category.Name && param.Category.Name != '') {
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
                            handleSuccess('them')
                        } else
                            handleSuccess('them', 1)
                    }
                }
            })
        } else {
            dialogManager.showLoading()
            dialogManager.showPopupOneButton(I18n.t('vui_long_nhap_day_du_thong_tin_truoc_khi_luu'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
                dialogManager.hiddenLoading()
            }, null, null, I18n.t('dong'))
        }
    }
    const handleSuccess = async (type1, stt, data) => {
        console.log("type", type1);
        dialogManager.showLoading()
        try {
            if (type1 != 'them') {
                if (deviceType == Constant.TABLET) {
                    if (data) {
                        setCategory(data)
                    } else {
                        setCategory({})
                    }
                }
                await realmStore.deleteCategory()
                setDataView({})
            }
            await dataManager.syncCategories()
            getDataFromRealm()
            dialogManager.hiddenLoading()
            dialogManager.showPopupOneButton(`${I18n.t(type1)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }
    const onClickItemCate = (item) => {
        console.log(item);
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.GroupProductDetail, { data: item, onCallBack: handleSuccess })
        } else {
            setCategory(item)
        }
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
    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2', flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
                <CustomerToolBar
                    {...props}
                    navigation={props.navigation}
                    title={I18n.t('nhom_hang_hoa')}
                    outputTextSearch={outputTextSearch}
                    size={30}
                />
                <View style={{ flex: 1 }}>
                    {
                        dataView.length > 0 ?
                            <ScrollView style={{ flex: 1 }}>{
                                dataView.map((item, index) => {
                                    return (
                                        <TouchableOpacity key={index.toString()} onPress={() => onClickItemCate(item)}>
                                            <View style={{ paddingVertical: 15, paddingHorizontal: 10, marginVertical: 2, marginHorizontal: 5, backgroundColor: '#fff', borderRadius: 10 }}>
                                                <Text style={{ fontWeight: 'bold', color: colors.colorLightBlue, fontSize: 16 }}>{item.Name}</Text>
                                                <Text style={{ color: '#bbbbbb', marginTop: 10 }}>{item.Sum} {I18n.t('hang_hoa')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                            :
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                <Image source={Images.logo_365_long_color} />
                            </View>
                    }
                </View>

                {/* {
                    allPer.create ? */}
                        <FAB
                            style={styles.fab}
                            icon='plus'
                            color="#fff"
                            onPress={() => {
                                onClickAddItem()
                            }}
                        />
                        {/* :
                        null
                } */}
            </View>
            {
                deviceType == Constant.TABLET ?
                    <View style={{ flex: 1 }}>
                        {
                            category.Id ?
                                <GroupProductDetail allPer={allPer} categoryItem={category} handleSuccessTab={handleSuccess} /> :
                                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }} >
                                    <Image source={Images.logo_365_long_color} />
                                </View>
                        }
                    </View> : null
            }
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
                        <DialogInput listItem={addCate.current} title={I18n.t('them_moi_nhom_hang_hoa')} titleButton={I18n.t('tao_nhom_hang_hoa')} outputValue={addCategory} />
                    </View>
                </View>
            </Modal>

        </View>
    )
}
const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    }
})