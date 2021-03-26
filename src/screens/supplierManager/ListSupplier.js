import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';
import { ScreenList } from '../../common/ScreenList';
import { currencyToString, change_alias } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { FAB } from 'react-native-paper';
import CustomerDetail from '../customerManager/customer/customerDetail';
import { FlatList } from 'react-native-gesture-handler';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dataManager from '../../data/DataManager';
import dialogManager from '../../components/dialog/DialogManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import TextTicker from 'react-native-text-ticker';
import useDebounce from '../../customHook/useDebounce';
import CustomerToolBar from '../customerManager/customer/CustomerToolBar';
import SupplierDetail from './SupplierDetail';

let GUEST = {
    Id: 0,
    Name: I18n.t("khach_le"),
    Code: "KH_khach_le",
    Point: 0,
}

export default (props) => {

    const [customerData, setCustomerData] = useState([])
    const [customerItem, setCustomerItem] = useState(GUEST)
    const [textSearch, setTextSearch] = useState('')
    const debouncedVal = useDebounce(textSearch)
    const backUpCustomer = useRef([])
    const { deviceType } = useSelector(state => {
        return state.Common
    });
    const currentBranch = useRef()

    // useFocusEffect(
    //     useCallback(() => {
    //         getCustomer()
    //     }, [])
    // )

    useEffect(() => {
        console.log('customer props ', props);
        getCurrentBranch()
    }, [])


    const getCurrentBranch = async () => {
        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        currentBranch.current = JSON.parse(branch)
        console.log("branh", currentBranch.current.Id);
    }

    useEffect(() => {
        const getSearchResult = async () => {
            dialogManager.showLoading()
            if (debouncedVal != '') {
                let paramFilter = `(substringof('${debouncedVal}',Code)  or substringof('${debouncedVal}',Phone) or substringof('${debouncedVal}',Name))`
                let res = await new HTTPService().setPath(ApiPath.CUSTOMER).GET({ IncludeSummary: true, inlinecount: 'allpages', GroupId: -1, Type: 1, BranchId: currentBranch.current.Id, Birthday: '', filter: paramFilter })
                console.log("abc", res);
                setCustomerData(res.results)

            } else {
                getCustomer()
            }
            dialogManager.hiddenLoading()
        }
        getSearchResult()
    }, [debouncedVal])

    const onClickAddCustomer = () => {
        console.log('onClickAddCustomer');
        if (deviceType == Constant.TABLET) {
            setCustomerItem(GUEST)
        } else {
            props.navigation.navigate(ScreenList.CustomerDetailForPhone, { item: GUEST, onCallBack: handleSuccess })
        }
    }

    const getBranchId = async () => {
        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        if (branch) {
            return (JSON.parse(branch)).Id
        }
    }

    const getCustomer = async () => {
        dialogManager.showLoading()
        let branchId = await getBranchId()
        let params = {
            GroupId: -1,
            Type: 2,
            BranchId: branchId
        }
        let res = await new HTTPService().setPath(ApiPath.CUSTOMER).GET(params)
        console.log("getCustomer res ", res);
        if (res && res.results && res.results.length > 0) {
            dialogManager.hiddenLoading()
            let listSupplier = res.results
            backUpCustomer.current = listSupplier
            setCustomerData(listSupplier)
            // await realmStore.insertDatas(SchemaName.CUSTOMER, res.Data)

        } else {
            try {
                let customers = await realmStore.queryCustomer()
                customers = customers.sorted('Name')
                customers = JSON.parse(JSON.stringify(customers))
                customers = Object.values(customers)
                console.log('getCustomer', customers);
                if (customers) {
                    customers.unshift(GUEST)
                    backUpCustomer.current = customers
                    setCustomerData(customers)
                }
                dialogManager.hiddenLoading()
            } catch (error) {
                console.log('getCustomer err', error);
                dialogManager.hiddenLoading()
            }
        }
    }



    const onClickCustomerItem = (item) => {
        if (props.route.params._onSelect) { //from customerOrder
            props.route.params._onSelect(item, 2);
            props.navigation.goBack()
        } else {
            if (item.Id == 0) {
                onClickAddCustomer()
            } else {
                let params = { Includes: 'PartnerGroupMembers' }
                new HTTPService().setPath(`${ApiPath.CUSTOMER}/${item.Id}`).GET(params).then(res => {
                    console.log('onClickCustomerItem res', res);
                    if (res) {
                        if (deviceType == Constant.TABLET) {
                            setCustomerItem(res)
                        } else {
                            console.log('onClickCustomerItem for PHONE');
                            props.navigation.navigate(ScreenList.SupplierDetailForPhone, { item: res, onCallBack: handleSuccess })
                        }
                    }
                })
            }
        }
    }

    const renderListItem = (item, index) => {
        let backgroundColor = (item.Id == customerItem.Id && deviceType == Constant.TABLET && !props.route.params._onSelect) || (props.route.params.currentCustomer && item.Id == props.route.params.currentCustomer.Id) ? "#F6DFCE" : "white"
        return (
            <TouchableOpacity onPress={() => onClickCustomerItem(item)} key={index.toString()}
                style={{ flexDirection: "row", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 1, padding: 10, backgroundColor: backgroundColor }}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                    <View style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center", backgroundColor: index % 2 == 0 ? colors.colorPhu : colors.colorLightBlue, borderRadius: 30, marginRight: 10 }}>
                        <Text style={{ color: "#fff", fontSize: 24, textTransform: "uppercase" }}>{item.Name[0]}</Text>
                    </View>
                    <View style={{ flex: 1.3 }}>
                        <Text
                            numberOfLines={1}
                            style={{ fontSize: 15, fontWeight: "bold", }}>{item.Name}</Text>
                        <Text style={{ paddingVertical: 5 }}>{item.Code}</Text>
                        <Text style={{}}>{I18n.t('diem_thuong')}: {currencyToString(item.Point)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 10 }}>
                            <Icon name="phone" size={24} color={colors.colorchinh} style={{ marginRight: 10 }} />
                            <Text>{item.Phone ? item.Phone : I18n.t('chua_cap_nhat')}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <Icon name="home" size={24} color={colors.colorchinh} style={{ marginRight: 10 }} />
                            <TextTicker>{item.Address ? item.Address : I18n.t('chua_cap_nhat')}</TextTicker>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const handleSuccess = async (type) => {
        dialogManager.showLoading()
        try {
            await realmStore.deletePartner()
            await dataManager.syncPartner()
            getCustomer()
            dialogManager.showPopupOneButton(`${I18n.t(type)} ${I18n.t('nha_cung_cap')} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }

    const outputTextSearch = (value) => {
        console.log('outputTextSearch', value);
        setTextSearch(value)
    }

    return (
        <View style={{ flex: 1, }}>
            <CustomerToolBar
                {...props}
                navigation={props.navigation}
                title={I18n.t('nha_cung_cap')}
                outputTextSearch={outputTextSearch}
                size={30}
            />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1, }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={customerData}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <FAB
                        style={styles.fab}
                        big
                        icon="plus"
                        color="#fff"
                        onPress={onClickAddCustomer}
                    />
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <View style={{ flex: 1 }}>
                            <SupplierDetail
                                customerDetail={customerItem}
                                handleSuccess={handleSuccess} />
                        </View>
                        :
                        null
                }
            </View>

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
    },
})