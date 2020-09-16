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


export default (props) => {


    const [listTopSell, setListTopSell] = useState([])
    const [dataDashBoard, setDataDashBoard] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [selectTime, setSelectTime] = useState(Constant.TIME_SELECT[0])
    const [selectTimeForRevenue, setSelectTimeForRevenue] = useState(Constant.TIME_SELECT_ALL_TIME[0])
    const [isSelectCustom, setIsSelectCustom] = useState(false)
    const [dateTimePicker, setDateTimePicker] = useState({
        startDate: null,
        endDate: null,
        displayedDate: moment(),
    })
    const [dataChart, setDataChart] = useState({
        times: [],
        totalBranchs: [],
    })
    const currentBranch = useRef(null)
    const typeSelectTime = useRef(null) // 1: selectTimeForRevenue ; 2: selectTime
    const timeFormat = useRef("")
    const response = useRef([])

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
            console.log('currentBranch.current', currentBranch.current);
        }
        getBranch()
    }, [])


    const genParams = useCallback((allType = false) => {
        const { startDate, endDate } = dateTimePicker;
        let params = { TimeRange: selectTimeForRevenue.key };
        console.log("genParams time startDate, endDate 2", selectTimeForRevenue.key, startDate, endDate, currentBranch.current);

        if (selectTimeForRevenue.key == "custom" && startDate) {
            let startDateFilter = momentToStringDateLocal(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = momentToStringDateLocal((endDate ? endDate : startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            params = { TimeRange: selectTimeForRevenue.key, StartDate: startDateFilter, EndDate: endDateFilter }
        }

        let arrItemPath = [];
        if (currentBranch.current.Id != "") {
            arrItemPath.push(currentBranch.current.Id)
        }

        if (allType == false) {
            if (arrItemPath.length > 0)
                params["BranchIds"] = arrItemPath[0];
        }
        return params;
    }, [selectTimeForRevenue.key])

    useEffect(() => {
        const getDataDashBoard = () => {
            let params = genParams();
            params["IsMobileApp"] = true;
            console.log("getDataDashBoard params ", params);
            new HTTPService().setPath(ApiPath.DASHBOARD).GET(params).then((res) => {
                console.log("getDataDashBoard res ", res);
                if (res)
                    setDataDashBoard(res)
            }).catch((e) => {
                console.log("getDataDashBoard err ", e);
            })
        }
        const getRevunue = () => {
            let params = genParams(true);
            new HTTPService().setPath(ApiPath.REVENUE).GET(params).then(async (res) => {
                console.log("getRevunue res ", res);
                if (res) {
                    let array = [];
                    res.forEach(element => {
                        let obj = { ...element, time: parseInt(dateToString(element.Subject.trim(), "YYYYMMDDHHmmss")) }
                        array.push(obj);
                    });
                    array = array.sort(compareValues('time'));

                    let input = {
                        res: array,
                        showHour: selectTimeForRevenue.key == "today" || selectTimeForRevenue.key == "yesterday" ? true : false
                    }
                    getDataChart(input)
                }

            }).catch((e) => {
                console.log("getRevunue err ", e);
            })
        }
        getDataDashBoard()
        getRevunue()
    }, [genParams])

    useEffect(() => {
        let param = { TimeRange: selectTime.key }
        const getListTopSell = () => {
            if (selectTime.key == 'custom') {
                return
            }
            new HTTPService().setPath(ApiPath.TOP_SELL).GET(param).then(res => {
                console.log('getListTopSell', res);
                if (res) {
                    setListTopSell([...res])
                }
            })
        }
        getListTopSell()
    }, [selectTime.key])

    const compareValues = (key, order = 'asc') => {
        return function innerSort(a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                return 0;
            }

            const varA = (typeof a[key] === 'string')
                ? a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string')
                ? b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ? (comparison * -1) : comparison
            );
        };
    }


    const getDataChart = (data) => {
        console.log('getDataChart', data);
        if (data.showHour) {
            timeFormat.current = "HH:mm"
        } else {
            timeFormat.current = "DD/MM"
        }
        handleDataChart(data.res)
    }

    const handleDataChart = (response) => {
        // // let totalSaleBranchs = [];
        // // let keyBranchs = [];
        let totalBranchs = [];
        // // let dataChartBranch = [];
        let times = [];
        // // this.listBranch.forEach((element, index) => {
        // let sum = 0;
        for (let item of response) {
            let data = item.Data;
            if (data["b_" + currentBranch.current.Id] && data["b_" + currentBranch.current.Id] != undefined && data["b_" + currentBranch.current.Id] != null) {
                // sum += data["b_" + currentBranch.current.Id]
                totalBranchs.push((data["b_" + currentBranch.current.Id] / 1000000))
            } else {
                totalBranchs.push(0)
            }
            times.push(dateToString(item.Subject.trim(), timeFormat.current))
        }
        console.log('totalBranchs', totalBranchs, 'times', times);
        setDataChart({ times, totalBranchs })
        // // keyBranchs.push(element.Id.toString())
        // // totalSaleBranchs.push({ IsSelect: index == 0 ? true : false, Id: element.Id, Name: element.Name, total: sum })
        // // });
        // for (let item of response) {
        //     let data = item.Data;
        //     let list = [];
        //     let sum = 0;
        //     let obj = {};
        //     this.listBranch.forEach(element => {
        //         if (element.Id == this.listBranch[0].Id && data["b_" + element.Id] && data["b_" + element.Id] != undefined && data["b_" + element.Id] != null) {
        //             list.push(data["b_" + element.Id]);
        //             sum += data["b_" + element.Id]
        //             obj[element.Id] = data["b_" + element.Id];
        //         } else {
        //             list.push(0);
        //             obj[element.Id] = 0;
        //         }
        //     });
        //     // dataChartBranch.push(obj)
        //     totalBranchs.push((sum / 1000000))
        //     times.push(dateToString(item.Subject.trim(), this.timeFormat))
        // }
        // console.log("handlerData data ", totalBranchs, keyBranchs, dataChartBranch, totalSaleBranchs, times);
        // this.setState({ totalBranchs: totalBranchs, keyBranchs: keyBranchs, dataChartBranch: dataChartBranch, totalSaleBranchs: totalSaleBranchs, times: times });
    }

    const onClickSelectTime = (item) => {
        console.log('onClickSelectTime', item);
        if (item.key == "custom") {
            setIsSelectCustom(true)
        } else {
            switch (typeSelectTime.current) {
                case 1:
                    setSelectTimeForRevenue({ ...item })
                    setShowModal(false)
                    break;
                case 2:
                    setSelectTime({ ...item })
                    setShowModal(false)
                    break;
                default:
                    break;
            }
        }

    }


    const onDoneSelectDate = () => {

    }

    const setDates = (dates) => {
        console.log('setDates', dates);
        setDateTimePicker({ ...dateTimePicker, ...dates })
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('tong_quan')}

            />
            <ScrollView>
                <View style={{ padding: 20 }}>
                    <View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ fontSize: 20, fontWeight: "bold", paddingBottom: 20 }}>{I18n.t('ket_qua_ban_hang')}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModal(true);
                                    typeSelectTime.current = 1
                                }}
                                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#E6EAEF", borderRadius: 10, padding: 10 }}>
                                <Text style={{ marginRight: 10, fontSize: 17, }}>{I18n.t(selectTimeForRevenue.name)}</Text>
                                <Image style={{ width: 10, height: 10 }} source={Images.icon_path_4203} />
                            </TouchableOpacity>
                        </View>
                        <View style={deviceType == Constant.TABLET ? { flexDirection: "row", } : {}}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row", paddingVertical: 10 }}>
                                    <Image style={{ width: 55, height: 55 }} source={Images.icon_circle} />
                                    <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
                                        <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('ban_dang_dung')}</Text>
                                        <Text style={{ fontSize: 23, color: "#36a3f7", fontWeight: "bold" }}>{dataDashBoard.Table ? dataDashBoard.Table : ""} / {dataDashBoard.TableCount ? dataDashBoard.TableCount : ""} </Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: "row", paddingVertical: 10 }}>
                                    <Image style={{ width: 55, height: 55 }} source={Images.icon_value_return} />
                                    <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
                                        <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('gia_tri_tra_lai')}</Text>
                                        <Text style={{ fontSize: 23, color: "#ff5959", fontWeight: "bold" }}>{dataDashBoard.AllReturn ? currencyToString(dataDashBoard.AllReturn) : "0"}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row", paddingVertical: 10 }}>
                                    <Image style={{ width: 55, height: 55 }} source={Images.icon_invoice_overview} />
                                    <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
                                        <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('don_hang')}</Text>
                                        <Text style={{ fontSize: 23, color: "#36a3f7", fontWeight: "bold" }}>{dataDashBoard.AllOrders ? dataDashBoard.AllOrders : "0"}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: "row", paddingVertical: 10 }}>
                                    <Image style={{ width: 55, height: 55 }} source={Images.icon_return_good} />
                                    <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
                                        <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('huy_tra')}</Text>
                                        <Text style={{ fontSize: 23, color: "#ff5959", fontWeight: "bold" }}>{dataDashBoard.Return ? dataDashBoard.Return : "0"}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ height: 1, width: "95%", alignSelf: "center", backgroundColor: "#E6EAEF", marginVertical: 15 }}></View>
                    <View>
                        <View style={{ flexDirection: "row", paddingVertical: 20 }}>
                            <Image style={{ width: 55, height: 55 }} source={Images.icon_revenue_overview} />
                            <View style={{ marginLeft: 20, justifyContent: "space-between" }}>
                                <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('doanh_thu_VND')}</Text>
                                <Text style={{ fontSize: 23, color: "#00c75f", fontWeight: "bold" }}>{dataDashBoard.AllRevenue ? currencyToString(dataDashBoard.AllRevenue) : "0"}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ paddingVertical: 10, }}>
                                    <Text style={{ fontSize: 17, color: "gray", paddingVertical: 7 }}>{I18n.t('tien_mat')}</Text>
                                    <Text style={{ fontSize: 23, color: "#34bfa3", fontWeight: "bold" }}>{dataDashBoard.AllCash ? currencyToString(dataDashBoard.AllCash) : "0"}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 17, color: "gray", paddingVertical: 7 }}>{I18n.t('khac')}</Text>
                                    <Text style={{ fontSize: 23, color: "#ff5959", fontWeight: "bold" }}>{dataDashBoard.AllOther ? currencyToString(dataDashBoard.AllOther) : "0"}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ paddingVertical: 10, }}>
                            <Text style={{ fontSize: 17, color: "gray", paddingVertical: 7 }}>{I18n.t('ghi_no')}</Text>
                            <Text style={{ fontSize: 23, color: "#f6871e", fontWeight: "bold" }}>{dataDashBoard.AllDebt ? currencyToString(dataDashBoard.AllDebt) : "0"}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 5, width: "100%", alignSelf: "center", backgroundColor: "#E6EAEF", marginVertical: 15 }}></View>
                <View style={{ padding: 20 }}>
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: "bold", paddingBottom: 20 }}>{I18n.t('doanh_thu_VND')}</Text>
                        <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('bieu_do_doanh_thu')}</Text>
                    </View>
                    {dataChart.totalBranchs.length > 0 ?
                        <View style={{ flexDirection: "row", paddingVertical: 20 }}>
                            <YAxis
                                style={{ height: 300, width: 50 }}
                                data={dataChart.totalBranchs}
                                contentInset={{ top: 10, bottom: 10 }}
                                svg={{
                                    fill: colors.colorchinh,
                                    fontSize: 8,
                                }}
                                numberOfTicks={5}
                                formatLabel={(value) => `${value} ${I18n.t("trieu")}`}
                                min={0}
                            />
                            <BarChart
                                style={{ height: 300, flex: 1 }}
                                data={dataChart.totalBranchs}
                                contentInset={{ top: 10, bottom: 10 }}
                                svg={{ fill: colors.colorchinh }}
                                gridMin={0}
                            ><Grid />
                            </BarChart>
                        </View>
                        : null}
                    {dataChart.times.length > 0 ? <XAxis
                        style={{ marginHorizontal: 0, height: 40 }}
                        data={dataChart.times}
                        formatLabel={(value, index) => {
                            return dataChart.times[`${index}`]
                        }}
                        contentInset={{
                            left: dataChart.times.length < 4 ? 120 : dataChart.times.length > 4 && dataChart.times.length < 10 ? 85 : 75,
                            right: dataChart.times.length < 10 ? 10 : dataChart.times.length > 10 && dataChart.times.length < 18 ? 0 : -10
                        }}
                        svg={{
                            fontSize: 10, fill: 'black', rotation: 35, originY: 0,
                            y: timeFormat.current == "DD/MM" ? 15 : 20
                        }}
                    />
                        :
                        null}
                    <Text style={{ textAlign: "center", paddingTop: 20, fontSize: 20, fontWeight: "bold" }}> Tổng (VND): {dataDashBoard.AllRevenue ? currencyToString(dataDashBoard.AllRevenue) : "0"}</Text>
                </View>
                <View style={{ height: 5, width: "100%", alignSelf: "center", backgroundColor: "#E6EAEF", marginVertical: 15 }}></View>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 20 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", }}>{I18n.t('san_pham_ban_chay')}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowModal(true);
                                typeSelectTime.current = 2
                            }}
                            style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#E6EAEF", borderRadius: 10, padding: 10 }}>
                            <Text style={{ marginRight: 10, fontSize: 17, }}>{I18n.t(selectTime.name)}</Text>
                            <Image style={{ width: 10, height: 10 }} source={Images.icon_path_4203} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        {listTopSell.map((item, index) => {
                            return (
                                <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 15 }}>
                                    <Text style={{ fontSize: 17 }}>{item.Name}</Text>
                                    <View style={{ backgroundColor: "#F3DAC8", borderRadius: 10, padding: 5, }}>
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.colorchinh }}>{item.Quantity}</Text>
                                    </View>
                                </View>

                            )
                        })}
                    </View>
                </View>
            </ScrollView>
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
                                        typeSelectTime.current == 2 ?
                                            Constant.TIME_SELECT.map((item, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => onClickSelectTime(item)}
                                                        key={index} style={{ paddingVertical: 15, }}>
                                                        <Text style={{ fontSize: 17, textAlign: "center" }}>{I18n.t(item.name)}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                            :
                                            Constant.TIME_SELECT_CUSTOM_TIME.map((item, index) => {
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
                                    <DateRangePicker
                                        visible={true}
                                        onChange={(dates) => setDates(dates)}
                                        endDate={dateTimePicker.endDate}
                                        startDate={dateTimePicker.startDate}
                                        displayedDate={dateTimePicker.displayedDate}
                                        range
                                    >
                                    </DateRangePicker>
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
    );
};
