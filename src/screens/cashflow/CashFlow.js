import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, TextInput, FlatList, RefreshControl } from "react-native";
import { Snackbar, RadioButton, FAB } from 'react-native-paper';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import colors from '../../theme/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dialogManager from '../../components/dialog/DialogManager';
import DateTime from '../../components/filter/DateTime';
import { currencyToString, dateToStringFormatUTC, momentToStringDateLocal } from '../../common/Utils';

const TOTAL = 20;

const TYPE_MODAL = {
    ALL: 0,
    COUPON: 1,
    DATE: 2,
    METHOD: 3,
    CATEGORIES: 4,
    PARNER: 5,
    ADD_CASH_FLOW: 6
}

var OBJECT_ALL = [{
    "Id": 0,
    "Name": I18n.t('tat_ca'),
}]

export const KEY_METHOD = {
    ALL: 0,
    REVENUE: 1, // Thu
    EXPENDITURE: 2 // Chi
}

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [indexItemAccount, setIndexItemAccount] = useState(0)
    const [indexItemAccountTransactionGroups, setIndexItemAccountTransactionGroups] = useState(0)
    const [typeModal, setTypeModal] = useState(-1)
    const [listCustomer, setListCustomer] = useState([])
    const [resCashFlow, setResCashFlow] = useState({ results: [] })
    const [filter, setFilter] = useState({
        method: KEY_METHOD.ALL,
        time: "",
        account: "",
        customer: "",
        categories: ""
    })

    const listCustomerBackup = useRef([]);
    const ListCategories = useRef([]);
    const ListAccount = useRef([]);
    const outData = useRef(true);
    const filterRef = useRef({ skip: 0, top: TOTAL });

    useEffect(() => {
        getDataInRealm();
        getDataFilterFromServer();
        getDataCashFlow();
    }, [])

    const getDataCashFlow = (reset = false) => {
        let params = { skip: filterRef.current.skip, top: TOTAL, Includes: ["Group", "Partner", "AccountingTransactionGroup"] };
        let arrItemPath = [];
        if (filter.account && filter.account.Id) {
            params["AccountId"] = filter.account.Id
        }

        if (filter.method && filter.method != 0) {
            arrItemPath.push("AccountingTransactionType+eq+" + filter.method)
        }

        if (filter.time && filter.time.key) {
            if (filter.time.key == "custom") {
                let startDateFilter = momentToStringDateLocal(filter.time.startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
                let endDateFilter = momentToStringDateLocal((filter.time.endDate ? filter.time.endDate : filter.time.startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
                arrItemPath.push("TransDate+ge+'datetime''" + startDateFilter.toString().trim() + "'''")
                arrItemPath.push("TransDate+lt+'datetime''" + endDateFilter.toString().trim() + "'''")
            } else {
                arrItemPath.push("TransDate+eq+'" + filter.time.key.toString() + "'")
            }
        }

        if (filter.categories && filter.categories.Id) {
            arrItemPath.push("GroupId+eq+" + filter.categories.Id)
        }

        if (filter.customer && filter.customer.Id) {
            arrItemPath.push("PartnerId+eq+" + filter.customer.Id)
        }

        console.log("arrItemPath ", arrItemPath);
        if (arrItemPath.length > 0)
            params["filter"] = "(" + arrItemPath.join("+and+") + ")";

        console.log("getDataCashFlow params  ", params);
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.TRANSACTION).GET(params).then((res) => {
            console.log("getDataCashFlow res ", res);
            if (res) {
                if (res.status == 401) return;
                if (res.results && res.results.length > 0) {
                    outData.current = false;
                    if (reset == true) {
                        setResCashFlow({ ...res });
                    } else
                        setResCashFlow({ ...res, results: [...resCashFlow.results, ...res.results] });
                    if (res.results.length < TOTAL) {
                        outData.current = true;
                    }
                } else {
                    setResCashFlow({ ...res });
                    outData.current = true;
                }
            }
            dialogManager.hiddenLoading();
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("getDataCashFlow err ", e);
        })
    }

    const getDataFilterFromServer = () => {
        new HTTPService().setPath(ApiPath.TRANSACTION_GROUPS).GET({}).then(async (res) => {
            console.log("getDataFilterFromServer TRANSACTION_GROUPS res ", res);
            if (res && res.length > 0) {
                ListCategories.current = OBJECT_ALL.concat(res);
            }
            dialogManager.hiddenLoading();
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("getDataFilterFromServer TRANSACTION_GROUPS err ", e);
        })

        new HTTPService().setPath(ApiPath.ACCOUNT).GET({}).then(async (res) => {
            console.log("getDataFilterFromServer ACCOUNT res ", res);
            if (res && res.length > 0) {
                ListAccount.current = OBJECT_ALL.concat(res);
            }
            dialogManager.hiddenLoading();
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("getDataFilterFromServer ACCOUNT err ", e);
        })
    }

    const getDataInRealm = async () => {
        let customer = await realmStore.queryCustomer()
        console.log("getDataInRealm customer: ", customer);
        listCustomerBackup.current = customer;
    }

    const onSearchPartner = (text) => {
        let list = listCustomerBackup.current.filter(item => item.Name.indexOf(text) > -1)
        setListCustomer([...list]);
    }

    const selectMethod = (data) => {
        let obj = { ...filter, method: data }
        setFilter(obj)
    }

    const selectAccount = (data, index) => {
        setIndexItemAccount(index)
        setFilter({ ...filter, account: data })
        setTypeModal(TYPE_MODAL.ALL)

    }

    const selectCategories = (data, index) => {
        setIndexItemAccountTransactionGroups(index)
        setFilter({ ...filter, categories: data })
        setTypeModal(TYPE_MODAL.ALL)

    }

    const onClickCancelFilter = () => {
        setShowModal(false)
    }

    const onClickOkFilter = () => {
        console.log("onClickOkFilter ", filter);
        filterRef.current.skip = 0;
        setShowModal(false)
        getDataCashFlow(true);
    }

    const onClickSelectMethod = () => {
        setTypeModal(TYPE_MODAL.METHOD)
    }

    const onClickSelectCategories = () => {
        setTypeModal(TYPE_MODAL.CATEGORIES)
    }

    const onClickSelectPartner = () => {
        setListCustomer(listCustomerBackup.current)
        setTypeModal(TYPE_MODAL.PARNER)
    }

    const onClickSelectTime = () => {
        setTypeModal(TYPE_MODAL.DATE)
    }

    const onClickAddCashFlow = () => {
        setTypeModal(TYPE_MODAL.ADD_CASH_FLOW)
        setShowModal(true)
    }

    const selectPartner = (item) => {
        setFilter({ ...filter, customer: item })
        setTypeModal(TYPE_MODAL.ALL)
    }

    const outputDateTime = (item) => {
        console.log('outputDateTime', item);
        setFilter({ ...filter, time: item })
        setTypeModal(TYPE_MODAL.ALL)
    }

    const onClickItemAdd = (option) => {
        if (option == 1) {

        } else if (option == 2) {

        } else {

        }
    }

    const loadMore = () => {
        if (filterRef.current.skip < resCashFlow.__count && outData.current == false) {
            filterRef.current = {
                ...filterRef.current,
                skip: filterRef.current.skip + TOTAL
            }
            getDataCashFlow();
        }
    }

    const onRefresh = () => {
        filterRef.current = {
            ...filterRef.current,
            skip: 0
        }
        getDataCashFlow(true);
    }

    const onClickItemMenu = (item) => {
        
    }

    const onClickDeletePartner = () => {
        setFilter({ ...filter, customer: {} })
    }

    const renderTime = () => {
        return (
            <View style={{}}>
                <DateTime
                    header={<View style={{ width: "100%", backgroundColor: colors.colorchinh, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingRight: 10 }}>
                        <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>{I18n.t('ngay')}</Text>
                        <TouchableOpacity onPress={() => setTypeModal(TYPE_MODAL.ALL)}>
                            <Icon name="close" size={props.size ? props.size : 30} color="white" />
                        </TouchableOpacity>
                    </View>}
                    timeAll={true}
                    outputDateTime={outputDateTime} />
            </View>
        )
    }

    const renderSelectCoupon = () => {
        return (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => selectMethod(KEY_METHOD.ALL)} style={{ flexDirection: "row", alignItems: "center" }}>
                    <RadioButton.Android
                        status={filter.method == KEY_METHOD.ALL ? 'checked' : 'unchecked'}
                        onPress={() => selectMethod(KEY_METHOD.ALL)}
                        style={{ padding: 0, margin: 0 }}
                        color={colors.colorchinh}
                    />
                    <Text style={{ marginLeft: 0 }}>{I18n.t('tat_ca')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectMethod(KEY_METHOD.REVENUE)} style={{ flexDirection: "row", alignItems: "center" }}>
                    <RadioButton.Android
                        status={filter.method == KEY_METHOD.REVENUE ? 'checked' : 'unchecked'}
                        onPress={() => selectMethod(KEY_METHOD.REVENUE)}
                        style={{ padding: 0, margin: 0 }}
                        color={colors.colorchinh}
                    />
                    <Text style={{ marginLeft: 0 }}>{I18n.t('phieu_thu')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectMethod(KEY_METHOD.EXPENDITURE)} style={{ flexDirection: "row", alignItems: "center" }}>
                    <RadioButton.Android
                        status={filter.method == KEY_METHOD.EXPENDITURE ? 'checked' : 'unchecked'}
                        onPress={() => selectMethod(KEY_METHOD.EXPENDITURE)}
                        style={{ padding: 0, margin: 0 }}
                        color={colors.colorchinh}
                    />
                    <Text style={{ marginLeft: 0 }}>{I18n.t('phieu_chi')}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderSelectMethod = () => {
        return (
            <View>
                <View style={{ backgroundColor: colors.colorchinh, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingRight: 10 }}>
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>{I18n.t('phuong_thuc')}</Text>
                    <TouchableOpacity onPress={() => setTypeModal(TYPE_MODAL.ALL)}>
                        <Icon name="close" size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: Metrics.screenHeight * 2 / 3, padding: 5 }}>
                    {ListAccount.current.map((item, index) => {
                        return (
                            <TouchableOpacity onPress={() => selectAccount(item, index)} style={{ flexDirection: "row", alignItems: "center" }}>
                                <RadioButton.Android
                                    status={indexItemAccount == index ? 'checked' : 'unchecked'}
                                    onPress={() => selectAccount(item, index)}
                                    style={{ padding: 0, margin: 0 }}
                                    color={colors.colorchinh}
                                />
                                <Text style={{ marginLeft: 0 }}>{item.Name}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    const renderSelectCategories = () => {
        return (
            <View>
                <View style={{ backgroundColor: colors.colorchinh, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingRight: 10 }}>
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>{I18n.t('hang_muc_thu_chi')}</Text>
                    <TouchableOpacity onPress={() => setTypeModal(TYPE_MODAL.ALL)}>
                        <Icon name="close" size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: Metrics.screenHeight * 2 / 3, padding: 5 }}>
                    {ListCategories.current.map((item, index) => {
                        return (
                            <TouchableOpacity onPress={() => selectCategories(item, index)} style={{ flexDirection: "row", alignItems: "center" }}>
                                <RadioButton.Android
                                    status={indexItemAccountTransactionGroups == index ? 'checked' : 'unchecked'}
                                    onPress={() => selectCategories(item, index)}
                                    style={{ padding: 0, margin: 0 }}
                                    color={colors.colorchinh}
                                />
                                <Text style={{ marginLeft: 0 }}>{item.Name}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    const renderSelectPartner = () => {
        return (
            <View>
                <View style={{ backgroundColor: colors.colorchinh, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingRight: 10 }}>
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>{I18n.t('doi_tac')}</Text>
                    <TouchableOpacity onPress={() => setTypeModal(TYPE_MODAL.ALL)}>
                        <Icon name="close" size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{ margin: 15, backgroundColor: "#fff", borderColor: "gray", borderWidth: 0.5, borderRadius: 5, flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={"md-search"} size={25} color="black" style={{ marginLeft: 10 }} />
                        <TextInput style={{ padding: 10, flex: 1, color: "#000" }} onChangeText={(text) => { onSearchPartner(text) }} />
                    </View>
                </View>
                <ScrollView style={{ maxHeight: Metrics.screenHeight * 1.7 / 3, padding: 5 }}>
                    {listCustomer.map((item, index) => {
                        return (
                            <TouchableOpacity onPress={() => selectPartner(item)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 0.5 }}>
                                <View style={{ margin: 10, flexDirection: "column", flex: 1 }}>
                                    <Text style={{}}>{item.Name}</Text>
                                    <Text style={{ marginTop: 7 }}>{item.Code}</Text>
                                </View>
                                <View style={{ margin: 10, flexDirection: "column", flex: 1, alignItems: "flex-end" }}>
                                    <Text style={{}}>{item.Phone ? item.Phone : I18n.t('dang_cap_nhat')}</Text>
                                    <Text style={{ marginTop: 7 }}>{item.Address ? item.Address : I18n.t('dang_cap_nhat')}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    const renderAddCashFlow = () => {
        return (
            <View>
                <View style={{ backgroundColor: colors.colorchinh, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10 }}>
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>{I18n.t('them_moi_phieu_thu_chi')}</Text>
                </View>
                <View style={{ padding: 10 }}>
                    <TouchableOpacity onPress={() => onClickItemAdd(1)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                        <Text style={{ marginTop: 7 }}>{I18n.t('phieu_thu')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickItemAdd(2)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                        <Text style={{ marginTop: 7 }}>{I18n.t('phieu_chi')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickItemAdd(3)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                        <Text style={{ marginTop: 7 }}>{I18n.t('chuyen_khoan')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderFilter = () => {
        switch (typeModal) {
            case TYPE_MODAL.ALL:
                return renderContentFilter();
            case TYPE_MODAL.DATE:
                return renderTime();
            case TYPE_MODAL.METHOD:
                return renderSelectMethod();
            case TYPE_MODAL.CATEGORIES:
                return renderSelectCategories();
            case TYPE_MODAL.PARNER:
                return renderSelectPartner();
            case TYPE_MODAL.ADD_CASH_FLOW:
                return renderAddCashFlow();
            default:
                break;
        }
    }

    const renderDateTime = () => {
        console.log('renderDateTime', filter.time);
        if (filter.time) {
            if (filter.time.key != "custom") {
                return I18n.t(filter.time.name)
            } else {
                return filter.time.name
            }
        }
        return I18n.t('tat_ca')
    }

    const renderContentFilter = () => {
        return (
            <View style={{ backgroundColor: "#fff", padding: 10 }}>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 0 }}>
                    {renderSelectCoupon()}
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectTime} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>{I18n.t('ngay')}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20, alignItems: "center" }}>
                        <Text>{renderDateTime()}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectMethod} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>{I18n.t('phuong_thuc')}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <Text>{filter.account.Name ? filter.account.Name : I18n.t('tat_ca')}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectCategories} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>{I18n.t('hang_muc_thu_chi')}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <Text>{filter.categories.Name ? filter.categories.Name : I18n.t('tat_ca')}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectPartner} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>{I18n.t('doi_tac')}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <TouchableOpacity onPress={onClickDeletePartner} >
                            <Text>{filter.customer.Name ? filter.customer.Name : ""}</Text>
                        </TouchableOpacity>
                        {filter.customer.Name && filter.customer.Name != '' ?
                            <EvilIcons onPress={onClickDeletePartner} name="close" size={25} color="gray" style={{ marginLeft: 5 }} />
                            :
                            <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                        }
                    </View>
                </TouchableOpacity>
                <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" }} onPress={onClickCancelFilter}>
                        <Text style={{ textAlign: "center", color: "#000" }}>{I18n.t("huy")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" }} onPress={onClickOkFilter}>
                        <Text style={{ textAlign: "center", color: "#fff" }}>{I18n.t("dong_y")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderAccountName = (item) => {
        let view = <Text style={{ paddingTop: 10, fontSize: 12 }}>{I18n.t("tien_mat")}</Text>
        for (let element of ListAccount.current) {
            if (item.AccountId) {
                if (element.Id == item.AccountId) {
                    view = <Text style={{ paddingTop: 10, fontSize: 12 }}>{element.Name}</Text>;
                }
            }
        }
        return view;
    }

    const renderItemList = (item, index) => {
        return (
            <TouchableOpacity onPress={() => { onClickItemMenu(item) }} key={index.toString()} style={{ flexDirection: "row", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 1, paddingHorizontal: 10 }}>
                {item.AccountingTransactionType && item.AccountingTransactionType == 1 ?
                    <Image source={Images.icon_redo} style={{ width: 50, height: 50 }} />
                    :
                    <Image source={Images.icon_undo} style={{ width: 50, height: 50 }} />
                }
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ justifyContent: "center", padding: 10, flex: 1 }}>
                        <Text style={{ padding: 0, fontSize: 16, textTransform: "uppercase" }}>{item.Code}</Text>
                        {renderAccountName(item)}
                    </View>
                    <View style={{ justifyContent: "center", padding: 10, alignItems: "flex-end" }}>
                        <Text style={{ padding: 0, color: "#0072bc" }}>{item.AccountingTransactionType && item.AccountingTransactionType == 1 ? "" : "-"}{currencyToString(item.Amount)}</Text>
                        <Text style={{ paddingTop: 10, fontSize: 12 }}>{item.AccountingTransactionType && item.AccountingTransactionType == 1 ? I18n.t('phieu_thu') : I18n.t('phieu_chi')}</Text>
                        <Text style={{ paddingTop: 10, color: colors.colorchinh, fontSize: 12 }}>{dateToStringFormatUTC(item.TransDate)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.conatiner}>
            <ToolBarDefault
                leftIcon="keyboard-backspace"
                navigation={props.navigation}
                title={I18n.t('thu_chi_')}
                clickRightIcon={() => {
                    setTypeModal(TYPE_MODAL.ALL)
                    setShowModal(true)
                }}
                rightIcon="filter"
            />
            <View>
                <View style={{ padding: 0, backgroundColor: "#e7ebee", flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ marginLeft: 10, marginTop: 10, marginBottom: 5, marginRight: 5, flexDirection: "column", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, padding: 10, justifyContent: "space-between" }}>
                            <Text style={{ marginLeft: 15 }}>{I18n.t('quy_dau_ky')}</Text>
                            <Text style={{ marginLeft: 15, color: "#0072bc", marginTop: 5 }}>{currencyToString(resCashFlow.CustomVaule3)}</Text>
                        </View>
                        <View style={{ marginRight: 5, marginTop: 5, marginBottom: 10, marginLeft: 10, flexDirection: "column", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, padding: 10, justifyContent: "space-between" }}>
                            <Text style={{ marginLeft: 15 }}>{I18n.t('tong_thu')}</Text>
                            <Text style={{ marginLeft: 15, color: "#0072bc", marginTop: 5 }}>{currencyToString(resCashFlow.CustomVaule1)}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ marginLeft: 5, marginTop: 10, marginBottom: 5, marginRight: 10, flexDirection: "column", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, padding: 10, justifyContent: "space-between" }}>
                            <Text style={{ marginLeft: 15 }}>{I18n.t('tong_chi')}</Text>
                            <Text style={{ marginLeft: 15, color: "#0072bc", marginTop: 5 }}>{currencyToString(resCashFlow.CustomVaule2)}</Text>
                        </View>
                        <View style={{ marginLeft: 5, marginTop: 5, marginBottom: 10, marginRight: 10, flexDirection: "column", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, padding: 10, justifyContent: "space-between" }}>
                            <Text style={{ marginLeft: 15 }}>{I18n.t('ton_quy')}</Text>
                            <Text style={{ marginLeft: 15, color: "#0072bc", marginTop: 5 }}>{currencyToString(resCashFlow.CustomVaule1 - resCashFlow.CustomVaule2 + resCashFlow.CustomVaule3)}</Text>
                        </View>
                    </View>
                </View>
                <Text style={{ paddingHorizontal: 10, paddingVertical: 7, fontSize: 12, color: "#808080", backgroundColor: "#fff" }}>{I18n.t('tong')} {resCashFlow.results ? resCashFlow.results.length : 0}/{resCashFlow.__count} {I18n.t("phieu_thu_chi")}</Text>
            </View>
            <FlatList
                style={{ flex: 1, paddingBottom: 0, }}
                onEndReachedThreshold={0.5}
                onEndReached={loadMore}
                refreshControl={
                    <RefreshControl colors={[colors.colorLightBlue]} refreshing={false} onRefresh={() => onRefresh()} />
                }
                keyExtractor={(item, index) => index.toString()}
                data={resCashFlow.results}
                renderItem={({ item, index }) => renderItemList(item, index)}
            />
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>
                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 0,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            {renderFilter()}
                        </View>
                    </View>
                </View>
            </Modal>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
            <FAB
                style={styles.fab}
                big
                icon="plus"
                color="#fff"
                onPress={onClickAddCashFlow}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    image: { width: 70, height: 70 },
    view_item: { margin: 20, backgroundColor: "#fff", padding: 10, borderRadius: 10, flexDirection: "row", alignItems: "center" },
    view_info: { flexDirection: "column", marginLeft: 10, height: "100%" },
    title: { fontWeight: "bold", marginBottom: 10 },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    },
})