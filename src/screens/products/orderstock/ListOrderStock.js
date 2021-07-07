import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, Keyboard, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import ToolBarNoteBook from '../../../components/toolbar/ToolBarNoteBook';
import OrderStockDetails from '../../../screens/products/orderstock/OrderStockDetails'
import dialogManager from '../../../components/dialog/DialogManager';
import useDebounce from '../../../customHook/useDebounce';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import CustomerToolBar from '../../../screens/customerManager/customer/CustomerToolBar';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../data/fileStore/FileStorage';
import DialogFilterOrderStock from '../../../components/dialog/DialogFilterOrderStock'
import AddOrderStock from './AddOrderStock';
import { useFocusEffect } from '@react-navigation/native';

export default (props) => {
    const orderStock = useRef([])
    const [viewData, setViewData] = useState([])
    const [defaultItem, setDefaultItem] = useState({})
    const [textSearch, setTextSearch] = useState('')
    const debouncedVal = useDebounce(textSearch)
    const [showModal, setOnShowModal] = useState(false)
    const [marginModal, setMargin] = useState(0)
    const defauTitle = useRef()
    const currentBranch = useRef()
    const [dataParam, setDataParam] = useState({})
    const [additemTab, setAddItemTab] = useState(false)
    const dateToTmp = useRef()
    const dateFromTmp = useRef()
    let arrDate = []
    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        getCurrentBranch()
        console.log("arrr", arrDate);
    }, [])
    const getCurrentBranch = async () => {
        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        currentBranch.current = JSON.parse(branch)
        getOrderStock(currentBranch.current.Id)
        console.log("branh", currentBranch.current.Id);
    }
    useEffect(() => {
        getCurrentBranch()
    }, [debouncedVal])
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

    const getOrderStock = async (idBranch, param) => {
        dialogManager.showLoading()
        let params = param ? param : { Includes: 'Partner', inlinecount: 'allpages', filter: `(substringof('${debouncedVal}',Code) and BranchId eq ${idBranch})` }
        await new HTTPService().setPath(ApiPath.ORDERSTOCK).GET(params).then(res => {
            if (res != null) {
                orderStock.current = res.results
                console.log("orderstock", res.results);
                if (res.__count > 0) {
                    res.results.forEach(el => {
                        console.log("el",el);
                        if (dateToString(el.CreatedDate) != defauTitle.current) {
                            arrDate.push({ Title: dateToString(el.CreatedDate) })
                            defauTitle.current = dateToString(el.CreatedDate)
                        }
                    })
                    defauTitle.current = undefined
                    console.log("arrr", arrDate);
                    let arrdata = []
                    arrDate.forEach(el => {
                        let arrItem = []
                        arrItem = orderStock.current.filter(item => dateToString(item.CreatedDate) == (el.Title))
                        arrdata.push({ ...el, Sum: arrItem.length })
                        arrItem.forEach(item => {
                            arrdata.push(item)
                        })
                    })
                    console.log("arr dataaaaa", arrdata);
                    setViewData([...arrdata])
                    dialogManager.hiddenLoading()
                } else {
                    setViewData([])
                    dialogManager.hiddenLoading()
                }
            } else {
                dialogManager.hiddenLoading()
            }
        })
    }
    const onClickItem = (item) => {
        setAddItemTab(false)
        setDefaultItem(item)
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.OrderStockDetails, { orderstock: item, onCallBack: CallBack })
        }
    }
    const CallBack = (type1) => {
        dialogManager.showLoading()
        try {
            setDefaultItem({})
            getOrderStock()
            if (type1) {
                dialogManager.showPopupOneButton(`${I18n.t(type1)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            }
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }
    const outEdit = (data) => {
        props.navigation.navigate(ScreenList.AddOrderStock, { ...data, onCallBack: CallBack, type: 1 })
    }

    const renderItemOrderStock = (item, index) => {
        return (
            <TouchableOpacity style={{ backgroundColor: '#fff' }} onPress={() => { onClickItem(item) }}>
                <View style={{ flexDirection: 'row', borderBottomWidth: 0.3, borderBottomColor: '#4a4a4a' }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}>
                        <Image source={Images.ic_default_orderstock} style={{ alignItems: 'center', width: 24, height: 24 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10, flex: 1 }}>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ fontWeight: 'bold' }}>{item.Code}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text>{dateUTCToDate2(item.CreatedDate)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ color: item.Status == 2 ? '#00c75f' : item.Status == 1 ? '#f6871e' : item.Status == 3 ? '#f21e3c' : null, fontWeight: 'bold', marginBottom: 10 }}>{item.Status == 2 ? I18n.t('hoan_thanh') : item.Status == 1 ? I18n.t('dang_xu_ly') : item.Status == 3 ? I18n.t('loai_bo') : null}</Text>
                            <Text>{item.Partner ? item.Partner.Name : ''}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#36a3f7', marginTop: 10 }}>{currencyToString(item.TotalPayment)}</Text>
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        )
    }
    const outputTextSearch = (value) => {
        console.log(value);
        setTextSearch(value)
    }
    const clickFilter = () => {
        setOnShowModal(true)
    }
    const setParamStatus = (data) => {
        let param
        if (data.length == 1) {
            param = `Status eq ${data[0]}`
            console.log(param);
        } else if (data.length == 2) {
            param = `(Status eq ${data[0]} or Status eq ${data[1]})`
            console.log(param);
        }
        else if (data.length == 3) {
            param = `(Status eq ${data[0]} or Status eq ${data[1]} or Status eq ${data[2]})`
            console.log(param);
        }
        return param
    }
    const setDateFrom = (data) => {
        let date = data.dateFrom
        if (data.dateFrom.getFullYear() == data.dateTo.getFullYear() && data.dateFrom.getMonth() == data.dateTo.getMonth() && data.dateFrom.getDate() == data.dateTo.getDate()) {
            //date.setDate(data.dateFrom.getDate())
            date.setHours(0)
            date.setMinutes(0)
            date.setSeconds(0)
            console.log(momentToStringDateLocal(date));
            console.log(momentToStringDateLocal(data.dateTo));

        } else {
            date = data.dateFrom
        }
        return date

    }
    const setDateTo = (data) => {
        let date = data.dateTo
        date.setHours(23)
        date.setMinutes(59)
        date.setSeconds(59)
        console.log(momentToStringDateLocal(date));
        return date
    }
    const getOutputFilter = async (data) => {
        dateFromTmp.current = data.dateFrom
        dateToTmp.current = data.dateTo
        setOnShowModal(false)
        console.log(data);
        setDataParam({ ...data, dateFrom: dateFromTmp.current, dateTo: dateToTmp.current})
        let paramSt = setParamStatus(data.Status)
        let param
        if (data.dateFrom && data.dateTo) {
            if (data.Status.length > 0)
                param = { Includes: 'Partner', inlinecount: 'allpages', ProductCode: data.ProductCode ? data.ProductCode : '', filter: `(${data.OrderStockCode ? `substringof('${data.OrderStockCode}',Code) and ` : ''} ${data.Supplier ? `PartnerId eq ${data.Supplier.Id} and ` : ''}BranchId eq ${currentBranch.current.Id} and ${paramSt} and DocumentDate ge 'datetime''${momentToStringDateLocal(setDateFrom(data))}''' and DocumentDate lt 'datetime''${momentToStringDateLocal(setDateTo(data))}''')` }
            else
                param = { Includes: 'Partner', inlinecount: 'allpages', ProductCode: data.ProductCode ? data.ProductCode : '', filter: `(${data.OrderStockCode ? `substringof('${data.OrderStockCode}',Code) and ` : ''} ${data.Supplier ? `PartnerId eq ${data.Supplier.Id} and ` : ''}BranchId eq ${currentBranch.current.Id}  and DocumentDate ge 'datetime''${momentToStringDateLocal(setDateFrom(data))}''' and DocumentDate lt 'datetime''${momentToStringDateLocal(setDateTo(data))}''')` }
        }
        else {
            if (data.Status.length > 0)
                param = { Includes: 'Partner', inlinecount: 'allpages', ProductCode: data.ProductCode ? data.ProductCode : '', filter: `(${data.OrderStockCode ? `substringof('${data.OrderStockCode}',Code) and ` : ''} ${data.Supplier ? `PartnerId eq ${data.Supplier.Id} and ` : ''}BranchId eq ${currentBranch.current.Id} and ${paramSt})` }
            else
                param = { Includes: 'Partner', inlinecount: 'allpages', ProductCode: data.ProductCode ? data.ProductCode : '', filter: `(${data.OrderStockCode ? `substringof('${data.OrderStockCode}',Code) and ` : ''} ${data.Supplier ? `PartnerId eq ${data.Supplier.Id} and ` : ''}BranchId eq ${currentBranch.current.Id}  )` }
        }
        getOrderStock(currentBranch.current.Id, param)
        console.log(param);
        console.log(data);
    }
    const renderTitle = (item, index) => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 15, borderBottomColor: '#4a4a4a', borderBottomWidth: 0.3 }}>
                <Text style={{ fontWeight: 'bold', color: '#4a4a4a' }}>{item.Title}</Text>
                <Text>{item.Sum} {I18n.t('ma_nhap_hang')}</Text>
            </View>
        )
    }
    return (
        <View style={{ flex: 1, flexDirection: deviceType == Constant.TABLET ? 'row' : 'column' }}>
            <View style={{ flex: 1 }}>
                <CustomerToolBar
                    {...props}
                    title={I18n.t('nhap_hang')}
                    iconfilter={'filter'}
                    outputTextSearch={outputTextSearch}
                    clickFilter={clickFilter}
                />
                <View style={{ flex: 1 }}>
                    {viewData.length > 0 ?
                        <FlatList
                            data={viewData}
                            renderItem={({ item, index }) => item.Title ? renderTitle(item, index) : renderItemOrderStock(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        :
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={Images.logo_365_long_color} />
                        </View>
                    }
                </View>

                {
                    allPer.PurchaseOrder_Create || allPer.IsAdmin ?
                        <FAB
                            style={styles.fab}
                            icon='plus'
                            color="#fff"
                            onPress={() => {
                                props.navigation.navigate(ScreenList.AddOrderStock, { orderstock: {}, listPr: [], paymentMethod: "", onCallBack: CallBack })
                            }}
                        />
                        :
                        null
                }

            </View>
            {
                deviceType == Constant.TABLET ? defaultItem.Id ?
                    <View style={{ flex: 1, marginLeft: 0.5 }}>
                        <OrderStockDetails allPer={allPer} iOrderStock={defaultItem} outEdit={outEdit} handleSuccessTab={CallBack} />
                    </View> :
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={Images.logo_365_long_color} />
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
                        <DialogFilterOrderStock outPutFilter={getOutputFilter} data={dataParam} />
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