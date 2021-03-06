import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { currencyToString, dateToDate, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import images from '../../theme/Images';
import { ceil } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';
import DialogSelectSupplier from '../../components/dialog/DialogSelectSupplier'
import DatePicker from 'react-native-date-picker';

export default (props) => {
    const [object, setObject] = useState(props.data ? props.data : {})
    const [showModal, setOnShowModal] = useState(false)
    const [listSupplier, setListSuppiler] = useState([])
    const [data, setData] = useState(props.data ? props.data : {})
    const [status, setStatus] = useState([])
    const typeModal = useRef(0)
    const typeDate = useRef(0)
    const dateTmp = useRef()
    const [date, setDate] = useState(new Date());
    const statusTmp = useRef([])

    const onChange = (selectedDate) => {
        console.log("selectedDate", selectedDate);
        if (selectedDate != undefined) {
            dateTmp.current = selectedDate;
        }
        else {
            dateTmp.current = new Date()
        }
    }
    useEffect(() => {
        new HTTPService().setPath(ApiPath.CUSTOMER).GET({ Type: 2 }).then(res => {
            if (res != null) {
                setListSuppiler([...res.results])
            }
        })
        setStatus(statusTmp.current)

    }, [])
    useEffect(() => {
        setData(props.data)
        setObject(props.data)
        setStatus(props.data.Status ? props.data.Status : [])
    }, [props.data])
    useEffect(() => {
        setObject({ ...object, Status: status })
    }, [status])
    const onDone = () => {
        console.log("selectedDate", dateTmp.current);
        if (typeDate.current == 1) {
            setObject({ ...object, dateFrom: dateTmp.current ? dateTmp.current : new Date() })
        } else if (typeDate.current == 2) {
            setObject({ ...object, dateTo: dateTmp.current ? dateTmp.current : new Date() })
        }
        setOnShowModal(false)
    }
    const outPutSupplier = (data) => {
        setObject({ ...object, Supplier: data })
        console.log(data);
        setOnShowModal(false)
    }
    const onCLickDone = () => {
        console.log("object", object);
        props.outPutFilter(object)
    }
    const onClickPickDateFrom = () => {
        typeModal.current = 1
        typeDate.current = 1
        setOnShowModal(true)
    }
    const onClickPickDateTo = () => {
        typeModal.current = 1
        typeDate.current = 2
        setOnShowModal(true)
    }
    const setDataStatus = (value) => {
        if (status.indexOf(value) > -1) {
            let arr = []
            arr = status.splice(status.indexOf(value), 1)
            setStatus([...status])
        } else
            setStatus([...status, value])
    }

    const renderModalContent = () => {
        return (
            <View style={{ backgroundColor: '#fff', borderRadius: 10 }}>
                {typeModal.current == 1 ?
                    <View style={{ borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', paddingVertical: 10, fontWeight: 'bold', fontSize: 16, color: colors.colorchinh }}>{I18n.t('chon_ngay')}</Text>
                        <DatePicker date={date}
                            onDateChange={onChange}
                            mode={'date'}
                            display="default"
                            locale="vi-VN"
                            maximumDate={date} />
                        <View style={{ paddingVertical: 15, paddingHorizontal: 30, flexDirection: 'row' }}>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderColor: colors.colorchinh, borderRadius: 10, borderWidth: 1, paddingVertical: 10, marginRight: 5 }} onPress={() => setOnShowModal(false)}>
                                <Text style={{ color: colors.colorchinh }}>{I18n.t('huy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.colorchinh, paddingVertical: 10, marginLeft: 5 }} onPress={() => onDone()}>
                                <Text style={{ color: '#fff' }}>{I18n.t('dong_y')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    : typeModal.current == 2 ?
                        <View style={{ paddingHorizontal: 15, paddingVertical: 20 }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{I18n.t('trang_thai')}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 15 }}>
                                <TouchableOpacity style={{ flex: 1, paddingVertical: 15, marginRight: 5, borderRadius: 10, backgroundColor: status.indexOf(1) > -1 ? '#fff' : '#f2f2f2', borderWidth: 1, borderColor: status.indexOf(1) > -1 ? colors.colorLightBlue : null }} onPress={() => setDataStatus(1)}>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center', color: status.indexOf(1) > -1 ? colors.colorLightBlue : '#000' }}>{I18n.t('dang_xu_ly')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, paddingVertical: 15, marginLeft: 5, borderRadius: 10, backgroundColor: status.indexOf(3) > -1 ? '#fff' : '#f2f2f2', borderWidth: 1, borderColor: status.indexOf(3) > -1 ? colors.colorLightBlue : null }} onPress={() => setDataStatus(3)}>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center', color: status.indexOf(3) > -1 ? colors.colorLightBlue : '#000' }}>{I18n.t('loai_bo')}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={{ paddingVertical: 15, borderRadius: 10, backgroundColor: status.indexOf(2) > -1 ? '#fff' : '#f2f2f2', borderWidth: 1, borderColor: status.indexOf(2) > -1 ? colors.colorLightBlue : null, marginTop: 10 }} onPress={() => setDataStatus(2)}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center', color: status.indexOf(2) > -1 ? colors.colorLightBlue : '#000' }}>{I18n.t('hoan_thanh')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ paddingVertical: 15, marginVertical: 10, backgroundColor: colors.colorLightBlue, borderRadius: 10 }} onPress={() => { setOnShowModal(false) }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>{I18n.t('ap_dung')}</Text>
                            </TouchableOpacity>
                            <View></View>
                        </View> :
                        typeModal.current == 3 ?
                            <View>
                                <DialogSelectSupplier outPut={outPutSupplier} />
                            </View>
                            :
                            null}
            </View>
        )
    }
    return (
        <View style={{ backgroundColor: '#fff', borderRadius: 10 }}>
            <View style={{ paddingVertical: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopEndRadius: 10 }}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>{I18n.t('loc')}</Text>
            </View>
            <View style={{ paddingVertical: 10, backgroundColor: '#f2f2f2', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                    <View style={{ flex: 1, paddingVertical: 10, marginRight: 5 }}>
                        <Text>{I18n.t('tu')}</Text>
                        <View style={[styles.background, { flexDirection: 'row' }]}>
                            <TouchableOpacity style={[{ flexDirection: 'row', flex: 7, alignItems: 'center', justifyContent: 'center' }]} onPress={() => { onClickPickDateFrom() }}>
                                <Text style={{ textAlign: 'center' }}>{object.dateFrom ? dateToDate(object.dateFrom) : 'DD/MM/YYYY'}</Text>
                            </TouchableOpacity>
                            {object.dateFrom != undefined ?
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => { setObject({ ...object, dateFrom: undefined }) }}>
                                    <Image source={Images.icon_red_x} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                                : null}
                        </View>
                    </View>
                    <View style={{ flex: 1, paddingVertical: 10, marginLeft: 5 }}>
                        <Text>{I18n.t('den')}</Text>
                        <View style={[styles.background, { flexDirection: 'row' }]}>
                            <TouchableOpacity style={{ flex: 5, justifyContent: 'center', alignItems: 'center' }} onPress={() => { onClickPickDateTo() }}>
                                <Text style={{ textAlign: 'center' }}>{object.dateTo ? dateToDate(object.dateTo) : 'DD/MM/YYYY'}</Text>
                            </TouchableOpacity>
                            {object.dateTo != undefined ?
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => { setObject({ ...object, dateTo: undefined }) }}>
                                    <Image source={Images.icon_red_x} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                                : null}
                        </View>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text >{I18n.t('trang_thai')}</Text>
                    <TouchableOpacity style={styles.background} onPress={() => { typeModal.current = 2, setOnShowModal(true) }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text>{status.length > 0 ? null : I18n.t('tat_ca')}{(status.indexOf(1) > -1 ? I18n.t('dang_xu_ly') + (status.indexOf(2) > -1 || status.indexOf(3) > -1 ? ', ' : '') : null)} {(status.indexOf(2) > -1 ? I18n.t('hoan_thanh') + (status.indexOf(3) > -1 ? ', ' : '') : null)} {(status.indexOf(3) > -1 ? I18n.t('loai_bo') : null)}</Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20 }} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('nha_cung_cap')}</Text>
                    <TouchableOpacity style={styles.background} onPress={() => { typeModal.current = 3, setOnShowModal(true) }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{flexDirection:'row',justifyContent:'space-between',flex:1, marginRight:10}}>
                            <Text>{object.Supplier ? object.Supplier.Name : I18n.t('tat_ca')}</Text>
                            {
                                object.Supplier != undefined ? 
                                <TouchableOpacity style={{}} onPress={() => { setObject({ ...object, Supplier: undefined }) }}>
                                    <Image source={Images.icon_red_x} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity> : null
                            }
                            </View>
                            <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20 }} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('ma_nhap_hang')}</Text>
                    <TextInput style={[styles.background, , { color: '#000' }]} value={object.OrderStockCode ? object.OrderStockCode : null} onChangeText={(text) => setObject({ ...object, OrderStockCode: text })}></TextInput>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('ma_hang_hoa')}</Text>
                    <TextInput style={[styles.background, { color: '#000' }]} value={object.ProductCode ? object.ProductCode : null} onChangeText={(text) => setObject({ ...object, ProductCode: text })}></TextInput>
                </View>
                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 10, marginHorizontal: 10, marginVertical: 10 }} onPress={() => onCLickDone()}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{I18n.t('ap_dung')}</Text>
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
                    <View style={{ width: Metrics.screenWidth * 0.8, }}>
                        {renderModalContent()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    background: {
        backgroundColor: '#fff', paddingHorizontal: 5, paddingVertical: 10, borderRadius: 10, marginTop: 5
    },
    titleBtn: { fontWeight: 'bold', textAlign: 'center' }
})