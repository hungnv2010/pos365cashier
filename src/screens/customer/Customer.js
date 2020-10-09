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
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';

export default (props) => {

    const [customerData, setCustomerData] = useState([])
    const [customerItem, setCustomerItem] = useState({})
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    useEffect(() => {
        const getCustomer = async () => {
            let customers = await realmStore.queryCustomer()
            customers = JSON.parse(JSON.stringify(customers))
            customers = Object.values(customers)
            console.log('getCustomer', customers);
            if (customers) {
                setCustomerData(customers)
            }
        }
        getCustomer()
    }, [])

    const onClickAddCustomer = () => {
        console.log('onClickAddCustomer');
    }

<<<<<<< HEAD
    const onClickItemCustomer = (item) => {
        console.log('onClickItemCustomer');
        setCustomerItem({ ...item })
        if (props.route.params._onSelect) {
            props.route.params._onSelect(item);
            props.navigation.goBack()
        }
=======
    const onClickCustomerItem = (item) => {
        console.log('onClickCustomerItem', item);
        setCustomerItem({...item})
>>>>>>> ed27f2f48180aa6d1fe3c16306523ab966292e2a
    }

    const renderListItem = (item, index) => {
        return (
<<<<<<< HEAD
            <TouchableOpacity onPress={() => onClickItemCustomer(item)} key={index.toString()}
=======
            <TouchableOpacity onPress={() => onClickCustomerItem(item)} key={index.toString()}
>>>>>>> ed27f2f48180aa6d1fe3c16306523ab966292e2a
                style={{ flexDirection: "row", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 1, padding: 10 }}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                    <Image source={images.icon_bell_blue} style={{ height: 50, width: 50, marginRight: 10 }} />
                    <View style={{ flex: 1.3 }}>
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>{item.Name}</Text>
                        <Text style={{ paddingVertical: 5 }}>{item.Code}</Text>
                        <Text style={{}}>Reward Point: {currencyToString(item.Point)}</Text>
                    </View>
<<<<<<< HEAD
                    <View style={{ flex: 1 }}>
=======
                    <View style={{ flex: 1 }}></View>
                    <View style={{ flex: 1, }}>
>>>>>>> ed27f2f48180aa6d1fe3c16306523ab966292e2a
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <Image source={images.icon_bell_blue} style={{ height: 15, width: 15, }} />
                            <Text>{item.Phone != '' ? item.Phone : "No information"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Image source={images.icon_bell_blue} style={{ height: 15, width: 15, }} />
                            <Text>{item.Address != '' ? item.Address : "No information"}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
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
<<<<<<< HEAD
            /> */}
            <View style={{ flexDirection: "row", flex: 1 }}>
=======
            />
            <View style={{ flexDirection: "row", flex: 1, }}>
>>>>>>> ed27f2f48180aa6d1fe3c16306523ab966292e2a
                <View style={{ flex: 1, }}>
                    <FlatList
                        data={customerData}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <View style={{ flex: 1 }}>
                            <CustomerDetail
                                customerDetail={customerItem} />
                        </View>
                        :
                        null
                }
            </View>
            <FAB
                style={styles.fab}
                big
                icon="plus"
                color="#fff"
                onPress={onClickAddCustomer}
            />
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