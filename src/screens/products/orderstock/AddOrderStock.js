import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import MainToolBar from '../../main/MainToolBar';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images, Metrics } from '../../../theme';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import dataManager from '../../../data/DataManager';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC, change_alias, change_search, dateUTCToMoment, dateUTCToDate2, timeToString } from '../../../common/Utils';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';

export default (props) => {
    const [orderStock, setOrderStock] = useState({})
    const [listPr, setListPr] = useState([])
    const [sumPr, setSumPr] = useState()
    const [expand, setExpand] = useState(false)
    const [sumQuantity, setSumQuantity] = useState()
    const [isPercent, setIsPercent] = useState(false)
    const [showModal, setOnShowModal] = useState(false)
    const typeModal = useRef()
    const [marginModal, setMargin] = useState(0)
    const [listSupplier, setListSuppiler] = useState([])
    const [paymentMethod,setPaymentMethod] = useState()
    const [listMethod, setListMethod] = useState([])
    const [date, setDate] = useState(new Date());
    const [dateTmp, setDateTmp] = useState(new Date())

    useEffect(() => {
        getData(props.route.params)
    }, [])
    const onChangeDate = (selectedDate) => {
        const currentDate = dateTmp;
        let date = selectedDate.getDate();
        let month = selectedDate.getMonth();
        let year = selectedDate.getFullYear();
        currentDate.setDate(date)
        currentDate.setMonth(month)
        currentDate.setFullYear(year)
        console.log("onChangeTime Date ", currentDate);
        //setDateTmp(currentDate);
    };

    const onChangeTime = (selectedDate) => {
        const currentDate = dateTmp;
        let hours = selectedDate.getHours();
        let minutes = selectedDate.getMinutes();
        currentDate.setHours(hours)
        currentDate.setMinutes(minutes)
        console.log("onChangeTime Date ", momentToDate(currentDate));
        //setDateTmp(currentDate);

    };

    const getData = (param) => {
        let os = JSON.parse(JSON.stringify(param.orderstock))
        setOrderStock({ ...os })
        let arrPr = JSON.parse(JSON.stringify(param.listPr))
        setListPr([...arrPr])
        setPaymentMethod(param.paymentMethod)
    }
    useEffect(() => {
        setSumPr(listPr.length)
        let sum = 0
        listPr.forEach(item => {
            sum = sum + item.Quantity
        })
        setSumQuantity(sum)
    }, [listPr])
    useEffect(() => {
        console.log("orderstock", orderStock);
    }, [orderStock])
    const onClickSupplier = () => {
        setOnShowModal(true)
        typeModal.current = 1
        new HTTPService().setPath(ApiPath.CUSTOMER).GET({ Type: 2 }).then(res => {
            if (res != null) {
                setListSuppiler([...res.results])
            }
        })
    }
    const clickPaymentMethods = () =>{
        typeModal.current = 2
        setOnShowModal(true)
        new HTTPService().setPath(ApiPath.ACCOUNT+'/treeview').GET().then(res=>{
            if(res != null){
                setListMethod(res.splice(0,res.length))
            }
        })
    }
    const clickDocumentDate =()=>{
        typeModal.current = 3
        setOnShowModal(true)
    }
    const clickDeliveryDate = () =>{
        typeModal.current = 3
        setOnShowModal(true)
    }
    const renderModal = () => {
        return (
            <View style={{ backgroundColor: '#fff', borderRadius: 5, }}>
                {
                    typeModal.current == 1 ?
                        <View style={{ paddingVertical: 15, paddingHorizontal: 10, maxHeight: Metrics.screenHeight * 0.6 }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{I18n.t('chon_nha_cung_cap')}</Text>
                            <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 15, marginVertical: 5, borderRadius: 10, borderColor: colors.colorLightBlue, borderWidth: 0.5 }}>
                                <Ionicons name={'ios-search'} size={20} />
                                <TextInput style={{ flex: 1, paddingHorizontal: 10 }}></TextInput>
                            </View>
                            <ScrollView style={{}}>
                                {
                                    listSupplier.map((item, index) => {
                                        return (
                                            <View key={index.toString()} style={{ paddingVertical: 10, borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 20, flexDirection: 'row', borderColor: '#4a4a4a', marginVertical: 2 }}>
                                                <Image source={item.Image ? { uri: item.Image } : Images.icon_employee} style={{ width: 48, height: 48, marginRight: 10 }} />
                                                <View style={{ justifyContent: 'center' }}>
                                                    <Text>{item.Code}</Text>
                                                    <Text>{item.Name}</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                        :
                        typeModal.current == 2 ?
                        <View style={{ paddingVertical: 15, paddingHorizontal: 10, maxHeight: Metrics.screenHeight * 0.6 }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{I18n.t('chon_nha_phuong_thuc')}</Text>
                            <ScrollView style={{}}>
                                {
                                    listMethod.map((item, index) => {
                                        return (
                                            <View key={index.toString()} style={{ paddingVertical: 10, borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 20, flexDirection: 'row', borderColor: '#4a4a4a', marginVertical: 2 }}>
                                                <View style={{ justifyContent: 'center' }}>
                                                    <Text style={{textAlign:'center'}}>{item.text}</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                        :typeModal.current == 3 ?
                        <View style={{ alignItems: "center", justifyContent: 'center', width: Metrics.screenWidth * 0.75, backgroundColor: '#fff', borderWidth: 0.3, borderColor: 'gray', borderRadius: 5, paddingVertical: 10 }}>
                        <DatePicker date={date}
                            onDateChange={onChangeDate}
                            mode={'date'}
                            display="default"
                            locale="vi-VN" />
                        <View style={{}}></View>
                        <DatePicker date={date}
                            onDateChange={onChangeTime}
                            mode={'time'}
                            display="default"
                            locale="vi-VN" />
                        <View style={{ padding: 10, paddingTop: 0, flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={{ flex: 1, paddingVertical: 10, alignItems: 'center', marginHorizontal: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 10 }} onPress={() => setOnShowModal(false)}>
                                <Text style={{ color: colors.colorchinh }}>{I18n.t("huy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.colorchinh, marginHorizontal: 10, borderColor: colors.colorchinh, borderWidth: 1, borderRadius: 10 }} onPress={() => onClickOk()}>
                                <Text style={{ color: '#fff' }}>{I18n.t("dong_y")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View >
                         :null
                }
            </View>
        )
    }

    const renderItem = (item, index) => {
        return (
            <View style={{ backgroundColor: '#fff', paddingVertical: 10, marginVertical: 2, paddingHorizontal: 10, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{item.Name}</Text>
                        <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
                            <Text style={{ color: colors.colorLightBlue }}>{item.Code}</Text>
                            <Text style={{ color: colors.colorLightBlue, fontWeight: 'bold', marginLeft: 70 }}>{item.Unit || item.LargeUnit ? item.IsLargeUnit == false ? item.Unit : item.LargeUnit : null}</Text>
                        </View>
                    </View>
                    <Image source={Images.icon_trash} style={{ width: 24, height: 24 }} />
                </View>
                <View style={{ height: 0.3, backgroundColor: '#4a4a4a' }}></View>
                <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text>{I18n.t('gia_nhap')}</Text>
                        <TextInput style={styles.styleTextInput} value={item.Price > 0 ? currencyToString(item.Price) : 0 + ''}></TextInput>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text>
                            {I18n.t('so_luong')}
                        </Text>
                        <TextInput style={styles.styleTextInput} value={currencyToString(item.Quantity)}></TextInput>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                {...props}
                title={orderStock != {} ? I18n.t('chinh_sua_nhap_hang') : I18n.t('them_moi_nhap_hang')}
            />
            <View style={{ flex: 1, paddingVertical: 10 }}>
                <Text style={{ paddingHorizontal: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{I18n.t('danh_sach_hang_hoa')}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text>{sumPr} {I18n.t('hang_hoa')}</Text>
                    <Text style={{ color: colors.colorLightBlue, textDecorationLine: 'underline' }}>{I18n.t('chon_hang_hoa')}</Text>
                </View>
                <FlatList
                    data={listPr}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            <View>
                {expand == false ?
                    <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => setExpand(true)}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: colors.colorchinh, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold' }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={{ marginLeft: 10 }}>{sumQuantity}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold' }}>{currencyToString(orderStock.Total)}</Text>
                                <Image source={Images.icon_arrow_down} style={{ width: 16, height: 16, marginLeft: 10 }} />
                            </View>
                        </View>
                        <View style={{ height: 0.3, marginHorizontal: 10, backgroundColor: '#4a4a4a' }}></View>
                    </TouchableOpacity> :
                    <View style={{ marginBottom: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.colorchinh, borderRadius: 10 }}>
                        <TouchableOpacity onPress={() => setExpand(false)}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold' }}>{I18n.t('tong_thanh_tien')}</Text>
                                    <Text style={{ marginLeft: 10 }}>{sumQuantity}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>{currencyToString(orderStock.Total)}</Text>
                                    <Image source={Images.icon_up} style={{ width: 16, height: 16, marginLeft: 10 }} />
                                </View>
                            </View>
                            <View style={{ height: 0.3, marginHorizontal: 10, backgroundColor: '#4a4a4a' }}></View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text>{I18n.t('ma_nhap_hang')}</Text>
                            </View>
                            <View style={{ flex: 3 }}>
                                <TextInput style={styles.styleTextInput} value={orderStock.Code ? orderStock.Code : null}></TextInput>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text>{I18n.t('nha_cung_cap')}</Text>
                            </View>
                            <View style={{ flex: 3 }}>
                                <TouchableOpacity style={[styles.styleTextInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => onClickSupplier()}>
                                    <Text>{orderStock.Partner ? orderStock.Partner.Name : null}</Text>
                                    <Image source={Images.icon_arrow_down} style={{ width: 16, height: 16 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5 }}>
                            <View style={{ flex: 4 }}>
                                <Text>{I18n.t('ngay_nhap')}</Text>
                                <TouchableOpacity style={styles.styleTextInput} onPress={()=>clickDocumentDate()}>
                                    <Text style={{ fontWeight: 'bold' }}>{dateUTCToDate2(orderStock.DocumentDate)}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Icon name={'calendar-month'} size={20} />
                            </View>
                            <View style={{ flex: 4 }}>
                                <Text>{I18n.t('ngay_giao')}</Text>
                                <TouchableOpacity style={styles.styleTextInput} onPress={()=>clickDeliveryDate()}>
                                    <Text></Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text>{I18n.t('ghi_chu')}</Text>
                            </View>
                            <View style={{ flex: 3 }}>
                                <TextInput style={styles.styleTextInput} value={orderStock.Description ? orderStock.Description : null}></TextInput>
                            </View>
                        </View>
                        <View style={{ height: 0.3, marginHorizontal: 10, backgroundColor: '#4a4a4a' }}></View>
                        <View style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text>{I18n.t('chiet_khau')}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', marginRight: 10 }}>
                                <TouchableOpacity style={{ flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: colors.colorLightBlue, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: isPercent == false ? colors.colorLightBlue : '#fff' }} onPress={() => setIsPercent(false)}>
                                    <Text style={{ textAlign: 'center', color: isPercent == true ? colors.colorLightBlue : '#fff' }}>VND</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: colors.colorLightBlue, borderTopRightRadius: 10, borderBottomRightRadius: 10, backgroundColor: isPercent == true ? colors.colorLightBlue : '#fff' }} onPress={() => setIsPercent(true)}>
                                    <Text style={{ textAlign: 'center', color: isPercent == false ? colors.colorLightBlue : '#fff' }}>%</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput style={{ backgroundColor: '#f2f2f2', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10 }} value={currencyToString(orderStock.Discount)}></TextInput>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text>{I18n.t('thue_vat')}</Text>
                            </View>
                            <View style={{ flex: 3 }}>
                                <TextInput style={styles.styleTextInput} value={orderStock.VAT ? currencyToString(orderStock.VAT) : null}></TextInput>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5 }}>
                            <Text>{I18n.t('tong_cong')}</Text>
                            <Text>{currencyToString(orderStock.Total)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' }}>
                            <Text style={{ flex: 1 }}>{I18n.t('tong_thanh_toan')}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <TextInput style={[styles.styleTextInput, { flex: 3 }]} value={currencyToString(orderStock.TotalPayment)} ></TextInput>
                                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, flex: 2, borderWidth: 1, borderColor: colors.colorLightBlue, borderRadius: 10, marginTop: 10 }} onPress={() => setOrderStock({ ...orderStock, TotalPayment: orderStock.Total })}>
                                    <Text style={{ color: colors.colorLightBlue }}>{I18n.t('toi_da')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' }}>
                            <Text>{I18n.t('phuong_thuc_thanh_toan')}</Text>
                            <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: colors.colorLightBlue, paddingVertical: 10, paddingHorizontal: 15 }}  onPress={()=>clickPaymentMethods()}>
                                <Text>{paymentMethod}</Text>
                                <Image source={Images.icon_arrow_down} style={{ width: 16, height: 16, marginLeft: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, marginHorizontal: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>{I18n.t('luu')}</Text>
                </TouchableOpacity>
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
                    <View style={[{ width: Metrics.screenWidth * 0.8 }, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]}>
                        {renderModal()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTextInput: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 15, paddingVertical: 10, marginTop: 10, borderRadius: 10, color: colors.colorLightBlue, textAlign: 'center', fontWeight: 'bold'
    }
})