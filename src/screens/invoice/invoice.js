import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, RefreshControl, TouchableWithoutFeedback, Image, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import I18n from '../../common/language/i18n';
import MainToolBar from '../main/MainToolBar';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { URL, HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { currencyToString, dateToString, momentToStringDateLocal } from '../../common/Utils';
import InvoiceDetail from '../invoice/invoiceDetail';
import { FlatList } from 'react-native-gesture-handler';
import DateTime from '../../components/filter/DateTime';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useDebounce from '../../customHook/useDebounce';
import { ScreenList } from '../../common/ScreenList';
import dialogManager from '../../components/dialog/DialogManager';

const Invoice = (props) => {

    const [invoiceData, setInvoiceData] = useState([])
    const [currentItem, setCurrentItem] = useState({})
    const [filter, setFilter] = useState({
        time: Constant.TIME_SELECT_ALL_TIME[0],
        status: Constant.STATUS_FILTER[0]
    })
    const [showModal, setShowModal] = useState(false)
    const [loadMore, setLoadMore] = useState(false)
    const [textSearch, setTextSearch] = useState("")
    const currentBranch = useRef({})
    const listAccount = useRef([])
    const typeModal = useRef(null)
    const count = useRef(0)
    const currentCount = useRef(0)
    const onEndReachedCalledDuringMomentum = useRef(false)
    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });
    const filterRef = useRef({
        time: Constant.TIME_SELECT_ALL_TIME[0],
        status: Constant.STATUS_FILTER[0],
        skip: 0
    })
    const debounceTextSearch = useDebounce(textSearch)


    useEffect(() => {
        const getBranch = async () => {
            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            if (branch) {
                currentBranch.current = JSON.parse(branch)
            }
        }
        const getAccount = async () => {
            let results = await new HTTPService().setPath(ApiPath.ACCOUNT).GET()
            listAccount.current = results

        }
        getAccount()
        getBranch()
        getInvoice(true)
    }, [])

    useEffect(() => {
        setCurrentItem({})
    }, [invoiceData])


    useEffect(() => {
        const getInvoiceBySearch = () => {
            if (debounceTextSearch != '') {
                let params = {
                    Includes: ['Partner', 'Room'],
                    IncludeSummary: true,
                    filter: `(substringof('${textSearch}', Code) and BranchId eq ${currentBranch.current.Id})`
                };
                dialogManager.showLoading()
                new HTTPService().setPath(ApiPath.INVOICE).GET(params).then((res) => {
                    console.log('getInvoiceBySearch', res);
                    count.current = res.__count;
                    currentCount.current = res.results.length
                    let results = res.results.filter(item => item.Id > 0);
                    setInvoiceData([...results])
                    dialogManager.hiddenLoading()
                }).catch(err => {
                    console.log('getInvoiceBySearch', err);
                    dialogManager.hiddenLoading()
                })
            }
        }
        getInvoiceBySearch()
    }, [debounceTextSearch])


    const getInvoice = (reset = false) => {
        let params = genParams();
        params = { ...params, includes: ['Room', 'Partner'], IncludeSummary: true };
        dialogManager.showLoading()
        new HTTPService().setPath(ApiPath.INVOICE).GET(params).then((res) => {
            console.log("getInvoicesData res ", res);
            let results = res.results.filter(item => item.Id > 0);
            console.log('res.__count', res.__count);
            count.current = res.__count;
            currentCount.current = results.length
            if (reset) {
                setInvoiceData([...results])
            } else {
                setInvoiceData([...invoiceData, ...results])
            }
            setLoadMore(false)
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("getInvoicesData err  ======= ", e);
            dialogManager.hiddenLoading()
        })
    }


    const genParams = () => {
        const { startDate, endDate } = filterRef.current.time;
        let params = { skip: filterRef.current.skip, top: Constant.LOAD_LIMIT };
        let arrItemPath = [];

        if (currentBranch.current.Id) {
            arrItemPath.push("BranchId eq " + currentBranch.current.Id)
        }
        if (filterRef.current.time.key != "custom") {
            if (filterRef.current.time.key != Constant.TIME_SELECT_ALL_TIME[4].key) {
                arrItemPath.push(`PurchaseDate eq '${filterRef.current.time.key}'`)
            }
            if (filterRef.current.status.key != '') {
                arrItemPath.push(`Status eq ${filterRef.current.status.key}`)
            }
        } else if (startDate) {
            let startDateFilter = momentToStringDateLocal(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = momentToStringDateLocal((endDate ? endDate : startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            arrItemPath.push("PurchaseDate+ge+'datetime''" + startDateFilter.toString().trim() + "'''");
            arrItemPath.push("PurchaseDate+lt+'datetime''" + endDateFilter.toString().trim() + "'''");
            params['filter'] = `(${arrItemPath.join(" and ")})`;
        }
        params['filter'] = `(${arrItemPath.join(' and ')})`
        console.log('params', params);
        return params;
    }


    const outputDateTime = (item) => {
        console.log('outputDateTime', item);
        if(item == null){
            setShowModal(false)
        }
         else if (item.key == 'custom' && !item.startDate) {
            setShowModal(false)
        } else {
            setFilter({
                ...filter,
                time: item
            })
            filterRef.current = { ...filterRef.current, time: item }
            onRefresh()
            setShowModal(false)
        }
    }

    const onRefresh = () => {
        console.log('onRefresh', count.current);
        filterRef.current.skip = 0
        getInvoice(true)
    }

    const onLoadMore = () => {
        if (!(currentCount.current < Constant.LOAD_LIMIT) && !onEndReachedCalledDuringMomentum.current) {
            console.log('loadMore', count.current);
            setLoadMore(true)
            filterRef.current = {
                ...filterRef.current,
                skip: filterRef.current.skip + Constant.LOAD_LIMIT
            }
            onEndReachedCalledDuringMomentum.current = true
            getInvoice()
        }
    }


    const onClickInvoiceItem = (item) => {
        if (deviceType == Constant.TABLET) {
            setCurrentItem({ ...item })
        } else {
            console.log('onClickInvoiceItem', item, props);
            props.navigation.navigate(ScreenList.InvoiceDetailForPhone, { item })

        }
    }

    const onClickStatusFilter = (item) => {
        setFilter({
            ...filter,
            status: item
        })
        filterRef.current = { ...filterRef.current, status: item }
        onRefresh()
        setShowModal(false)
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

    const getPaymentMethod = (accountId) => {
        if (listAccount.current) {
            let account = listAccount.current.filter(item => item.Id == accountId)
            return account[0].Name
        }
    }

    const renderItemList = (item, index) => {
        return (
            <TouchableOpacity
                onPress={() => onClickInvoiceItem(item)}
                key={item.Id}>
                <View style={{ flex: 1, alignItems: "center", padding: 15, marginBottom: 5, backgroundColor: item.Id == currentItem.Id ? "#F6DFCE" : 'white', borderRadius: 10 }}>
                    <View style={{ flexDirection: "row", }}>
                        <Image source={renderIcon(item.Status)} style={{ width: 30, height: 30, marginRight: 10, alignSelf: "center" }}></Image>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, }}>{item.Code}</Text>
                            <Text style={{ fontSize: 12, color: "#1565C0" }}>{item.Partner ? item.Partner.Name : I18n.t("khach_le")}</Text>
                            <Text>{item.Room ? item.Room.Name : ''}</Text>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={{ fontSize: 14, color: checkColor(item) ? "black" : "red" }}>{currencyToString(item.TotalPayment)}</Text>
                            <Text style={{ color: '#689f38', fontSize: 13 }}>{item.AccountId ? getPaymentMethod(item.AccountId) : I18n.t("tien_mat")}</Text>
                            <Text style={{ color: "#0072bc", fontSize: 12 }}>{dateToString(item.CreatedDate, "HH:mm DD/MM/YYYY")}</Text>
                        </View>
                    </View>
                    {
                        getMoreAttributes(item) ?
                            <Text style={{ fontStyle: 'italic', color: "gray" }}>{I18n.t("tam_tinh")} {getMoreAttributes(item).TemporaryPrints.length} {I18n.t("lan")}</Text>
                            : null
                    }
                </View>
            </TouchableOpacity>
        )
    }

    const renderFilter = () => {
        return typeModal.current == 1 ?
            <DateTime
                timeAll={true}
                outputDateTime={outputDateTime} />
            :
            <View style={{
                padding: 0,
                backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 0,
                justifyContent: 'center',
            }}>
                <View>
                    <View style={{backgroundColor:"#FF4500",borderTopEndRadius:4,borderTopStartRadius:4}}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 10,color:'white' }}>{I18n.t('loc_theo_trang_thai')}</Text>
                    </View>
                    {
                        Constant.STATUS_FILTER.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    onPress={() => onClickStatusFilter(item)}
                                    key={index} style={{ paddingVertical: 15, }}>
                                    <Text style={{ textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </View>
    }

    const onClickFilter = (type) => {
        typeModal.current = type
        setShowModal(true)
    }

    const onChangeText = (text) => {
        console.log('onChangeText', text);
        setTextSearch(text)
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('hoa_don')}
            />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: "grey" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", borderBottomColor: "grey", borderBottomWidth: 1, justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => onClickFilter(1)}>
                            <Image source={Images.icon_calendar} style={{ width: 48, height: 48 }} />
                            <Text style={{ marginHorizontal: 10 }}>{filter.time.name.includes('-') ? filter.time.name : I18n.t(filter.time.name)}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" ,padding:20}}
                            onPress={() => onClickFilter(2)}>
                            <Image source={Images.icon_filter} style={{ width: 17, height: 18 }} />
                            <Text style={{ marginHorizontal: 10 }}>{I18n.t(filter.status.name)}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f2", height: 60, }}>
                        <View style={{ backgroundColor: "white", height: 40, width: " 95%", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
                            <Ionicons name="md-search" size={20} color="black" style={{marginRight: 20}}/>
                            <TextInput
                                style={{ flex: 1, color: "#000", height: 35 }}
                                value={textSearch}
                                onChangeText={text => onChangeText(text)}
                                placeholder={I18n.t('nhap_ma_hoa_don_tim_kiem')}
                                placeholderTextColor="#808080"
                            />
                            {
                                textSearch != "" ?
                                    <TouchableOpacity onPress={() => {
                                        setTextSearch('')
                                        getInvoice(true)
                                        Keyboard.dismiss()
                                    }}>
                                        <Ionicons name="md-close" size={20} color="black" />
                                    </TouchableOpacity>
                                    :
                                    null
                            }
                        </View>
                    </View>

                    <View style={{ paddingLeft: 15, paddingBottom: 5 }}>
                        <Text style={{ fontSize: 10 }}>{I18n.t('tong_so_hoa_don')} {invoiceData.length} / {count.current}</Text>
                    </View>
                    {
                        invoiceData.length > 0 ?
                            <FlatList
                                refreshControl={
                                    <RefreshControl colors={[colors.colorchinh]} refreshing={false} onRefresh={onRefresh} />
                                }
                                style={{ flex: 1, paddingBottom: 0 }}
                                onEndReachedThreshold={0.1}
                                onEndReached={onLoadMore}
                                keyExtractor={(item, index) => index.toString()}
                                data={invoiceData}
                                renderItem={({ item, index }) =>
                                    renderItemList(item, index)
                                }
                                ListFooterComponent={loadMore ? <ActivityIndicator color={colors.colorchinh} /> : null}
                                onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false }}
                            />
                            :
                            <Text style={{ textAlign: "center" }}>{I18n.t('khong_tim_thay_hoa_don_nao_phu_hop')}</Text>
                    }
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <View style={{ flex: 1 }}>
                            <InvoiceDetail
                                currentItem={currentItem} />
                        </View>
                        :
                        null
                }
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
                    <View style={{ width: Metrics.screenWidth * 0.8 }}>
                        {renderFilter()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Invoice