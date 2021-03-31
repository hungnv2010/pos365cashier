import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, FlatList } from "react-native";
import I18n from '../../common/language/i18n';
import ToolBarSearch from '../../components/toolbar/ToolBarSearch'
import { currencyToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import dataManager from '../../data/DataManager';

export default (props) => {

    const [listVoucher, setListVoucher] = useState([])

    const { deviceType } = useSelector(state => {
        return state.Common
    });

    const getDataVoucher = (textSearch = "") => {
        let params = { inlinecount: "allpages", top: 20 };
        if (textSearch != "") {
            params['filter'] = `substringof('${textSearch}',Code)`
        }
        new HTTPService().setPath(ApiPath.VOUCHER).GET(params).then(async (res) => {
            console.log("getDataVoucher res ", res);
            if (res && res.results) {
                let listVoucherSelect = (deviceType == Constant.PHONE) ? props.route.params : props
                console.log("getDataVoucher props ", props);
                let list = [];
                res.results.forEach(el => {
                    if (el.Quantity > 0 && dataManager.checkEndDate(el.ExpiryDate)) {
                        el["check"] = false;
                        listVoucherSelect.listVoucher.map(item => {
                            console.log("checkList ", item.Id, el.Id);
                            if (el.Id == item.Id) {
                                el["check"] = true;
                                return;
                            }
                        })
                        list.push(el);
                    }
                })
                setListVoucher(list);
            }
        }).catch((e) => {
            console.log("getDataVoucher err ", e);
        })
    }

    useEffect(() => {
        // getDataVoucher()
    }, [])

    useEffect(() => {
        console.log("props.text ", props.text);
        if (props.text)
            getDataVoucher(props.text)
    }, [props.text])

    const outputIsSelectProduct = (textSearch) => {
        console.log("outputIsSelectProduct textSearch ", textSearch);
        getDataVoucher(textSearch);
    }

    const loadMore = () => {

    }

    const onClickItem = (item) => {
        console.log("onClickItem item ", item);
        if (deviceType == Constant.PHONE) {
            props.route.params._onSelect(item);
            props.navigation.pop()
        } else {
            console.log("onClickItem callBackSearch ", item);
            props.callBackSearch(item)
        }
    }

    const renderItemList = (item, index) => {
        return (
            <TouchableOpacity onPress={() => { onClickItem(item) }} style={[styles.item_voucher, { backgroundColor: index % 2 == 0 ? "#FFFAF0" : "#fff" }]}>
                <View key={index.toString()} style={styles.item_voucher_content}>
                    <Text style={styles.text_code}>{item.Code}</Text>
                    <Text >{item.IsPercent ? item.Value + "%" : currencyToString(item.Value)}</Text>
                </View>
                {
                    item.check == true ? <Icon name="check" size={30} color={colors.colorchinh} /> : null
                }
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {deviceType != Constant.TABLET ?
                <ToolBarSearch
                    {...props}
                    active
                    leftIcon="keyboard-backspace"
                    title={I18n.t('tim_kiem')}
                    clickLeftIcon={() => { props.navigation.goBack() }}
                    rightIcon="md-search"
                    clickRightIcon={(textSearch) => outputIsSelectProduct(textSearch)}
                />
                : null}
            <KeyboardAwareScrollView>
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    style={{ flex: 1, paddingBottom: 0, }}
                    onEndReachedThreshold={0.5}
                    onEndReached={loadMore}
                    keyExtractor={(item, index) => index.toString()}
                    data={listVoucher}
                    renderItem={({ item, index }) => renderItemList(item, index)}
                />
            </KeyboardAwareScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    },
    item_voucher: { flexDirection: "row", paddingRight: 10, alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.3 },
    item_voucher_content: { flex: 1, flexDirection: "column", padding: 10, paddingHorizontal: 10 },
    text_code: { padding: 0, marginBottom: 5, fontSize: 16, textTransform: "uppercase" },
})



