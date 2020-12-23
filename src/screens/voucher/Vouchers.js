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
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, dateToDate } from '../../common/Utils';
import { Constant } from '../../common/Constant';
import useDebounce from '../../customHook/useDebounce';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import DateTime from '../../components/filter/DateTime';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { FAB } from 'react-native-paper';
import { result } from 'underscore';

export default (props) => {
    const [listVoucher, setListVoucher] = useState([])
    const count = useRef(0)
    const currentCount = useRef(0)
    const [loadMore, setLoadMore] = useState(false)
    const flatlistRef = useRef(null)
    const [onShowModal, setOnShowModal] = useState(false)
    const [onShowModalClickItem, setShowModalClickItem] = useState(false)
    const [onShowModalAdd, setShowModalAdd] = useState(false)
    const [onCheckDel, setModalCheckDel] = useState(false)
    const itemClick = useRef({})
    const [ispercent,setIsPercent] = useState(false)
    const [quantity, setQuantity] = useState(0)
    const [filter, setFilter] = useState({
        time: Constant.TIME_SELECT_ALL_TIME[0],
    })
    const filterRef = useRef({
        time: Constant.TIME_SELECT_ALL_TIME[4],
        skip: 0
    })
    const onEndReachedCalledDuringMomentum = useRef(false)
    const listVoucherRef = useRef(null)

    useEffect(() => {
        getListVoucher(true)
    }, [])
    const onRefresh = () => {
        filterRef.current.skip = 0
        getListVoucher(true)
    }
    const getListVoucher = (reset = false) => {
        let params = initParam()
        console.log("params voucher", params);
        dialogManager.showLoading()
        new HTTPService().setPath(ApiPath.VOUCHER).GET(params).then((res) => {
            let result = res.results.filter(item => item.Id > 0)
            count.current = res.__count
            currentCount.current = result.length
            if (reset) {
                setListVoucher([...result])
            } else {
                setListVoucher([...listVoucher, ...result])
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
            getListVoucher()
        }
    }
    const initParam = () => {
        const { startDate, endDate } = filterRef.current.time
        let params = { skip: filterRef.current.skip, top: Constant.LOAD_LIMIT }
        let arrItemPath = []
        if (filterRef.current.time.key != "custom") {
            if (filterRef.current.time.key != Constant.TIME_SELECT_ALL_TIME[4].key) {
                arrItemPath.push(`CreatedDate eq '${filterRef.current.time.key}'`)
            }
        } if (startDate) {
            let startDateFilter = momentToStringDateLocal(startDate.set({ 'hour': 0, 'minute': 0, 'second': 0 }))
            let endDateFilter = momentToStringDateLocal(endDate ? endDate : startDate.set({ 'hour': 23, 'minute': 59, 'second': 59 }))
            arrItemPath.push("CreatedDate+ge+'datetime''" + startDateFilter.toString().trim() + "'''");
            arrItemPath.push("CreatedDate+ge+'datetime'" + endDateFilter.toString().trim() + "'''");
            params['filter'] = `(${arrItemPath.join(' and ')})`
        }
        params['filter'] = `(${arrItemPath.join(' and ')})`
        return params
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
    const onClickFilter = () => {
        setOnShowModal(true)
    }
    useEffect(() => {
        console.log("list voucher", listVoucher);
    }, [listVoucher])
    const onClickItemVoucher = (item) => {
        itemClick.current = item
        console.log("itemclick", itemClick);
        setShowModalClickItem(true)
    }
    const onClickDel = () => {
        setShowModalClickItem(false)
        setModalCheckDel(true)
    }
    const delVoucher = () => {
        new HTTPService().setPath(ApiPath.VOUCHER + "/" + itemClick.current.Id).DELETE({}).then((res) => {
            console.log("mess", res);
            onRefresh()
        }).catch((e) => {
            console.log("error del", e);
        })
        setModalCheckDel(false)
    }
    useEffect(()=>{
        console.log("quantity",quantity);
    },[quantity])
    const renderItem = (item, index) => {
        return (
            <TouchableOpacity onPress={() => onClickItemVoucher(item)}>
                <View style={{ backgroundColor: 'white', borderRadius: 10, margin: 2, padding: 5 }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 3 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{item.Code}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00B2EE' }}>{I18n.t('so_luong')}: </Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00B2EE' }}>{item.Quantity}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#696969', height: 0.5, marginLeft: 5, marginRight: 5 }}></View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 3 }}>
                        <Text style={{ fontSize: 12, color: '#696969' }}>{I18n.t("ngay_tao")}</Text>
                        <Text style={{ fontSize: 12 }}>{dateToDate(item.CreatedDate)}</Text>
                    </View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 3 }}>
                        <Text style={{ fontSize: 12, color: '#696969' }}>{I18n.t("ngay_het_han")}</Text>
                        <Text style={{ fontSize: 12 }}>{item.ExpiryDate ? dateToDate(item.ExpiryDate) : ''}</Text>
                    </View>
                    <View style={{ backgroundColor: '#696969', height: 0.5, marginLeft: 5, marginRight: 5 }}></View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 3 }}>
                        <Text style={{ fontSize: 12, color: '#696969' }}>{I18n.t("gia_tri")}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00B2EE' }}>{item.IsPercent == true ? item.Value + '%' : currencyToString(item.Value) + 'đ'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ backgroundColor: '#B5B5B5', flex: 1, flexDirection: 'column' }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('voucher')}
            />
            <View style={{ justifyContent: 'space-between', backgroundColor: 'white', flexDirection: 'row', padding: 10, marginBottom: 2 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => onClickFilter()}>
                    <Image source={Images.icon_calendar} style={{ width: 20, height: 20 }} />
                    <Text style={{ marginHorizontal: 10 }}>{filter.time.name.includes('-') ? filter.time.name : I18n.t(filter.time.name)}</Text>
                    <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                </TouchableOpacity>
                <Text>{listVoucher.length}/{count.current}</Text>
            </View>
            {
                listVoucher.length > 0 ?
                    <FlatList
                        data={listVoucher}
                        onEndReachedThreshold={0.1}
                        onEndReached={onLoadMore}
                        renderItem={({ item, index }) => renderItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                        ref={refs => listVoucherRef.current = refs}
                        ListFooterComponent={loadMore ? <ActivityIndicator color={colors.colorchinh} /> : null}
                        onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false }}
                        ref={flatlistRef}
                    />
                    : <Text style={{ fontSize: 12, textAlign: 'center' }}>Chưa có Voucher</Text>
            }
            <FAB
                style={{ position: 'absolute', backgroundColor: "#1874CD", right: 10, bottom: 10 }}
                big
                icon="plus"
                onPress={() => setShowModalAdd(true)}
            />
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
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={onShowModalClickItem}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModalClickItem(false)
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
                    <View style={{ width: Metrics.screenWidth * 0.8, backgroundColor: 'white', borderRadius: 5 }}>
                        <View style={{ justifyContent: 'space-between', flexDirection: 'row', margin: 5 }}>
                            <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{itemClick.current.Code}</Text>
                            <Text style={{ marginRight: 10 }} onPress={() => setShowModalClickItem(false)}>X</Text>
                        </View>
                        <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 5 }}>
                            <Text style={{ color: '#696969', marginLeft: 10 }}>{I18n.t("gia_tri")}: {itemClick.current.IsPercent==false?currencyToString(itemClick.current.Value)+'đ':itemClick.current.Value+'%'}</Text>
                            <Text style={{ color: '#696969', marginRight: 10 }}>{I18n.t("so_luong")}: {itemClick.current.Quantity}</Text>
                        </View>{
                            itemClick.current.ExpiryDate ?
                                <Text style={{ color: '#696969', marginLeft: 10, padding: 5 }}>{I18n.t("ngay_het_han")}: {dateToDate(itemClick.current.ExpiryDate)}</Text>
                                : null
                        }
                        <View style={{ flexDirection: 'column', marginLeft: 10, marginRight: 10, padding: 5, marginBottom: 10 }}>
                            <TouchableOpacity style={{ backgroundColor: '#87CEFF', borderRadius: 5, alignItems: 'center' }}>
                                <Text style={{ color: '#1E90FF', fontWeight: 'bold' }}>{I18n.t("in_may_thu_ngan")}</Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: '#FFD39B', borderRadius: 5, alignItems: 'center', marginRight: 7, padding: 5 }}>
                                    <Text style={{ color: '#FF7F24', fontWeight: 'bold' }}>in máy in tem</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: '#FA8072', borderRadius: 5, alignItems: 'center', marginLeft: 7, padding: 5 }} onPress={onClickDel}>
                                    <Text style={{ color: '#FF3030', fontWeight: 'bold' }}>Xoá</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={onCheckDel}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setModalCheckDel(false)
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
                        <View style={{ backgroundColor: 'white', borderRadius: 5 }}>
                            <Text style={{ fontWeight: 'bold', padding: 10 }}>{itemClick.current.Code}</Text>
                            <Text style={{ margin: 10 }}>Bạn có chắc muốn xoá mã khuyến mãi?</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 10, marginRight: 10, padding: 10 }}>
                                <TouchableOpacity style={styles.btnHuy}
                                    onPress={() => setModalCheckDel(false)}>
                                    <Text style={styles.contenBtnHuy}>Huỷ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnDongY}
                                    onPress={delVoucher}>
                                    <Text style={styles.contenBtnDongY}>Đồng ý</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={onShowModalAdd}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModalAdd(false)
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
                    <View style={{ width: Metrics.screenWidth * 0.8 ,borderRadius:15}}>
                        <View style={{ alignItems: 'center', backgroundColor: '#FF4500',borderTopStartRadius:15, borderTopEndRadius:15 }}>
                            <Text style={{ color: 'white', padding: 10, fontSize: 14 }}>Them moi phieu voucher</Text>
                        </View>
                        <View style={{ backgroundColor: 'white' , borderBottomStartRadius:15, borderBottomEndRadius:15}}>
                            <View style={{ flexDirection: 'row', padding: 10 }}>
                                <Text style={styles.contentTitle}>Ma voucher</Text>
                                <TextInput style={{ flex: 2, borderColor: '#B5B5B5', borderWidth: 0.5, borderRadius: 3, height: 20, backgroundColor: '#E8E8E8', textAlign:'center' }}></TextInput>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 10 }}>
                                <Text style={styles.contentTitle}>Gia tri</Text>
                                <View style={{ flexDirection: 'row', flex: 2 }}>
                                    <View style={{ flex: 1, flexDirection: 'row', borderRadius: 3,borderColor: '#FF4500', borderWidth:0.5}}>
                                        <TouchableOpacity style={ispercent==false?styles.btnPercent:styles.btnNotPercent} onPress={()=>setIsPercent(false)}>
                                            <Text style={ispercent==false?styles.contenBtnDongY:styles.contenBtnHuy}>VND</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={ispercent==true?styles.btnPercent:styles.btnNotPercent} onPress={()=>setIsPercent(true)}>
                                            <Text style={ispercent==true?styles.contenBtnDongY:styles.contenBtnHuy}>%</Text>
                                        </TouchableOpacity>
                                    </View>
                                        <TextInput style={{flex: 1.5,marginLeft:5, borderColor: '#B5B5B5', borderWidth: 0.5, borderRadius: 3, height: 20, backgroundColor: '#E8E8E8',textAlign:'right',padding:3 }} keyboardType='numeric' placeholder='0'></TextInput>

                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 10 }}>
                                <Text style={styles.contentTitle}>Ngay het han</Text>
                                <View style={{flex:2, flexDirection:'row'}}>
                                <TextInput style={{ flex: 10, borderColor: '#B5B5B5', borderWidth: 0.5, borderRadius: 3, height: 20, backgroundColor: '#E8E8E8', justifyContent:'center',textAlign:'center' }} editable={false} placeholder='Chon ngay het han'></TextInput>
                                <TouchableOpacity style={{flex:1.5, marginLeft:10}}>
                                <Image source={Images.icon_calendar} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 10 }}>
                                <Text style={styles.contentTitle}>So luong</Text>
                                <View style={{flex:2, flexDirection:'row'}}>
                                    <TouchableOpacity style = {{flex:1,borderWidth:0.5,borderColor:'#FF4500', alignItems:'center',borderRadius:3, marginRight:10}} onPress={()=>setQuantity(quantity>=1?quantity-1:0)}>
                                        <Text style={{color:'#FF4500'}}>-</Text>
                                    </TouchableOpacity>
                                <TextInput style={{ flex: 6, borderColor: '#B5B5B5', borderWidth: 0.5, borderRadius: 3, height: 20, backgroundColor: '#E8E8E8',textAlign:'center' }} keyboardType='numeric' placeholder='0' value={quantity!=0?quantity.toString():null} onChangeText={text=>setQuantity(text)}></TextInput>
                                <TouchableOpacity style={{flex:1, marginLeft:10,borderWidth:0.5,borderColor:'#FF4500', borderRadius:3,alignItems:'center'}} onPress={()=>{setQuantity(quantity+1)}}>
                                     <Text style={{color:'#FF4500'}}>+</Text>
                                </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{marginLeft:5, marginRight:5,backgroundColor:'#CFCFCF',height:0.5}}></View>
                            <View style={{flexDirection:'row', marginLeft:10, marginRight:10, padding:10}}>
                                    <TouchableOpacity style={styles.btnHuy} onPress={()=>setShowModalAdd(false)}>
                                        <Text style={styles.contenBtnHuy}>Huy bo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnDongY}>
                                        <Text style={styles.contenBtnDongY}>Xong</Text>
                                    </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>


        </View>

    )
}
const styles = StyleSheet.create({
    btnHuy:{
        flex: 1, alignItems: 'center', padding: 5, backgroundColor: 'white', borderRadius: 3, borderWidth: 1, borderColor: '#FF4500', marginRight: 5, marginLeft:10
    },
    btnDongY:{
        flex: 1, alignItems: 'center', padding: 5, backgroundColor: '#FF4500', borderRadius: 3, marginRight: 10, marginLeft:5  
    },
    contenBtnHuy:{
        color: '#FF4500'
    },
    contenBtnDongY:{
        color:'white'
    },
    contentTitle:{
        flex:1,
        color:'#9C9C9C'
    },
    btnPercent:{
        backgroundColor:'#FF4500',
        alignItems:'center',flex:1
        , borderColor: '#FF4500',borderRadius:3
    },
    btnNotPercent:{
        backgroundColor:'white',
        alignItems:'center',flex:1
        , borderRadius:3
    },
    textInput:{
        textAlign: 'center',
        alignItems:'center',
        alignContent:'center'
    }

    
})