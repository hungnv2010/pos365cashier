import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService, URL } from '../../data/services/HttpService';
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
import NetInfo from "@react-native-community/netinfo";

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


        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            setVendorSession(JSON.parse(data));

        }

        getVendorSession();

    }, [])

    useEffect(() => {
        if (JSON.stringify(vendorSession) != "{}")
            getData()

    }, [vendorSession])

    useEffect(() => {
        console.log("useEffect dataList ", dataList);
        setTitle(I18n.t('don_hang_offline') + `[${dataList.length}]`)
    }, [dataList])

    const getData = async () => {
        let orderOffline = await realmStore.queryOrdersOffline()
        console.log("useEffect orderOffline queryOrdersOffline ", orderOffline);
        let queryString = `HostName == '${URL.link}'`;
        console.log("getData vendorSession ", JSON.stringify(vendorSession));
        queryString += (vendorSession.CurrentBranchId && vendorSession.CurrentBranchId != 0 ? ` AND BranchId == ${vendorSession.CurrentBranchId}` : '');
        orderOffline = orderOffline.filtered(queryString)
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
        let net = await NetInfo.fetch();
        if (net.isConnected == true && net.isInternetReachable == true) {
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
                new HTTPService().setPath(ApiPath.ORDERS).POST(params).then(async order => {
                    console.log("clickUpload order ", order);
                    if (order) {
                        dataManager.sentNotification(jsonContent.RoomName, I18n.t('khach_thanh_toan') + " " + currencyToString(jsonContent.Total))
                        // let row_key = `${jsonContent.RoomId}_${jsonContent.Pos}`
                        // let currentServerEvent = serverEvents.filtered(`RowKey == '${row_key}'`)[0]
                        // if (currentServerEvent) {
                        //     let serverEvent = JSON.parse(JSON.stringify(currentServerEvent));
                        //     dataManager.paymentSetServerEvent(serverEvent, {});
                        //     dataManager.updateServerEventNow(serverEvent)
                        // }
                        dataManager.deleteRow(SchemaName.ORDERS_OFFLINE, element.Id);
                        updateSuccess++;
                    }
                    dialogManager.hiddenLoading()
                    getData();
                })
                    .catch(err => {
                        console.log("clickUpload err ", err);
                        dialogManager.hiddenLoading()
                    });
            });
        } else {
            dialogManager.showPopupOneButton(I18n.t('loi_ket_noi_mang'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }

    }

    const refreshList = () => {
        setListRefreshing(true);
        getData()
    }

    const onClickItem = (item) => {

    }

    const onClickDelete = (item) => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_hoa_don'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                dataManager.deleteRow(SchemaName.ORDERS_OFFLINE, item.Id);
                getData();
            }
        })
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
                                    <TouchableOpacity
                                        style={{ marginRight: 20, marginLeft: 5 }}
                                        onPress={() => { onClickDelete(item) }}>
                                        <Image source={Images.icon_trash} style={{ width: 36, height: 36 }} />
                                    </TouchableOpacity>
                                    <View style={styles.name}>
                                        <Text style={{}}>{item.Id}</Text>
                                        <Text style={{ marginTop: 10 }}>{JSON.parse(item.Orders).Partner ? JSON.parse(item.Orders).Partner.Name : I18n.t('khach_le')}</Text>
                                    </View>
                                    <View style={styles.right}>
                                        <Text style={{ color: Colors.colorchinh }}>{currencyToString(JSON.parse(item.Orders).Total)}</Text>
                                        <Text style={{ marginTop: 10 }}>{dateUTCToDate(JSON.parse(item.Orders).PurchaseDate ? new Date(JSON.parse(item.Orders).PurchaseDate) : new Date())}</Text>
                                    </View>
                                </TouchableOpacity>)
                        })
                        : null
                }
            </ScrollView>
            <Snackbar
                duration={1500}
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
    name: { justifyContent: "center", flex: 1 },
    right: { justifyContent: "center", alignItems: "flex-end", flex: 1 },
    viewItem: { padding: 15, flexDirection: "row", justifyContent: "flex-start", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.5 },
})