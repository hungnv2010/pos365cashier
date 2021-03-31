import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, FlatList, Image } from 'react-native';
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { URL, HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';
import { currencyToString, dateToString, momentToDateUTC } from '../../common/Utils';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import dialogManager from '../../components/dialog/DialogManager';
import moment from "moment";


const InvoiceDetail = (props) => {
    const [invoiceDetail, setInvoiceDetail] = useState({})
    const [dataDetail, setDataDetail] = useState([])
    const moreAttributes = useRef(null)
    const listAccount = useRef([])

    useEffect(() => {
        const getAccount = async () => {
            let results = await new HTTPService().setPath(ApiPath.ACCOUNT).GET()
            listAccount.current = [{ Id: 0, Name: I18n.t("tien_mat") }, ...results]
        }
        getAccount()
    }, [])

    useEffect(() => {
        if (props.currentItem) {
            console.log('props.currentItem ', props.currentItem);
            setInvoiceDetail({ ...props.currentItem })
        }
    }, [props.currentItem])

    useEffect(() => {
        moreAttributes.current = getMoreAttributes()
        console.log(' moreAttributes.current', moreAttributes.current);
        const getProductsDetail = async () => {
            let params = { includes: 'Product' };
            if (invoiceDetail.Id) {
                params.OrderId = invoiceDetail.Id
                new HTTPService().setPath(ApiPath.INVOICE_DETAIL).GET(params).then((res) => {
                    console.log("getProductsDetail res ", res);
                    if (res) {
                        if (res.results) {
                            setDataDetail([...res.results])
                        }
                    }
                    dialogManager.hiddenLoading();
                }).catch((e) => {
                    dialogManager.hiddenLoading();
                    console.log(" err ", e);
                })
            } else {
                setDataDetail([])
            }
        }
        getProductsDetail()
    }, [invoiceDetail])

    const getStatus = (status) => {
        switch (status) {
            case 2:
                return 'hoan_thanh';
                break;
            case 1:
                return 'dang_xu_ly';
                break;
            case 3:
                return 'huy';
                break;
            default:
                return 'dang_xu_ly';
                break;
        }
    }

    const renderItemList = (item) => {
        return (
            <View key={item.Id} style={{ flex: 1, flexDirection: 'row', paddingVertical: 10, borderBottomColor: "#ddd", borderBottomWidth: 1, justifyContent: 'space-between', alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ flex: 1, textAlign: "center", fontSize: 12 }}>{item.Product && item.Product.Name ? item.Product.Name.trim() : ""}</Text>
                    {item.Description && item.Description != "" ?
                        <Text style={{ flex: 1, textAlign: "center", fontSize: 10, fontStyle: "italic" }}>{item.Description.trim()}</Text>
                        : null}
                </View>
                <View style={{ flex: 1, alignItems: 'center', fontSize: 12 }}>
                    <Text style={{ fontSize: 12 }}>{item.Price ? currencyToString(item.Price) : 0}</Text>
                    {item.BasePrice && item.BasePrice >= 0 && item.Price && item.Price >= 0 && item.BasePrice > item.Price ? <Text style={{ textDecorationLine: "line-through", fontSize: 12 }}>{currencyToString(item.BasePrice)}</Text> : null}
                </View>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
                    <Text style={{ fontSize: 12 }}> {item.Quantity ? Math.round(item.Quantity * 1000) / 1000 : 0} </Text>
                    {item.Product && item.Product.Unit ?
                        <View style={{ backgroundColor: "#e84e40", borderRadius: 3, }}><Text style={{ color: "#fff", paddingHorizontal: 3, fontSize: 12 }}>{item.IsLargeUnit ? item.Product.LargeUnit : item.Product.Unit}</Text></View>
                        :
                        null}
                </View>
                <Text style={{ flex: 1, textAlign: "center", fontSize: 12 }}> {item.Price && item.Price > 0 && item.Quantity && item.Quantity > 0 ? currencyToString(item.Price * item.Quantity) : 0}</Text>

            </View>
        )
    }

    const getMoreAttributes = () => {
        let MoreAttributes = {} // invoiceDetail.MoreAttributes ? JSON.parse(invoiceDetail.MoreAttributes) : null;
        try {
            MoreAttributes = invoiceDetail.MoreAttributes ? JSON.parse(invoiceDetail.MoreAttributes) : null;
        } catch (error) {
            console.log(" getMoreAttributes error ", error);
        }
        let HasTemporaryPrints = MoreAttributes && MoreAttributes.TemporaryPrints && MoreAttributes.TemporaryPrints.length > 0;
        if (HasTemporaryPrints) return MoreAttributes;
        else return null;
    }


    const getPaymentMethod = (MoreAttributes) => {
        let MoreAttributesTmp = {} // invoiceDetail.MoreAttributes ? JSON.parse(invoiceDetail.MoreAttributes) : null;
        try {
            MoreAttributesTmp = MoreAttributes ? JSON.parse(MoreAttributes) : null;
        } catch (error) {
            console.log(" getMoreAttributes error ", error);
        }
        let listPaymentMethod = []
        MoreAttributes = MoreAttributesTmp;
        if (MoreAttributes.PaymentMethods && MoreAttributes.PaymentMethods.length > 0) {
            if (listAccount.current && listAccount.current.length > 0) {
                listAccount.current.forEach(item => {
                    MoreAttributes.PaymentMethods.forEach(elm => {
                        if (item.Id == elm.AccountId) {
                            listPaymentMethod.push(item.Name)
                        }
                    })
                })
            }
        }
        return listPaymentMethod.length > 0 ? listPaymentMethod : [I18n.t("tien_mat")]
    }

    const renderFooter = () => {
        return (
            <View style={{ borderTopColor: "#0072bc", borderTopWidth: 1, }}>
                <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ padding: 0, flex: 1 }}>{I18n.t('tong_tam_tinh')}</Text>
                    <Text style={{ paddingLeft: 5 }}>{currencyToString(invoiceDetail.Total + ("Discount" in invoiceDetail ? invoiceDetail.Discount : 0) - ("VAT" in invoiceDetail ? invoiceDetail.VAT : 0))} đ</Text>
                </View>
                {"Discount" in invoiceDetail ?
                    <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ padding: 0, flex: 1 }}>{I18n.t("chiet_khau")}</Text>
                        <Text style={{ paddingLeft: 5 }}>- {currencyToString(invoiceDetail.Discount)} đ</Text>
                    </View>
                    : null
                }
                {"VAT" in invoiceDetail ?
                    <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ padding: 0, flex: 1 }}>VAT</Text>
                        <Text style={{ paddingLeft: 5 }}>+ {currencyToString(invoiceDetail.VAT)} đ</Text>
                    </View>
                    : null
                }
                {"MoreAttributes" in invoiceDetail ?
                    <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ padding: 0, flex: 1 }}>{I18n.t('phuong_thuc_thanh_toan')}</Text>
                        {/* <Text style={{ paddingLeft: 5 }}>+ {currencyToString(invoiceDetail.VAT)}</Text> */}
                        <View style={{ alignItems: "flex-end" }}>
                            {getPaymentMethod(JSON.parse(invoiceDetail.MoreAttributes)).map((item, index) => {
                                return (
                                    <Text key={index} style={{ fontStyle: "italic", color: "gray" }}>{item}</Text>
                                )
                            })}
                        </View>
                    </View>
                    : null
                }
                <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between", }}>
                    <Text style={{ padding: 0, flex: 1, fontSize: 14, }}>{I18n.t("tong_cong")}</Text>
                    <Text style={{ paddingLeft: 5, fontSize: 14, }}>{currencyToString(invoiceDetail.Total)} đ</Text>
                </View>
                <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between", }}>
                    <Text style={{ padding: 0, flex: 1, fontSize: 14, fontWeight: 'bold', }}>{I18n.t("tong_thanh_toan")}</Text>
                    <Text style={{ paddingLeft: 5, fontSize: 14, fontWeight: 'bold', }}>{currencyToString(invoiceDetail.TotalPayment)} đ</Text>
                </View>
                {moreAttributes.current ?
                    <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ padding: 0, flex: 1, fontStyle: 'italic' }}>{I18n.t("tam_tinh")}</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            {moreAttributes.current.TemporaryPrints.map((item, index) => {
                                return (<Text style={{ fontStyle: 'italic' }}>{moment.utc(momentToDateUTC(item.CreatedDate)).local().format("HH:mm DD/MM/YYYY")} - {currencyToString(item.Total)} đ</Text>)
                            })}
                        </View>
                    </View>
                    : null
                }
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: 'gray' }}>
            {
                JSON.stringify(invoiceDetail) != "{}" ?
                    <View style={{ paddingHorizontal: 10, flex: 1 }}>
                        <View style={{ borderBottomColor: "#0072bc", borderBottomWidth: 1, }}>
                            {/* <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ padding: 0, flex: 1, fontWeight: 'bold', }}>{I18n.t("ngay_tao")}</Text>
                                <Text style={{ paddingLeft: 5, }}>{invoiceDetail.CreatedDate ? moment.utc(momentToDateUTC(invoiceDetail.CreatedDate)).local().format("HH:mm DD/MM/YYYY") : ""}</Text>
                            </View> */}
                            {invoiceDetail.PurchaseDate ?
                                <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ padding: 0, flex: 1, fontWeight: 'bold', }}>{I18n.t("ngay_ban")}</Text>
                                    <Text style={{ paddingLeft: 5, }}>{moment.utc(momentToDateUTC(invoiceDetail.PurchaseDate)).local().format("HH:mm DD/MM/YYYY")}</Text>
                                </View>
                                : null
                            }
                            {invoiceDetail.ModifiedDate ?
                                <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ padding: 0, flex: 1, fontWeight: 'bold' }}>{I18n.t("ngay_sua")}</Text>
                                    <Text style={{ paddingLeft: 5, color: "red" }}>{moment.utc(momentToDateUTC(invoiceDetail.ModifiedDate)).local().format("HH:mm DD/MM/YYYY")}</Text>
                                </View>
                                : null
                            }

                            {invoiceDetail.ModifiedBy && typeof invoiceDetail.ModifiedBy != "number" ?
                                <View style={{ margin: 5, flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ padding: 0, flex: 1, fontWeight: 'bold' }}>{I18n.t("nguoi_sua")}</Text>
                                    <Text style={{ paddingLeft: 5, color: "red" }}>{invoiceDetail.ModifiedBy}</Text>
                                </View>
                                : null
                            }
                            <View style={{ margin: 5, alignItems: "center", }}>
                                <Text style={{ fontWeight: 'bold' }}>{I18n.t("trang_thai")} :  <Text style={{ color: colors.colorchinh }}>{"Status" in invoiceDetail ? I18n.t(getStatus(invoiceDetail.Status)) : ""}</Text></Text>
                            </View>

                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: "#0072bc", borderBottomWidth: 1, paddingVertical: 10, alignItems: "center" }}>
                            <Text style={styles.text2}>{I18n.t("ten_hang")}</Text>
                            <Text style={styles.text2}>{I18n.t("don_gia")}</Text>
                            <Text style={styles.text2}>{I18n.t("SL")}</Text>
                            <Text style={styles.text2}> {I18n.t("TT")}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            {dataDetail && dataDetail.length > 0 ?
                                <FlatList
                                    style={{ flexGrow: 0 }}
                                    keyExtractor={(item, index) => index.toString()}
                                    data={dataDetail}
                                    renderItem={({ item }) =>
                                        renderItemList(item)
                                    }
                                />
                                : null}
                            {renderFooter()}
                        </View>
                    </View>
                    :
                    null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    text2: {
        fontWeight: 'bold',
        alignItems: 'center',
        flex: 1,
        textAlign: "center"
    }
});

export default InvoiceDetail