import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString, dateUTCToDate } from '../../common/Utils';
import realmStore, { SchemaName } from '../../data/realm/RealmStore';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import dataManager from '../../data/DataManager';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [dataList, setDataList] = useState([]);
    const [listRefreshing, setListRefreshing] = useState(false)
    const [vendorSession, setVendorSession] = useState({})
    const [title, setTitle] = useState(I18n.t('don_hang_offline'))
    const { isFNB } = useSelector(state => {
        return state.Common
    })

    useEffect(() => {
        getData()

        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            setVendorSession(JSON.parse(data));
        }

        getVendorSession();
    }, [])

    useEffect(() => {
        console.log("useEffect dataList ", dataList);
        setTitle(I18n.t('don_hang_offline') + `[${dataList.length}]`)
    }, [dataList])

    const getData = async () => {
        let orderOffline = await realmStore.queryOrdersOffline()
        let orderOfflineReverse = [];
        orderOffline.forEach(element => {
            orderOfflineReverse.push(element);
        });
        console.log("useEffect orderOffline ", orderOfflineReverse);
        setDataList(orderOfflineReverse.reverse())
        setListRefreshing(false);
    }

    const clickUpload = async () => {
        console.log("clickUpload ");
        let updateSuccess = 0;
        let updateError = 0;
        let serverEvents = await realmStore.queryServerEvents()
        dataList.forEach((element, index) => {
            dialogManager.showLoading();
            let jsonContent = JSON.parse(element.Orders)
            jsonContent.AccountId = null;
            jsonContent.Code = element.Id;
            let params = {
                QrCodeEnable: vendorSession.Settings.QrCodeEnable,
                MerchantCode: vendorSession.Settings.MerchantCode,
                MerchantName: vendorSession.Settings.MerchantName,
                DontSetTime: true,
                ExcessCashType: 0,

                Order: jsonContent,
            };

            if (!isFNB) {
                params.DeliveryBy = null;//by retain
                params.ShippingCost = 0;//by retain
                params.LadingCode = "";//by retain
                jsonContent.RoomId = null
            }
            console.log("clickUpload params ", params);

            new HTTPService().setPath(ApiPath.ORDERS, false).POST(params).then(async order => {
                console.log("clickUpload order ", order);
                if (order) {
                    dataManager.sentNotification(jsonContent.RoomName, I18n.t('khach_thanh_toan') + " " + currencyToString(jsonContent.Total))
                    let row_key = `${jsonContent.RoomId}_${jsonContent.Pos}`
                    let currentServerEvent = serverEvents.filtered(`RowKey == '${row_key}'`)[0]
                    if (currentServerEvent) {
                        let serverEvent = JSON.parse(JSON.stringify(currentServerEvent));
                        dataManager.paymentSetServerEvent(serverEvent, {});
                        dataManager.updateServerEventNow(serverEvent)
                    }
                    dataManager.deleteRow(SchemaName.ORDERS_OFFLINE, element.Id);
                    updateSuccess++;
                    dialogManager.hiddenLoading()
                }
                getData();
            }).catch(err => {
                console.log("clickUpload err ", err);
                dialogManager.hiddenLoading()
            });
        });

    }

    const refreshList = () => {
        setListRefreshing(true);
        getData()
    }

    const onClickItem = (item) => {

    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title={title}
                clickLeftIcon={() => { props.navigation.goBack() }}
                rightIcon="refresh"
                clickRightIcon={() => clickUpload()}
            />
            <ScrollView
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
                        dataList.map((item, index) => {
                            return (
                                <TouchableOpacity onPress={() => onClickItem(item)} key={index} style={styles.viewItem}>
                                    <View style={styles.name}>
                                        <Text style={{}}>{item.Id}</Text>
                                        <Text style={{ marginTop: 10 }}>{JSON.parse(item.Orders).Partner ? JSON.parse(item.Orders).Partner.Name : I18n.t('khach_le')}</Text>
                                    </View>
                                    <View style={styles.right}>
                                        <Text style={{ color: Colors.colorchinh }}>{currencyToString(JSON.parse(item.Orders).Total)}</Text>
                                        <Text style={{ marginTop: 10 }}>{dateUTCToDate(new Date(JSON.parse(item.Orders).PurchaseDate))}</Text>
                                    </View>
                                </TouchableOpacity>)
                        })
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
    name: { justifyContent: "center" },
    right: { justifyContent: "center", alignItems: "flex-end" },
    viewItem: { padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.5 },
})