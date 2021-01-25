import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import { currencyToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import images from '../../theme/Images';
import { FAB } from 'react-native-paper';
import CustomerDetail from './customerDetail';
import MainToolBar from '../main/MainToolBar';
import { FlatList } from 'react-native-gesture-handler';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import dataManager from '../../data/DataManager';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import dialogManager from '../../components/dialog/DialogManager';
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import TextTicker from 'react-native-text-ticker';

let GUEST = {
    Id: 0,
    Name: I18n.t("khach_le"),
    Code: "KH_khach_le",
    Point: 0,
}

export default (props) => {

    const [customerData, setCustomerData] = useState([])
    const [customerItem, setCustomerItem] = useState(GUEST)
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    useEffect(() => {
        getCustomer()
    }, [])

    const onClickAddCustomer = () => {
        console.log('onClickAddCustomer');
        if (deviceType == Constant.TABLET) {
            setCustomerItem(GUEST)
        } else {
            props.navigation.navigate(ScreenList.CustomerDetailForPhone, { item: GUEST, onCallBack: handleSuccess })
        }
    }

    const getCustomer = async () => {
        dialogManager.showLoading()
        try {
            let customers = await realmStore.queryCustomer()
            customers = customers.sorted('Name')
            customers = JSON.parse(JSON.stringify(customers))
            customers = Object.values(customers)
            console.log('getCustomer', customers);
            if (customers) {
                customers.unshift(GUEST)
                setCustomerData(customers)
            }
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('getCustomer err', error);
            dialogManager.hiddenLoading()
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
                            props.navigation.navigate(ScreenList.CustomerDetailForPhone, { item: res, onCallBack: handleSuccess })
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
            if (type == 'xoa') await realmStore.deletePartner()
            await dataManager.syncPartner()
            getCustomer()
            dialogManager.showPopupOneButton(`${I18n.t(type)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }

    return (
        <View style={{ flex: 1, }}>
            {
                props.route.params._onSelect ?
                    <ToolBarDefault
                        {...props}
                        navigation={props.navigation}
                        clickLeftIcon={() => {
                            props.navigation.goBack()
                        }}
                        title={props.route.params._onSelect ? I18n.t('chon_khach_hang') : I18n.t('thanh_toan')} />
                    :
                    <MainToolBar
                        navigation={props.navigation}
                        title={I18n.t('khach_hang')}
                    />
            }
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1, }}>
                    <FlatList
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
                            <CustomerDetail
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