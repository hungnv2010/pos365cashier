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

let GUEST = {
    Id: -1,
    Name: "khach_le",
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
    const customerRef = useRef(null)

    useEffect(() => {
        getCustomer()
    }, [])

    const onClickAddCustomer = () => {
        console.log('onClickAddCustomer');
        setCustomerItem(GUEST)
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
        if (item.Id == -1) {
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

    const renderListItem = (item, index) => {
        return (
            <TouchableOpacity onPress={() => onClickCustomerItem(item)} key={index.toString()}
                style={[{ flexDirection: "row", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 1, padding: 10 }, item.Id == customerItem.Id ? { backgroundColor: "#F6DFCE" } : { backgroundColor: "white" }]}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                    <Image source={images.icon_bell_blue} style={{ height: 50, width: 50, marginRight: 10 }} />
                    <View style={{ flex: 1.3 }}>
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>{item.Name}</Text>
                        <Text style={{ paddingVertical: 5 }}>{item.Code}</Text>
                        <Text style={{}}>Reward Point: {currencyToString(item.Point)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <Image source={images.icon_bell_blue} style={{ height: 15, width: 15, }} />
                            <Text>{item.Phone && item.Phone != '' ? item.Phone : "No information"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Image source={images.icon_bell_blue} style={{ height: 15, width: 15, }} />
                            <Text>{item.Address && item.Address != '' ? item.Address : "No information"}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const handleSuccess = async (type) => {
        dialogManager.showLoading()
        try {
            if (type != 'delete') {
                console.log('handleSuccess');
                await dataManager.syncPartner()
                getCustomer()
            } else {
                await realmStore.deletePartner()
                await dataManager.syncPartner()
                getCustomer()
            }
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
                        title={I18n.t('thanh_toan')} />
                    :
                    <MainToolBar
                        navigation={props.navigation}
                        title={I18n.t('khach_hang')}
                    />
            }
            {/* <MainToolBar
                navigation={props.navigation}
                title={I18n.t('khach_hang')}
            /> */}
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1, }}>
                    <FlatList
                        data={customerData}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                        ref={refs => customerRef.current = refs}
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