import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, TextInput } from "react-native";
import { Snackbar, RadioButton } from 'react-native-paper';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import colors from '../../theme/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dialogManager from '../../components/dialog/DialogManager';

const TYPE_MODAL = {
    ALL: 0,
    COUPON: 1,
    DATE: 2,
    METHOD: 3,
    CATEGORIES: 4,
    PARNER: 5
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

    useEffect(() => {
        getDataInRealm();
        getDataFilterFromServer();
    }, [])

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
        setShowModal(false)
    }

    const onClickSelectMethod = () => {
        setTypeModal(TYPE_MODAL.METHOD)
        // setShowModal(true)
    }

    const onClickSelectCategories = () => {
        setTypeModal(TYPE_MODAL.CATEGORIES)
    }

    const onClickSelectPartner = () => {
        setListCustomer(listCustomerBackup.current)
        setTypeModal(TYPE_MODAL.PARNER)
    }

    const selectPartner = (item) => {
        setFilter({ ...filter, customer: item })
        setTypeModal(TYPE_MODAL.ALL)
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
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>Phương thức</Text>
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
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>Hạng mục thu chi</Text>
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
                    <Text style={{ flex: 1, color: "#fff", marginLeft: 10, fontWeight: "bold" }}>Đối tác</Text>
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
                                    <Text style={{}}>{item.Phone ? item.Phone : "Đang cập nhật"}</Text>
                                    <Text style={{ marginTop: 7 }}>{item.Address ? item.Address : "Đang cập nhật"}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    const renderFilter = () => {

        switch (typeModal) {
            case TYPE_MODAL.ALL:
                return renderContentFilter();
            case TYPE_MODAL.data:
                // return renderSelectMethod();
                break;
            case TYPE_MODAL.METHOD:
                return renderSelectMethod();
            case TYPE_MODAL.CATEGORIES:
                return renderSelectCategories();
            case TYPE_MODAL.PARNER:
                return renderSelectPartner();
            default:
                break;
        }
    }



    const renderContentFilter = () => {
        return (
            <View style={{ backgroundColor: "#fff", padding: 10 }}>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 7, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 0 }}>
                    {renderSelectCoupon()}
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 7, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>{I18n.t('ngay')}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <Text>{I18n.t('tat_ca')}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectMethod} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 7, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>Phương thức</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <Text>{filter.account.Name ? filter.account.Name : I18n.t('tat_ca')}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectCategories} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 7, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>Hạng mục thu chi</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <Text>{filter.categories.Name ? filter.categories.Name : I18n.t('tat_ca')}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickSelectPartner} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 7, alignItems: "center", height: 35, backgroundColor: "#eeeeee", paddingHorizontal: 10 }}>
                    <Text style={{ width: 80 }}>Đối tác</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1, borderLeftColor: "gray", borderBottomWidth: 0.5, marginLeft: 20 }}>
                        <Text>{filter.customer.Name ? filter.customer.Name : ""}</Text>
                        <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginLeft: 10 }} />
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

    return (
        <View style={styles.conatiner}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('thu_chi_')}
                clickRightIcon={() => {
                    setTypeModal(TYPE_MODAL.ALL)
                    setShowModal(true)
                }}
                rightIcon="filter"
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
    }
})