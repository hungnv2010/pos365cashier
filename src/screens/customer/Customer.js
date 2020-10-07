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
            console.log('getCustomer', JSON.parse(JSON.stringify(customers)));
        }
        getCustomer()
    }, [])

    const onClickAddCustomer = () => {
        console.log('onClickAddCustomer');
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('khach_hang')}
            />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1, }}>
                    <Text>listCustomer</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <CustomerDetail />
                </View>
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