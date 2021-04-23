import React, { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { Image, Modal, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import I18n from '../../common/language/i18n';
import { FlatList } from 'react-native-gesture-handler';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { ScreenList } from '../../common/ScreenList';
import dialogManager from '../../components/dialog/DialogManager';
import { useSelector } from 'react-redux';
import MainToolBar from '../main/MainToolBar';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias } from '../../common/Utils';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { Constant } from '../../common/Constant';
import useDebounce from '../../customHook/useDebounce';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import DateTime from '../../components/filter/DateTime';
import RoomHistoryDetail from '../../screens/roomHistory/RoomHistoryDetails'
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';

export default (props) => {
    const [roomHistoryData, setRoomHistoryData] = useState([])
    const [roomHistoryItem, setHistoryItem] = useState([])
    const [inputSearch, setInputSearch] = useState('')
    const [loadMore, setLoadMore] = useState(false)
    const [data, setData] = useState([])
    const [viewData, setViewData] = useState([])
    const [filter, setFilter] = useState({
        time: Constant.TIME_SELECT_ALL_TIME[0],
    })
    const [onShowModal, setOnShowModal] = useState(false)
    const currentBranch = useRef({})
    const count = useRef(0)
    const currentCount = useRef(0)
    const currentProduct = useRef(0)
    const onEndReachedCalledDuringMomentum = useRef(false)
    const flatlistRef = useRef(null)
    const { deviceType, isFNB } = useSelector(state => {
        return state.Common
    })
    const filterRef = useRef({
        time: Constant.TIME_SELECT_ALL_TIME[0],
        skip: 0
    })
    const roomHistoryRef = useRef(null)
    const debounceTextSearch = useDebounce(inputSearch)
    useEffect(() => {
        console.log("isFNB",isFNB);
        if (isFNB)
            getBranch()
        //setRoomHistoryData([])
    }, [])
    const getBranch = async () => {
        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        if (branch) {
            currentBranch.current = JSON.parse(branch)
            getRoomHistoryData(true)
            console.log("abc", branch);
        }
    }
    // useEffect(() => {

    //     const getData = async() => {
    //         let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
    //     if (branch) {
    //         currentBranch.current = JSON.parse(branch)
    //         let params = initParam();
    //         params = { ...params, includes: ['Room', 'Product'], IncludeSummary: true };
    //         new HTTPService().setPath(ApiPath.ROOM_HISTORY).GET(params).then((res) => {
    //             let result = res.results.filter(item => item.Id > 0)
    //             setData(result)
    //             console.log("dataaaaaa", data);
    //         }).catch((e) => {
    //             console.log("error", e);
    //         })
    //     }

    //     }
    //     //getData()
    // }, [])

    useEffect(() => {
        const getProductBySearch = () => {
            setViewData([])
            setRoomHistoryData([])
            if (debounceTextSearch != '') {
                filterRoomHistory(debounceTextSearch)
            } else {
                if(currentBranch.current && currentBranch.current.Id)
                onRefresh()
            }
        }
        getProductBySearch()
    }, [debounceTextSearch])
    const filterRoomHistory = (input) => {
        viewData.splice(0, viewData.length)
        setRoomHistoryData([])
        currentProduct.current = 0
        dialogManager.showLoading()
        for (let i = 0; i < data.length; i++) {
            if (change_alias(data[i].Product.Name).indexOf(change_alias(input)) != -1) {
                viewData.push(data[i])
            }
        }
        setViewData(viewData)
        count.current = viewData.length
        if (count.current < Constant.LOAD_LIMIT) {
            setRoomHistoryData(viewData)
            count.current = viewData.length
            currentProduct.current = viewData.length
        }
        else {
            setRoomHistoryData(viewData.slice(currentProduct.current, currentProduct.current + Constant.LOAD_LIMIT))
            currentProduct.current = currentProduct.current + Constant.LOAD_LIMIT
        }
        setTimeout(() => {
            dialogManager.hiddenLoading()
        }, 1000)

    }

    const filterMore = () => {
        console.log("filtermore");
        if (currentProduct.current < viewData.length && !onEndReachedCalledDuringMomentum.current) {
            dialogManager.showLoading()
            setLoadMore(true)
            onEndReachedCalledDuringMomentum.current = true
            getFilterData()
        }
    }
    const getFilterData = () => {
        console.log("Length viewdata", viewData.length);
        let slideData = viewData.slice(currentProduct.current, currentProduct.current + Constant.LOAD_LIMIT)
        setRoomHistoryData([...roomHistoryData, ...slideData])
        currentProduct.current = currentProduct.current + Constant.LOAD_LIMIT
        console.log("to current", currentProduct.current);
        setLoadMore(false)
        setTimeout(() => {
            dialogManager.hiddenLoading()
        }, 1000)
    }

    const getRoomHistoryData = (reset = false) => {
        let params = initParam();
        params = { ...params, includes: ['Room', 'Product'], IncludeSummary: true };
        dialogManager.showLoading()
        new HTTPService().setPath(ApiPath.ROOM_HISTORY).GET(params).then((res) => {
            let result = res.results.filter(item => item.Id > 0)
            count.current = res.__count
            currentCount.current = result.length
            if (reset) {
                setRoomHistoryData([...result])
            } else {
                setRoomHistoryData([...roomHistoryData, ...result])
            }
            setLoadMore(false)
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("error", e);
            dialogManager.hiddenLoading()
        })
    }
    const onLoadMore = () => {
        if (!(currentCount.current < Constant.LOAD_LIMIT) && !onEndReachedCalledDuringMomentum.current) {
            setLoadMore(true)
            filterRef.current = {
                ...filterRef.current,
                skip: filterRef.current.skip + Constant.LOAD_LIMIT
            }
            onEndReachedCalledDuringMomentum.current = true
            console.log("onLoadmore");
            getRoomHistoryData()
        }
    }
    const onCLickRoomHistoryItem = (item) => {
        if (deviceType == Constant.TABLET) {
            setHistoryItem({ ...item })
        } else {
            console.log('onClickRoomItem', item, props);
            props.navigation.navigate(ScreenList.RoomHistoryDetailForPhone, { item })
        }
    }
    useEffect(() => {
        getFilterData()
    }, [onEndReachedCalledDuringMomentum.current])
    useEffect(() => {
        console.log("room history data", roomHistoryData);
    }, [roomHistoryData])
    const renderListItem = (item, index) => {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => onCLickRoomHistoryItem(item)} style={{ marginBottom: 5, borderWidth: 0.5, marginLeft: 5, marginRight: 5, borderRadius: 15, borderColor: '#9C9C9C' }}>
                <View style={{ flexDirection: "row", alignItems: 'center', alignContent: 'center', padding: 7, borderRadius: 15, backgroundColor: roomHistoryItem ? item.Id == roomHistoryItem.Id ? "#F6DFCE" : 'white' : 'white' }}>
                    <Image source={Images.icon_return_good} style={{ width: 48, height: 48 }} />
                    <View style={{ flex: 1, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#363636', paddingVertical: 5 }}>{item.Product.Name}</Text>
                            <Text style={{ fontSize: 14, marginLeft: 10, marginTop: 3, color: '#4F4F4F', paddingVertical: 5 }}>{item.Room.Name}[{item.Pos}]</Text>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 5, marginLeft: 10, }}>
                                <Text style={{ fontSize: 14, color: '#4F4F4F' }}>{I18n.t('so_luong')}: </Text>
                                <Text style={{ fontSize: 14, color: '#4F4F4F' }}>{currencyToString(item.Quantity)} {item.Product.Unit}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 10, paddingVertical: 5 }}>
                            <Text style={{ fontSize: 14, color: '#FF0000', fontStyle: 'italic', paddingVertical: 5 }}>{item.Description}</Text>
                            <Text style={{ fontSize: 14, color: '#4F4F4F', paddingVertical: 5 }}>{dateToStringFormatUTC(item.CreatedDate)}</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0099FF', paddingVertical: 5 }}>{currencyToString(item.Price)}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    const renderFilter = () => {
        return <DateTime
            timeAll={true}
            outputDateTime={outputDateTime} />
    }

    const outputDateTime = (item) => {
        if (item != null) {
            setFilter({ ...filter, time: item })
            filterRef.current = { ...filterRef, time: item }
            onRefresh()
            setOnShowModal(false)
        }
        else {
            setOnShowModal(false)
        }
    }
    const onRefresh = () => {
        filterRef.current.skip = 0
        getRoomHistoryData(true)
    }
    const onClickFilter = () => {
        setOnShowModal(true)
    }
    const initParam = () => {
        const { startDate, endDate } = filterRef.current.time;
        let params = { skip: filterRef.current.skip, top: Constant.LOAD_LIMIT }
        let arrItemPath = []

        if (currentBranch.current.Id) {
            arrItemPath.push(`BranchId eq ${currentBranch.current.Id}`)
        }
        if (filterRef.current.time.key != "custom") {
            if (filterRef.current.time.key != Constant.TIME_SELECT_ALL_TIME[4].key) {
                arrItemPath.push(`CreatedDate eq '${filterRef.current.time.key}'`)
            }
        } if (startDate) {
            let startDateFilter = momentToStringDateLocal(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = momentToStringDateLocal((endDate ? endDate : startDate).set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            arrItemPath.push("CreatedDate+ge+'datetime''" + startDateFilter.toString().trim() + "'''");
            arrItemPath.push("CreatedDate+lt+'datetime''" + endDateFilter.toString().trim() + "'''");
            params['filter'] = `(${arrItemPath.join(" and ")})`;
        }
        params['filter'] = `(${arrItemPath.join(' and ')})`
        console.log('params', params);
        return params;

    }
    return (
        <View style={{ flex: 1, }}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('lich_su_huy_tra_do')}
            />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', borderRightWidth: 1, borderRightColor: 'silver', justifyContent: 'space-between', backgroundColor: '#E8E8E8', borderBottomWidth: 1, borderBottomColor: '#828282' }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => onClickFilter()}>
                            <Image source={Images.icon_calendar} style={{ width: 48, height: 48 }} />
                            <Text style={{ marginHorizontal: 10, fontSize: 14 }}>{filter.time.name.includes('-') ? filter.time.name : I18n.t(filter.time.name)}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 15, marginRight: 10, fontWeight: 'bold' }}>{roomHistoryData.length} / {count.current}</Text>
                    </View>
                    <View style={{ flex: 1, borderRightWidth: 0.5, borderRightColor: 'silver', backgroundColor: '#E8E8E8' }}>
                        <TextInput style={{ borderWidth: 1, marginTop: 10, backgroundColor: '#FFFFFF', borderColor: '#828282', borderRadius: 10, marginBottom: 10, marginLeft: 10, marginRight: 10, padding: 10, color: "#000" }} inlineImageLeft='search_icon' placeholderTextColor="#808080" placeholder={I18n.t('nhap_tu_khoa_tim_kiem')} onChangeText={text => setInputSearch(text)}></TextInput>
                        {
                            roomHistoryData.length > 0 ?
                                <FlatList
                                    data={roomHistoryData}
                                    onEndReachedThreshold={0.1}
                                    onEndReached={viewData.length == 0 ? onLoadMore : filterMore}
                                    renderItem={({ item, index }) => renderListItem(item, index)}
                                    keyExtractor={(item, index) => index.toString()}
                                    ref={refs => roomHistoryRef.current = refs}
                                    ListFooterComponent={loadMore ? <ActivityIndicator color={colors.colorchinh} /> : null}
                                    onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false }}
                                    ref={flatlistRef}
                                />
                                : <View style={{ backgroundColor: 'white', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, textAlign: 'center' }}>{I18n.t('chua_co_lich_su_huy_tra')}</Text>
                                </View>
                        }
                    </View>
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <ScrollView style={{ flex: 1 }}>
                            <View style={{}}>
                                <RoomHistoryDetail
                                    roomHistoryItem={roomHistoryItem} />
                            </View>
                        </ScrollView>
                        :
                        null
                }
            </View>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={onShowModal}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setOnShowModal(false)
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