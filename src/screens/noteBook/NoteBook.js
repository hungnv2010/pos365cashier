import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Snackbar } from 'react-native-paper';
import ToolBarNoteBook from '../../components/toolbar/ToolBarNoteBook';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [dataList, setDataList] = useState([]);
    const [listRefreshing, setListRefreshing] = useState(false)
    let textSearch = "";
    useEffect(() => {
        const getDataNoteBook = async () => {
            getData()
        };
        getDataNoteBook();
    }, [])

    const getData = (textSearch = "") => {
        let params = { inlinecount: "allpages", top: 20 };
        if (textSearch != "") {
            params["filter"] = "substringof('" + textSearch + "',Name)";
        }
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.NOTE_BOOK).GET(params).then((res) => {
            console.log("getNoteBook res ", res);
            setListRefreshing(false);
            if (res && res.results && res.results.length > 0) {
                setDataList(res.results)
            } else {
                setDataList([])
            }
            dialogManager.hiddenLoading()
        }).catch((e) => {
            setListRefreshing(false);
            console.log("getNoteBook err ", e);
            dialogManager.hiddenLoading()
        })
    }

    const outputIsSelectProduct = (textSearch) => {
        console.log("textSearch ", textSearch);
        getData(textSearch)
    }

    const refreshList = () => {
        setListRefreshing(true);
        getData()
    }

    const onClickItem = (item) => {
        props.navigation.navigate('DetailNoteBook', { Id: item.Id, Name: item.Name })
    }

    const onClickNavigateServed = (item) => {
        let params = { inlinecount: "allpages", top: 20, Includes: "Product", NotebookId: item.Id };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.DETAIL_NOTE_BOOK).GET(params).then((res) => {
            console.log("getDetailNoteBook res ", res);
            if (res.results && res.results.length > 0) {
                props.navigation.pop();
                console.log("onClickNavigateServed ", props);
                let array = [];
                res.results.forEach((element, index) => {
                    let obj = { Quantity: element.Quantity, ...element.Product, Sid: Date.now() + index, Price: element.Price, }
                    array.push(obj)
                });
                props.route.params._onSelect(array, 2);
            }
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("getDetailNoteBook err ", e);
            dialogManager.hiddenLoading()
        })
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarNoteBook
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('so_tay_ban_hang_nhanh')}
                clickLeftIcon={() => { props.navigation.goBack() }}
                rightIcon="md-search"
                clickRightIcon={(textSearch) => outputIsSelectProduct(textSearch)}
            />
            <ScrollView style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        tintColor={Colors.colorchinh}
                        onRefresh={() => refreshList()}
                        refreshing={listRefreshing}
                    />
                }
            >
                {
                    dataList.length > 0 ?
                        dataList.map((item, index) => (
                            <View key={index} style={styles.viewItem}>
                                <TouchableOpacity onPress={() => onClickItem(item)} style={styles.name}>
                                    <Text style={{}}>{item.Name}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onClickNavigateServed(item)} style={styles.viewPlus}>
                                    <Icon name="plus" size={30} color="white" />
                                </TouchableOpacity>
                            </View>))
                        : null
                }
            </ScrollView>
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
};


const styles = StyleSheet.create({
    viewPlus: { backgroundColor: Colors.colorLightBlue, justifyContent: "center", borderRadius: 25, width: 50, height: 50, alignItems: "center" },
    name: { flex: 1, height: "100%", justifyContent: "center" },
    viewItem: { height: 60, marginHorizontal: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.5 },
})