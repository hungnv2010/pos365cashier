import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../common/Utils';

export default (props) => {

    const [dataList, setDataList] = useState([]);
    const [title, setTitle] = useState("")
    const [TotalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        console.log("props ", props);
        setTitle(props.route.params.Name)
        getData(props.route.params.Id)
    }, [])

    const getData = (Id = "") => {
        let params = { inlinecount: "allpages", top: 20, Includes: "Product", NotebookId: Id };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.DETAIL_NOTE_BOOK).GET(params).then((res) => {
            console.log("getDetailNoteBook res ", res);
            if (res && res.results && res.results.length > 0) {
                setDataList(res.results)
                let total = 0;
                res.results.forEach(element => {
                    total += element.Price * element.Quantity;
                });
                setTotalPrice(total)
            } else {
                setDataList([])
            }
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("getDetailNoteBook err ", e);
            dialogManager.hiddenLoading()
        })
    }

    return (
        <View style={styles.container}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title={title}
                clickLeftIcon={() => { props.navigation.goBack() }}
            />
            <ScrollView style={styles.container}>
                {
                    dataList.length > 0 ?
                        dataList.map(item => (
                            <TouchableOpacity style={styles.viewItem}>
                                <Text style={{}}>{item.Product.Name}</Text>
                                <View style={styles.viewPrice}>
                                    <Text style={{}}>{currencyToString(item.Price)} x </Text>
                                    <Text style={{}}>{item.Quantity}</Text>
                                </View>
                            </TouchableOpacity>))
                        : null
                }
            </ScrollView>
            <View style={styles.viewTotal}>
                <Text style={styles.textTotal}>{I18n.t('tong_thanh_tien')} </Text>
                <Text style={styles.textTotalPrice}>{currencyToString(TotalPrice)} {I18n.t('d')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    viewPrice: { marginTop: 10, flexDirection: "row" },
    textTotal: { fontWeight: "bold" },
    textTotalPrice: { color: Colors.colorchinh, fontWeight: "bold" },
    viewTotal: { margin: 10, flexDirection: "row", justifyContent: "space-between" },
    viewItem: { height: 60, marginHorizontal: 10, flexDirection: "column", justifyContent: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.5 }
})
