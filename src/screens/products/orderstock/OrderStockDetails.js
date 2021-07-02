import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar, FAB, Colors } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import ToolBarNoteBook from '../../../components/toolbar/ToolBarNoteBook';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu from 'react-native-material-menu';


export default (props) => {
    const [orderStock, setOrderStock] = useState({})
    const [listItem, setListItem] = useState([])
    const [quantity, setQuantity] = useState()
    const [totalprovisional, setTotalProvisional] = useState(0)
    const [methodPay, setMethodPay] = useState(I18n.t('tien_mat'))

    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            getData(props.route.params)
        }
    }, [])

    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            let data = JSON.parse(JSON.stringify(props.iOrderStock))
            setOrderStock({ ...data })
            getItemDetail(data.Id, data.AccountId)
        }
    }, [props.iOrderStock])

    const getData = (param) => {
        let data = JSON.parse(JSON.stringify(param.orderstock))
        setOrderStock({ ...data })
        getItemDetail(data.Id, data.AccountId)

    }
    useEffect(() => {
        let sum = 0
        let total = 0
        listItem.forEach(el => {
            sum += el.Quantity
            total += el.Price * el.Quantity
        })
        setQuantity(sum)
        setTotalProvisional(total)

    }, [listItem])
    const getItemDetail = async (id, accId) => {
        new HTTPService().setPath(ApiPath.DETAILFOREDIT).GET({ PurchaseOrderId: id }).then(res => {
            if (res != null) {
                setListItem([...res])
            }
        })
        new HTTPService().setPath(ApiPath.ACCOUNT + '/treeview').GET().then(res => {
            if (res != null) {
                console.log('res', res);
                if (accId && accId != "") {
                    res.forEach(el => {
                        if (el.id == accId) {
                            setMethodPay(el.text)
                        }
                    })
                } else {
                    setMethodPay(res[1].text)
                }
            }
        })

    }
    console.log("OrderStock", orderStock);
    const onClickDel = () => {
        console.log("delete", orderStock.Id);
        if (orderStock.Status != 3) {
            dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_huy_phieu_nhap_hang_nay'), I18n.t("thong_bao"), res => {
                if (res == 1) {
                    new HTTPService().setPath(`${ApiPath.ORDERSTOCK}/${orderStock.Id}/void`).DELETE()
                        .then(res => {
                            console.log('onClickDelete', res)
                            if (res) {
                                if (res.ResponseStatus && res.ResponseStatus.Message) {
                                    dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                        dialogManager.destroy();
                                    }, null, null, I18n.t('dong'))
                                } else {
                                    console.log('success');
                                    if (deviceType == Constant.PHONE) {
                                        props.route.params.onCallBack('xoa', 2)
                                        props.navigation.pop()
                                    } else
                                        props.handleSuccessTab('xoa', 2)
                                }
                            }
                        })
                        .catch(err => console.log('ClickDelete err', err))
                }
            })
        } else {
            dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_phieu_nhap_hang_nay'), I18n.t("thong_bao"), res => {
                if (res == 1) {
                    new HTTPService().setPath(`${ApiPath.ORDERSTOCK}/${orderStock.Id}`).DELETE()
                        .then(res => {
                            console.log('onClickDelete', res)
                            if (res) {
                                if (res.ResponseStatus && res.ResponseStatus.Message) {
                                    dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                        dialogManager.destroy();
                                    }, null, null, I18n.t('dong'))
                                } else {
                                    console.log('success');
                                    if (deviceType == Constant.PHONE) {
                                        props.route.params.onCallBack('xoa', 2)
                                        props.navigation.pop()
                                    } else
                                        props.handleSuccessTab('xoa', 2)
                                }
                            }
                        })
                        .catch(err => console.log('ClickDelete err', err))
                }
            })
        }
    }
    const clickBack =() =>{
        if (deviceType == Constant.PHONE) {
            props.route.params.onCallBack()
            props.navigation.pop()
        } else
            props.handleSuccessTab()
    }
    const onClickEdit = () => {
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.AddOrderStock, { orderstock: orderStock, listPr: listItem, paymentMethod: methodPay, onCallBack: CallBackEdit })
        } else {
            props.outEdit({ orderstock: orderStock, listPr: listItem, paymentMethod: methodPay })
        }
    }
    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = () => {
        _menu.hide();
    };

    const showMenu = () => {
        _menu.show();
    };
    const CallBackEdit = (os,list,method) =>{
        console.log(os,list,method);
        setOrderStock(os)
        setListItem(list)
        setMethodPay(method)
    }

    return (
        <View style={{ flex: 1, borderLeftWidth: 0.3, borderColor: '#4a4a4a' }}>
            {
                deviceType == Constant.PHONE ?
                    <ToolBarDefault
                        {...props}
                        clickLeftIcon={clickBack}
                        title={I18n.t('chi_tiet_nhap_hang')}
                    /> : null
            }
            <ScrollView>
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 15 }}>
                        <View >
                            <Text>{I18n.t('ma_nhap_hang')}</Text>
                            <Text style={{ paddingVertical: 5, textTransform: 'uppercase', fontWeight: 'bold' }}>{orderStock.Code}</Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ color: orderStock.Status == 1 ? '#f6871e' : orderStock.Status == 2 ? '#00c75f' : orderStock.Status == 3 ? '#f21e3c' : null, fontWeight: 'bold' }}>{orderStock.Status == 2 ? I18n.t('hoan_thanh') : orderStock.Status == 1 ? I18n.t('dang_xu_ly') : orderStock.Status == 3 ? I18n.t('loai_bo') : null}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, borderTopWidth: 0.3, borderColor: '#4a4a4a' }}>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('ngay_tao')}</Text>
                            <Text> {dateUTCToDate2(orderStock.CreatedDate)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('ngay_nhap')}</Text>
                            <Text> {dateUTCToDate2(orderStock.DocumentDate)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('ngay_giao')}</Text>
                            <Text></Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('ghi_chu')}</Text>
                            <Text>{orderStock.Description}</Text>
                        </View>
                    </View>
                    <View style={{ paddingVertical: 15, paddingHorizontal: 10, borderTopWidth: 0.3, borderBottomWidth: 0.3, borderColor: '#4a4a4a' }}>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('thanh_toan')}</Text>
                    </View>
                    <View style={{ backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 15 }}>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('tong_so_luong_nhap')}</Text>
                            <Text style={{ fontWeight: 'bold' }}>{currencyToString(quantity)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('tong_tam_tinh')}</Text>
                            <Text style={styles.styleValue}>{currencyToString(totalprovisional)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('chiet_khau')}</Text>
                            <Text style={styles.styleValue}>{currencyToString(orderStock.Discount)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('thue_vat')}</Text>
                            <Text style={styles.styleValue}>{currencyToString(orderStock.VAT)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('tong_cong')}</Text>
                            <Text style={styles.styleValue}>{currencyToString(orderStock.Total)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('so_tien_thanh_toan')}</Text>
                            <Text style={styles.styleValue}>{currencyToString(orderStock.TotalPayment)}</Text>
                        </View>
                        <View style={styles.styleView}>
                            <Text style={styles.styleTitle}>{I18n.t('phuong_thuc_thanh_toan')}</Text>
                            <Text style={{ textTransform: 'uppercase' }}>{methodPay}</Text>
                        </View>
                    </View>
                    <View style={{ paddingVertical: 15, paddingHorizontal: 10, borderTopWidth: 0.3, borderBottomWidth: 0.3, borderColor: '#4a4a4a' }}>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('danh_sach_hang_hoa')} ({listItem.length})</Text>
                    </View>
                    <ScrollView>
                        {
                            listItem.map((item, index) => {
                                return (
                                    <View style={{ backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, marginBottom: 5 }} key={index.toString()}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text>{item.Name}</Text>
                                            <Text>{item.Code}</Text>
                                        </View>
                                        <View style={styles.styleView}>
                                            <Text style={styles.styleTitle}>{I18n.t('gia_nhap')}</Text>
                                            <Text style={{ fontWeight: 'bold', color: colors.colorLightBlue }}>{currencyToString(item.Price)}</Text>
                                        </View>
                                        <View style={styles.styleView}>
                                            <Text style={styles.styleTitle}>{I18n.t('gia_ban')}</Text>
                                            <Text style={{ fontWeight: 'bold', color: colors.colorLightBlue }}>{item.IsLargeUnit == true ? currencyToString(item.PriceLargeUnit) : currencyToString(item.PriceUnit)}</Text>
                                        </View>
                                        <View style={styles.styleView}>
                                            <Text style={styles.styleTitle}>{I18n.t('so_luong')}</Text>
                                            <Text style={{ fontWeight: 'bold', color: colors.colorLightBlue }}>{currencyToString(item.Quantity)}</Text>
                                        </View>


                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', paddingHorizontal: 5, paddingVertical: 10 }}>
                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, borderRadius: 10, padding: 10, marginRight: 10 }}
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={
                            <View style={{ backgroundColor: Colors.colorLightBlue, borderRadius: 10 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="printer" size={24} color="white" />
                            </View>}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5, width:170
                        }}>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_phieu_nhap_hang')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_phieu_nhan_hang')}</Text>
                            </TouchableOpacity>

                        </View>
                    </Menu>
                </TouchableOpacity>
                {
                    allPer.PurchaseOrder_Delete || allPer.IsAdmin ?
                        <TouchableOpacity style={styles.styleBtn} onPress={() => onClickDel()}>
                            <Text style={styles.styleTittleBtn}>{orderStock.Status != 3 ? I18n.t('huy') : I18n.t('xoa')}</Text>
                        </TouchableOpacity>
                        :
                        null
                }
                {
                    allPer.PurchaseOrder_Update || allPer.IsAdmin ?
                        <TouchableOpacity style={[styles.styleBtn, { marginLeft: 10 }]} onPress={() => onClickEdit()}>
                            <Text style={styles.styleTittleBtn}>{I18n.t('chinh_sua')}</Text>
                        </TouchableOpacity>
                        :
                        null
                }
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTittleBtn: { textAlign: 'center', fontWeight: 'bold', color: '#fff' },
    styleTitle: {
        color: '#bbbbbb'
    },
    styleView: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    styleBtn: { flex: 3, backgroundColor: colors.colorLightBlue, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    styleValue: { fontWeight: 'bold', color: colors.colorLightBlue }
})
