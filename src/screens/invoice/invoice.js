import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Image } from 'react-native';
import I18n from '../../common/language/i18n';
import MainToolBar from '../main/MainToolBar';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { BarChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { URL, HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';
import DateRangePicker from "react-native-daterange-picker";
import moment from "moment";
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { currencyToString, dateToString } from '../../common/Utils';
import InvoiceDetail from '../invoice/invoiceDetail';
import { FlatList } from 'react-native-gesture-handler';

const Invoice = (props) => {

    const [invoiceData, setInvoiceData] = useState([])
    const [currentItem, setCurrentItem] = useState([])
    const [timeFilter, setTimeFilter] = useState(Constant.TIME_SELECT_ALL_TIME[0])
    const [showModal, setShowModal] = useState(false)
    const [skip, setSkip] = useState(0)
    const [dateTimePicker, setDateTimePicker] = useState({
        startDate: null,
        endDate: null,
        displayedDate: moment(),
    })
    const currentBranch = useRef(null)

    useEffect(() => {
        const getBranch = async () => {
            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            if (branch) {
                currentBranch.current = JSON.parse(branch)
            }
            console.log('currentBranch.current', currentBranch.current);
        }
        getBranch()
    }, [])

    const genParams = useCallback(() => {
        const { startDate, endDate } = dateTimePicker;
        let params = { skip: skip, top: Constant.LOAD_LIMIT };
        let arrItemPath = [];
        let pathBranch = "";


        if (currentBranch.current && currentBranch.current.Id != "") {
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
                // if (res) {
                //     let results = res.results.filter(item => item.Id > 0);
                //     this.count = res.__count;
                //     this.setState({ data: [...this.state.data, ...results] })
                // }
            }).catch((e) => {

                console.log("getInvoicesData err  ======= ", e);
            })
        }
        getInvoice()
    }, [genParams])

    const onClickTimeFilter = () => {

    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('hoa_don')}
            />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomColor: "grey", borderBottomWidth: 1, justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={onClickTimeFilter}>
                            <Image source={Images.icon_calendar} style={{ width: 20, height: 20 }} />
                            <Text style={{ marginHorizontal: 10 }}>{I18n.t(timeFilter.name)}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                        </TouchableOpacity>
                    </View>
                    <FlatList />
                </View>
                <View style={{ flex: 1 }}>
                    {/* <InvoiceDetail /> */}
                </View>
            </View>
        </View>
    )
}

export default Invoice