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
import { currencyToString } from '../../common/Utils';


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
    const currentBranch = useRef('')
    const typeSelectTime = useRef(null) // 1: selectTimeForRevenue ; 2: selectTime
    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });
    const fill = 'rgb(134, 65, 244)'
    const data = [50, 10, 40, 95, -4, -24, null, 85, undefined, 0, 35, 53, -53, 24, 50, -20, -80]

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
        let params = { TimeRange: selectTimeForRevenue.key };
        console.log("genParams time startDate, endDate ", selectTimeForRevenue.key, startDate, endDate);

        if (selectTimeForRevenue.key == "custom" && startDate) {
            let startDateFilter = momentToStringDateLocal(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = momentToStringDateLocal((endDate ? endDate : startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            params = { TimeRange: selectTimeForRevenue.key, StartDate: startDateFilter, EndDate: endDateFilter }
        }

        let arrItemPath = [];
        if (currentBranch.current.Id != "") {
            arrItemPath.push(currentBranch.current.Id)
        }
        console.log("arrItemPath ", arrItemPath);
        if (arrItemPath.length > 0)
            params["BranchIds"] = arrItemPath;
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
        getDataDashBoard()
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
                                <Text style={{ marginRight: 10, fontSize: 17, }}>{selectTimeForRevenue.name}</Text>
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
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", paddingBottom: 20 }}>{I18n.t('doanh_thu_VND')}</Text>
                        <Text style={{ fontSize: 17, color: "gray" }}>{I18n.t('bieu_do_doanh_thu')}</Text>
                    </View>
                    <View>
                        <BarChart style={{ height: 200 }} data={data} svg={{ fill }} contentInset={{ top: 30, bottom: 30 }}>
                            <Grid />
                        </BarChart>
                    </View>
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
                            <Text style={{ marginRight: 10, fontSize: 17, }}>{selectTime.name}</Text>
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
                                                        <Text style={{ fontSize: 17, textAlign: "center" }}>{item.key}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                            :
                                            Constant.TIME_SELECT_ALL_TIME.map((item, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => onClickSelectTime(item)}
                                                        key={index} style={{ paddingVertical: 15, }}>
                                                        <Text style={{ fontSize: 17, textAlign: "center" }}>{item.key}</Text>
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
