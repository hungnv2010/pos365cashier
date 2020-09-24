import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, RefreshControl, TouchableWithoutFeedback, Image } from 'react-native';
import I18n from '../../common/language/i18n';
import MainToolBar from '../main/MainToolBar';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { URL, HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';
// import DateRangePicker from "react-native-daterange-picker";
import moment from "moment";
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { currencyToString, dateToString } from '../../common/Utils';
import InvoiceDetail from '../invoice/invoiceDetail';
import { FlatList } from 'react-native-gesture-handler';

const Invoice = (props) => {

    const [invoiceData, setInvoiceData] = useState([])
    const [currentItem, setCurrentItem] = useState({})
    const [timeFilter, setTimeFilter] = useState(Constant.TIME_SELECT_ALL_TIME[0])
    const [showModal, setShowModal] = useState(false)
    const [isSelectCustom, setIsSelectCustom] = useState(false)
    const [skip, setSkip] = useState(0)
    const [dateTimePicker, setDateTimePicker] = useState({
        startDate: null,
        endDate: null,
        displayedDate: moment(),
    })
    const [refreshing, setRefreshing] = useState(false)
    const currentBranch = useRef({})
    const count = useRef(0)
    const currentCount = useRef(0)
    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });

    useEffect(() => {
        const getBranch = async () => {
            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            if (branch) {
                currentBranch.current = JSON.parse(branch)
            }
        }
        getBranch()
    }, [])


    const genParams = useCallback(() => {
        const { startDate, endDate } = dateTimePicker;
        let params = { skip: skip, top: Constant.LOAD_LIMIT };
        let arrItemPath = [];
        let pathBranch = "";


        if (currentBranch.current.Id) {
            pathBranch = "BranchId+eq+" + currentBranch.current.Id
            arrItemPath.push(pathBranch)
        }
        console.log("arrItemPath ", arrItemPath);
        if (timeFilter.key != "custom") {
            if (timeFilter.key !== Constant.TIME_SELECT_ALL_TIME[4].key) {
                params['filter'] = `PurchaseDate+eq+%27${timeFilter.key}%27`;
            }
            if (arrItemPath[0]) {
                params['filter'] = `(${arrItemPath.join()})`;
            }
            if (timeFilter.key != Constant.TIME_SELECT_ALL_TIME[4].key && arrItemPath[0]) {
                params['filter'] = `(PurchaseDate+eq+%27${timeFilter.key}%27+and+${arrItemPath.join()})`;
            }
        } else {
            let startDateFilter = momentToStringDateLocal(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = momentToStringDateLocal((endDate ? endDate : startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            arrItemPath.push("PurchaseDate+ge+'datetime''" + startDateFilter.toString().trim() + "'''");
            arrItemPath.push("PurchaseDate+lt+'datetime''" + endDateFilter.toString().trim() + "'''");
            params['filter'] = `(${arrItemPath.join("+and+")})`;
        }
        console.log('params', params);
        return params;
    }, [timeFilter.key, skip])

    useEffect(() => {
        const getInvoice = async () => {
            let params = genParams();
            params = { ...params, includes: ['Room', 'Partner'], IncludeSummary: true };
            new HTTPService().setPath(ApiPath.INVOICE).GET(params).then((res) => {
                console.log("getInvoicesData res ", res);
                if (res) {
                    let results = res.results.filter(item => item.Id > 0);
                    console.log('res.__count', res.__count);
                    count.current = res.__count;
                    currentCount.current = results.length

                    setInvoiceData([...invoiceData, ...results])

                }
            }).catch((e) => {
                console.log("getInvoicesData err  ======= ", e);
            })
        }
        getInvoice()
    }, [genParams])

    useEffect(() => {
        if (invoiceData.length > 0) {
            setCurrentItem(invoiceData[0])
        }
        console.log('timeFilter.key', invoiceData.length, invoiceData);
    }, [timeFilter.key, invoiceData])

    const onClickTimeFilter = () => {
        console.log('onClickTimeFilter');
        setShowModal(true)
    }

    const reset = () => {
        onRefresh()
        setInvoiceData([])
        setCurrentItem({})
    }

    const onRefresh = () => {
        console.log('onRefresh', count.current);
        setSkip(0)
    }

    const loadMore = (info) => {
        console.log('loadMore');
        if (currentCount.current > 0) {
            setSkip(prevSkip => prevSkip + Constant.LOAD_LIMIT)
        }
    }

    const onDoneSelectDate = () => {

    }

    const onClickInvoiceItem = (item) => {
        if (deviceType == Constant.TABLET) {
            setCurrentItem({ ...item })
        } else {

        }
    }

    const onClickSelectTime = (item) => {
        console.log('onClickSelectTime', item);
        if (item.key == 'custom') {
            setIsSelectCustom(true)
        } else {
            setTimeFilter({ ...item })
            onRefresh()
            setShowModal(false)
        }
        reset()
    }

    const renderIcon = (status) => {
        switch (status) {
            case 1:
                return Images.icon_waiting;
                break;
            case 2:
                return Images.icon_checked;
                break;

            default:
                return Images.icon_red_x;
                break;
        }
    }

    const checkColor = (item) => {
        let MoreAttributes = getMoreAttributes(item);
        if (MoreAttributes) {
            for (let i = 0; i < MoreAttributes.TemporaryPrints.length; i++) {
                if (MoreAttributes.TemporaryPrints[i].Total != item.TotalPayment) return false;
                else return true;
            }
        } else return true;
    }

    const getMoreAttributes = (item) => {
        let MoreAttributes = item.MoreAttributes ? JSON.parse(item.MoreAttributes) : null;
        let HasTemporaryPrints = MoreAttributes && MoreAttributes.TemporaryPrints && MoreAttributes.TemporaryPrints.length > 0 ? true : false;
        return HasTemporaryPrints ? MoreAttributes : false
    }

    const renderItemList = (item, index) => {
        return (
            <TouchableOpacity
                onPress={() => onClickInvoiceItem(item)}
                key={item.Id}
                style={{ flexDirection: "column", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 1, paddingVertical: 15, paddingHorizontal: 10, backgroundColor: item.Id == currentItem.Id ? "#F3DAC8" : null }}>
                <View style={{ flex: 1, flexDirection: "row", }}>
                    <Image source={renderIcon(item.Status)} style={{ width: 30, height: 30, marginRight: 10, alignSelf: "center" }}></Image>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, }}>{item.Code}</Text>
                        <Text style={{ fontSize: 12, color: "#1565C0" }}>{item.PartnerId ? item.Partner.Name : I18n.t("khach_le")}</Text>
                        <Text>{item.Room ? item.Room.Name : ''}</Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: 14, color: checkColor(item) ? "black" : "red" }}>{currencyToString(item.TotalPayment)}</Text>
                        <Text style={{ color: '#689f38', fontSize: 13 }}>{item.AccountId ? (item.AccountId) : I18n.t("tien_mat")}</Text>
                        <Text style={{ color: "#0072bc", fontSize: 12 }}>{dateToString(item.CreatedDate)}</Text>
                    </View>
                </View>
                {getMoreAttributes(item) ?
                    <Text style={{ fontStyle: 'italic', color: "gray" }}>{I18n.t("tam_tinh")} {getMoreAttributes(item).TemporaryPrints.length} {I18n.t("lan")}</Text>
                    : null}
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('hoa_don')}
            />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: "grey" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomColor: "grey", borderBottomWidth: 1, justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={onClickTimeFilter}>
                            <Image source={Images.icon_calendar} style={{ width: 20, height: 20 }} />
                            <Text style={{ marginHorizontal: 10 }}>{I18n.t(timeFilter.name)}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                        </TouchableOpacity>
                        <Text>{invoiceData.length} / {count.current}</Text>
                    </View>
                    <FlatList
                        refreshControl={
                            <RefreshControl colors={[colors.colorchinh]} refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        style={{ flex: 1, paddingBottom: 0 }}
                        onEndReachedThreshold={0.5}
                        onEndReached={(info) => {
                            loadMore(info);
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        data={invoiceData}
                        renderItem={({ item, index }) =>
                            renderItemList(item, index)
                        }
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <InvoiceDetail
                        currentItem={currentItem} />
                </View>
            </View>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                            setIsSelectCustom(false)
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={{
                            backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}></View>

                    </TouchableWithoutFeedback>
                    <View style={{
                        padding: 20,
                        backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                        width: !isSelectCustom ? Metrics.screenWidth * 0.5 : null,
                        justifyContent: 'center', alignItems: 'center',
                    }}>
                        {
                            !isSelectCustom ?
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 10 }}>{I18n.t('chon_khoang_thoi_gian')}</Text>
                                    {
                                        Constant.TIME_SELECT_ALL_TIME.map((item, index) => {
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => onClickSelectTime(item)}
                                                    key={index} style={{ paddingVertical: 15, }}>
                                                    <Text style={{ fontSize: 17, textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                                :
                                <View style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    {/* <DateRangePicker
                                        visible={true}
                                        onChange={(dates) => setDates(dates)}
                                        endDate={dateTimePicker.endDate}
                                        startDate={dateTimePicker.startDate}
                                        displayedDate={dateTimePicker.displayedDate}
                                        range
                                    >
                                    </DateRangePicker> */}
                                    <View style={{ flexDirection: "row", margin: 10 }}>
                                        <TouchableOpacity onPress={() => {
                                            setShowModal(false);
                                            setIsSelectCustom(false)
                                        }} style={{ marginHorizontal: 20, paddingHorizontal: 30, borderColor: colors.colorchinh, borderWidth: 1, paddingVertical: 10, borderRadius: 5 }}>
                                            <Text style={{ color: colors.colorchinh, textTransform: "uppercase" }}>{I18n.t("huy")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onDoneSelectDate} style={{ marginHorizontal: 20, paddingHorizontal: 30, paddingVertical: 10, backgroundColor: colors.colorchinh, borderRadius: 5, borderWidth: 0 }}>
                                            <Text style={{ color: "#fff", textTransform: "uppercase" }}>{I18n.t("xong")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                        }
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Invoice