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
import DatePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/MaterialIcons'
import { ceil } from 'react-native-reanimated';

export default (props) => {
    const [listVoucher, setListVoucher] = useState([])
    const count = useRef(0)
    const currentCount = useRef(0)
    const [loadMore, setLoadMore] = useState(false)
    const flatlistRef = useRef(null)
    const typeModal = useRef(null)
    const [onShowModal, setOnShowModal] = useState(false)
    const itemClick = useRef({})
    const [ispercent, setIsPercent] = useState(false)
    const [quantity, setQuantity] = useState(0)
    const dateTmp = useRef()
    const [expiryDate, setExpityDate] = useState()
    const [randomCode, setCode] = useState()
    const valueVoucher = useRef()
    const [filter, setFilter] = useState({
        time: Constant.TIME_SELECT_ALL_TIME[0],
    })
    const filterRef = useRef({
        time: Constant.TIME_SELECT_ALL_TIME[0],
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
    const postVoucher = () => {
        let param = {
            Voucher: {
                Code: randomCode,
                ExpiryDate: dateTmp.current ? dateTmp.current : null,
                IsPercent: ispercent,
                Quantity: parseInt(quantity),
                Value: parseInt(valueVoucher.current)
            }
        }
        new HTTPService().setPath(ApiPath.VOUCHER).POST(param).then((res) => {
            console.log("mess", res);
            onRefresh()
        }).catch((e) => {
            console.log("error del", e);
        })
        setOnShowModal(false)
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
        return typeModal.current == 1 ?
            <DateTime
                timeAll={true}
                outputDateTime={outputDateTime} />
            : typeModal.current == 2 ?
                <View style={{ backgroundColor: 'white', borderRadius: 15 }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 5, marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>{itemClick.current.Code}</Text>
                        <Ionicons name="close" size={30} color="black" onPress={() => setOnShowModal(false)} />
                    </View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 5 }}>
                        <Text style={{ color: '#696969', marginLeft: 10 }}>{I18n.t("gia_tri")}: {itemClick.current.IsPercent == false ? currencyToString(itemClick.current.Value) + 'đ' : itemClick.current.Value + '%'}</Text>
                        <Text style={{ color: '#696969', marginRight: 10 }}>{I18n.t("so_luong")}: {itemClick.current.Quantity}</Text>
                    </View>{
                        itemClick.current.ExpiryDate ?
                            <Text style={{ color: '#696969', marginLeft: 10, padding: 5 }}>{I18n.t("ngay_het_han")}: {dateToDate(itemClick.current.ExpiryDate)}</Text>
                            : null
                    }
                    <View style={{ flexDirection: 'column', marginLeft: 10, marginRight: 10, padding: 5, marginBottom: 10 }}>
                        <TouchableOpacity style={{ backgroundColor: '#87CEFF', borderRadius: 5, alignItems: 'center', padding: 5, height: 50, justifyContent: 'center' }}>
                            <Text style={{ color: '#1E90FF', fontWeight: 'bold' }}>{I18n.t("in_may_in_thu_ngan")}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', marginTop: 10, height: 50 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#FFD39B', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 7, padding: 5 }}>
                                <Text style={{ color: '#FF7F24', fontWeight: 'bold' }}>{I18n.t("in_may_in_tem")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#FA8072', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 7, padding: 5 }} onPress={onClickDel}>
                                <Text style={{ color: '#FF3030', fontWeight: 'bold' }}>{I18n.t("xoa")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View> :
                typeModal.current == 3 ?
                    <View style={{ backgroundColor: 'white', borderRadius: 15 }}>
                        <Text style={{ fontWeight: 'bold', padding: 10 }}>{itemClick.current.Code}</Text>
                        <Text style={{ margin: 10 }}>{I18n.t('ban_co_chac_muon_xoa_voucher_nay')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 10, marginRight: 10, padding: 10 }}>
                            <TouchableOpacity style={styles.btnHuy}
                                onPress={() => { setOnShowModal(false) }}>
                                <Text style={styles.contenBtnHuy}>{I18n.t("huy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnDongY}
                                onPress={delVoucher}>
                                <Text style={styles.contenBtnDongY}>{I18n.t("dong_y")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View> :
                    typeModal.current == 4 ?
                        <View>
                            <View style={{ alignItems: 'center', backgroundColor: '#FF4500', borderTopStartRadius: 15, borderTopEndRadius: 15 }}>
                                <Text style={{ color: 'white', padding: 10, fontSize: 14 }}>{I18n.t("them_moi_voucher")}</Text>
                            </View>
                            <View style={{ backgroundColor: 'white', borderBottomStartRadius: 15, borderBottomEndRadius: 15, }}>
                                <View style={{ flexDirection: 'row', padding: 10, marginTop: 10 }}>
                                    <Text style={styles.contentTitle}>{I18n.t("ma_voucher")}</Text>
                                    <TextInput style={[styles.styleTextInput, { flex: 2, marginLeft: 15 }]} value={randomCode} onChangeText={text => setCode(text)}></TextInput>
                                </View>
                                <View style={{ flexDirection: 'row', padding: 10 }}>
                                    <Text style={styles.contentTitle}>{I18n.t("gia_tri")}</Text>
                                    <View style={{ flexDirection: 'row', flex: 2 }}>
                                        <View style={{ flex: 1, flexDirection: 'row', borderRadius: 3, borderColor: '#FF4500', borderWidth: 0.75, marginLeft: 10 }}>
                                            <TouchableOpacity style={ispercent == false ? styles.btnPercent : styles.btnNotPercent} onPress={() => setIsPercent(false)}>
                                                <Text style={ispercent == false ? styles.contenBtnDongY : styles.contenBtnHuy}>VND</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={ispercent == true ? styles.btnPercent : styles.btnNotPercent} onPress={() => setIsPercent(true)}>
                                                <Text style={ispercent == true ? styles.contenBtnDongY : styles.contenBtnHuy}>%</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TextInput returnKeyType='done' style={[styles.styleTextInput, { flex: 1.5, }]} value={valueVoucher.current} onChangeText={(text) => { valueVoucher.current = text }} keyboardType="numbers-and-punctuation" placeholder='0'></TextInput>

                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', padding: 10 }}>
                                    <Text style={styles.contentTitle}>{I18n.t("ngay_het_han")}</Text>
                                    <View style={{ flex: 2, flexDirection: 'row' }}>
                                        <TextInput style={[styles.styleTextInput, { flex: 10, }]} editable={false} placeholderTextColor="#808080" placeholder={I18n.t("chon_ngay_het_han")} value={dateTmp.current ? dateToDate(dateTmp.current) : null}></TextInput>
                                        <TouchableOpacity style={{ flex: 1.5, marginLeft: 10 }} onPress={() => timePicker()}>
                                            <Image source={Images.icon_calendar} style={{ width: 23, height: 23 }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', padding: 10, marginBottom: 5 }}>
                                    <Text style={styles.contentTitle}>{I18n.t("so_luong")}</Text>
                                    <View style={{ flex: 2, flexDirection: 'row', marginLeft: 15 }}>
                                        <TouchableOpacity style={{ flex: 1.3, borderWidth: 0.5, borderColor: '#FF4500', alignItems: 'center', borderRadius: 3, justifyContent: 'center' }} onPress={() => setQuantity(quantity >= 1 ? quantity - 1 : 0)}>
                                            <Text style={{ color: '#FF4500' }}>-</Text>
                                        </TouchableOpacity>
                                        <TextInput returnKeyType='done' style={[styles.styleTextInput, { flex: 6, }]} keyboardType='numbers-and-punctuation' placeholder='0' value={quantity != 0 ? quantity.toString() : null} onChangeText={text => setQuantity(parseInt(text))}></TextInput>
                                        <TouchableOpacity style={{ flex: 1.3, marginLeft: 10, borderWidth: 0.5, borderColor: '#FF4500', borderRadius: 3, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setQuantity(quantity + 1) }}>
                                            <Text style={{ color: '#FF4500' }}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ marginLeft: 5, marginRight: 5, backgroundColor: '#CFCFCF', height: 0.5 }}></View>
                                <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, padding: 10 }}>
                                    <TouchableOpacity style={styles.btnHuy} onPress={() => {
                                        setOnShowModal(false); setExpityDate(); dateTmp.current = null;
                                        setQuantity(0); valueVoucher.current = null
                                    }}>
                                        <Text style={styles.contenBtnHuy}>{I18n.t("huy")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnDongY} onPress={onClickDone}>
                                        <Text style={styles.contenBtnDongY}>{I18n.t("dong_y")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View> :
                        <View style={{ backgroundColor: 'white', borderRadius: 15 }}>
                            <DatePicker
                                date={new Date()}
                                onDateChange={onChange}
                                mode={'date'}
                                display="default"
                                locale="vi-VN" />
                            <View style={[styles.viewBottomFilter, { padding: 7, paddingTop: 0, flexDirection: 'row', justifyContent: 'space-between' }]}>
                                <TouchableOpacity style={[styles.btnHuy]} onPress={onCancel}>
                                    <Text style={styles.contenBtnHuy}>{I18n.t("huy")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnDongY} onPress={onDone}>
                                    <Text style={styles.contenBtnDongY}>{I18n.t("dong_y")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View >


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
    const onClickDone = () => {
        postVoucher()
        setTimeout(() => {
            dateTmp.current = null
            setQuantity(0)
            valueVoucher.current = null
            setOnShowModal(false)
        }, 1000)

    }
    const initCode = () => {
        // let r = Math.random().toString(36).substring(6);
        // setCode(r)
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        setCode(text)
        console.log("random", text);

    }
    const onClickItemVoucher = (item) => {
        itemClick.current = item
        console.log("itemclick", itemClick);
        typeModal.current = 2
        setOnShowModal(true)
    }
    const onClickDel = () => {
        setOnShowModal(false)
        typeModal.current = 3
        setTimeout(() => {
            setOnShowModal(true)
        }, 500)

    }
    const timePicker = () => {
        setOnShowModal(false)
        typeModal.current = 5
        setTimeout(() => {
            setOnShowModal(true)
        }, 500)
    }
    const onChange = (selectDate) => {
        dateTmp.current = selectDate
    }
    const onCancel = () => {
        setOnShowModal(false)

    }
    const onDone = () => {
        setExpityDate(dateTmp.current ? dateTmp.current : new Date())
        setOnShowModal(false)
        setTimeout(() => {
            typeModal.current = 4
            setOnShowModal(true)
        }, 500)

    }
    const delVoucher = () => {
        new HTTPService().setPath(ApiPath.VOUCHER + "/" + itemClick.current.Id).DELETE({}).then((res) => {
            console.log("mess", res);
            onRefresh()
        }).catch((e) => {
            console.log("error del", e);
        })
        setOnShowModal(false)
    }

    useEffect(() => {
        console.log("quantity", expiryDate);
    }, [expiryDate])
    const renderItem = (item, index) => {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => onClickItemVoucher(item)}>
                <View style={styles.borderItem}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 7, marginLeft: 10, marginRight: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.Code}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00B2EE' }}>{I18n.t('so_luong')}: </Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#00B2EE' }}>{item.Quantity}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#696969', marginLeft: 10, marginRight: 10, padding: 0.25 }}></View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 7, marginRight: 10, marginLeft: 10, marginTop: 3 }}>
                        <Text style={styles.textTitle}>{I18n.t("ngay_tao")}</Text>
                        <Text style={{ fontSize: 12 }}>{dateToDate(item.CreatedDate)}</Text>
                    </View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 7, marginRight: 10, marginLeft: 10, marginBottom: 3 }}>
                        <Text style={styles.textTitle}>{I18n.t("ngay_het_han")}</Text>
                        <Text style={{ fontSize: 12 }}>{item.ExpiryDate ? dateToDate(item.ExpiryDate) : ''}</Text>
                    </View>
                    <View style={{ backgroundColor: '#696969', marginLeft: 10, marginRight: 10, padding: 0.25 }}></View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 7, marginLeft: 10, marginRight: 10 }}>
                        <Text style={styles.textTitle}>{I18n.t("gia_tri")}</Text>
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
                outPutTextSearch={()=>{}}
            />
            <View style={{ justifyContent: 'space-between', backgroundColor: 'white', flexDirection: 'row',  marginBottom: 2 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => { typeModal.current = 1; setOnShowModal(true) }}>
                    <Image source={Images.icon_calendar} style={{ width: 48, height: 48 }} />
                    <Text style={{ marginHorizontal: 10 }}>{filter.time.name.includes('-') ? filter.time.name : I18n.t(filter.time.name)}</Text>
                    <Image source={Images.icon_arrow_down} style={{ width: 14, height: 14, marginLeft: 5 }} />
                </TouchableOpacity>
                <Text style={{marginTop:15,marginRight:10}}>{listVoucher.length}/{count.current}</Text>
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
                    : <View style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 12 }}>{I18n.t('chua_co_voucher')}</Text>
                    </View>
            }
            <FAB
                style={{ position: 'absolute', backgroundColor: "#1874CD", right: 10, bottom: 10 }}
                big
                icon="plus"
                onPress={() => { typeModal.current = 4, setOnShowModal(true); initCode() }}
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
        </View>

    )
}
const styles = StyleSheet.create({
    btnHuy: {
        flex: 1, alignItems: 'center', padding: 5, backgroundColor: 'white', borderRadius: 3, borderWidth: 1, borderColor: '#FF4500', marginRight: 5, marginLeft: 10, justifyContent: 'center'
    },
    btnDongY: {
        flex: 1, alignItems: 'center', padding: 5, backgroundColor: '#FF4500', borderRadius: 3, marginRight: 10, marginLeft: 5, justifyContent: 'center'
    },
    contenBtnHuy: {
        color: '#FF4500'
    },
    contenBtnDongY: {
        color: 'white'
    },
    contentTitle: {
        flex: 1,
        color: '#9C9C9C'
    },
    btnPercent: {
        backgroundColor: '#FF4500',
        alignItems: 'center', flex: 1
        , borderColor: '#FF4500', borderRadius: 3, justifyContent: 'center'
    },
    btnNotPercent: {
        backgroundColor: 'white',
        alignItems: 'center', flex: 1
        , borderRadius: 3, justifyContent: 'center'
    },
    textInput: {
        textAlign: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },
    styleTextInput: {
        marginLeft: 10, borderColor: '#B5B5B5', borderWidth: 0.5, borderRadius: 3, height: 23, backgroundColor: '#E8E8E8', padding: 2, textAlign: 'center', color: "#000"
    },
    textTitle: {
        fontSize: 12, color: '#696969'
    },
    borderItem: {
        backgroundColor: 'white', borderRadius: 15, margin: 2, padding: 5, borderWidth: 0.25, marginLeft: 3, marginRight: 3
    }


})