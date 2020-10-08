import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import IconFeather from 'react-native-vector-icons/Feather';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default (props) => {

    const [pointCurrent, setPointCurrent] = useState(100)
    const [pointUse, setPointUse] = useState(0)
    const [listVoucher, setListVoucher] = useState([])

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    const onChangeTextInput = (text) => {
        if (+text < pointCurrent)
            setPointUse(text)
    }

    const onCallBack = (data) => {
        console.log("onCallBack data ", data);
        // let check = false;
        // listVoucher.forEach(element => {
        //     if (element.Code == data.Code) {
        //         check = true;
        //     }
        // });
        // if (!check) {
        //     let list = listVoucher.push(data)
        //     setListVoucher(list)
        // }
        if (listVoucher.length > 0) {
            let filterList = listVoucher.filter(item => item.Id == data.Id)
            console.log("onCallBack filterList ", filterList);
            if (filterList.length == 0) {
                console.log("onCallBack listVoucher ", listVoucher);
                let list = listVoucher;
                list.push(data)
                console.log("onCallBack list ", list);
                setListVoucher([...list])
            }
        } else {
            setListVoucher([data])
        }
    }

    const deleteVoucher = (el) => {
        let filter = listVoucher.filter(item => item.Code != el.Code)
        setListVoucher(filter)
    }

    const renderItemList = (item, index) => {
        return (
            <View key={index.toString()} style={styles.item_voucher}>
                <View style={styles.content_text_voucher}>
                    <Text style={styles.text_code}>{item.Code}</Text>
                    <Text style={styles.text_price}>{currencyToString(item.Value)}</Text>
                </View>
                <Icon name="close" size={30} color="black" onPress={() => deleteVoucher(item)} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {deviceType != Constant.TABLET ?
                <ToolBarDefault
                    {...props}
                    navigation={props.navigation}
                    clickLeftIcon={() => {
                        props.navigation.goBack()
                    }}
                    rightIcon="check"
                    clickRightIcon={() => {
                        props.navigation.goBack()
                    }}
                    title={I18n.t('diem_voucher')}
                /> : null}
            <Surface style={styles.surface}>
                <View style={styles.row}>
                    <View style={styles.view_payment_paid}>
                        <IconFeather name="credit-card" size={20} color={colors.colorchinh} />
                        <Text style={styles.text_payment_paid}>{I18n.t('khach_phai_tra')}</Text>
                    </View>
                    <View style={styles.flex_3}></View>
                    <Text style={styles.value_payment_paid}>{currencyToString(1000)}</Text>
                </View>
            </Surface>
            <Surface style={styles.surface}>
                <View style={styles.point_row_1}>
                    <Icon name="heart" size={20} color={colors.colorchinh} />
                    <Text style={styles.text_payment_paid}>{I18n.t('diem_thuong')}</Text>
                </View>
                <View style={styles.point_row_2}>
                    <Text>{I18n.t('diem_hien_tai')}</Text>
                    <Text>{pointCurrent}</Text>
                </View>
                <View style={styles.point_row_2}>
                    <Text style={styles.flex_3}>{I18n.t('su_dung_diem')}</Text>
                    <View style={styles.flex_3}></View>
                    <TextInput
                        onChangeText={(text) => onChangeTextInput(text)}
                        value={pointUse == 0 ? "" : pointUse}
                        style={styles.text_input} />
                </View>
                <View style={styles.point_row_2}>
                    <Text>{I18n.t('so_tien_quy_doi')}</Text>
                    <Text>{currencyToString(12000)}</Text>
                </View>
            </Surface>
            <Surface style={[styles.surface, { flex: 1 }]}>
                <View style={styles.row}>
                    <View style={styles.view_payment_paid}>
                        <Icon name="star" size={20} color={colors.colorchinh} />
                        <Text style={styles.text_payment_paid}>{I18n.t('voucher')}</Text>
                    </View>
                    <TextInput
                        placeholder={I18n.t('tim_kiem')}
                        onTouchStart={() => {
                            props.navigation.navigate(ScreenList.SearchVoucher, { _onSelect: onCallBack, listVoucher: listVoucher })
                        }}
                        editable={false}
                        style={styles.text_input} />
                </View>
                <ScrollView style={{ flex: 1 }}>
                    {
                        listVoucher.length > 0 ?
                            listVoucher.map((item, index) => renderItemList(item, index))
                            : null
                    }
                </ScrollView>
            </Surface>
        </View>
    )
}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    },
    text_input: { textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 },
    text_payment_paid: { fontWeight: "bold", color: colors.colorchinh, marginLeft: 10 },
    value_payment_paid: { flex: 3, textAlign: "right", fontWeight: "bold" },
    point_row_1: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#ccc", },
    point_row_2: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", },
    flex_3: { flex: 3 },
    view_payment_paid: { flex: 3, flexDirection: "row", alignItems: "center", },
    row: { height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" },
    item_voucher: { flexDirection: "row", padding: 10, alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.3 },
    content_text_voucher: { flexDirection: "column", paddingHorizontal: 10, flex: 1 },
    text_code: { padding: 0, marginBottom: 5, textTransform: "uppercase" },
    text_price: { fontSize: 12 },
})



