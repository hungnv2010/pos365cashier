import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import Calculator from './calculator';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import images from '../../theme/Images';
import PointVoucher from './pointVoucher';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';

let METHOD = {
    payment_paid: {
        name: "Payment paid",
        value: "0"
    },
    vat: {
        name: "VAT",
        value: '0'
    },
    discount: {
        name: "Discount",
        value: '0'
    },
}

export default (props) => {

    const totalPrice = props.route.params.totalPrice ? props.route.params.totalPrice : 0
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [choosePoint, setChoosePoint] = useState(false)
    const [percent, setPercent] = useState(false)
    const [totalDiscount, setTotalDiscount] = useState(0)
    const [excessCash, setExcessCash] = useState(0)
    const [grandTotal, setGrandTotal] = useState(props.route.params.totalPrice ? props.route.params.totalPrice : 0)
    const [percentVAT, setPercentVAT] = useState(false)
    const [point, setPoint] = useState(0)
    const [allMethod, setAllMethod] = useState(METHOD)
    const [sendMethod, setSendMethod] = useState(METHOD.payment_paid)
    const [listMethod, setListMethod] = useState([{ Id: "" + new Date(), Name: "Tiền mặt" }])
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });


    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('getVendorSession data payment', JSON.parse(data));
            console.log('payment props', props);
        }
        getVendorSession()
    }, [])

    useEffect(() => {
        console.log('totalPrice', totalPrice, allMethod.discount.value, percent);
        const getTotalDiscount = () => {
            let totalDiscount = 0
            if (percent) {
                totalDiscount = totalPrice * allMethod.discount.value / 100
            } else {
                totalDiscount = allMethod.discount.value
            }
            if (totalDiscount > totalPrice) totalDiscount = totalPrice
            setTotalDiscount(totalDiscount)
        }
        getTotalDiscount()
    }, [allMethod.discount.value, percent])

    useEffect(() => {
        const getTotalVAT = () => {
            console.log('allMethod.vat.value', allMethod.vat.value, percentVAT);
            let totalVAT = 0;
            if (allMethod.vat.value != 0) {
                totalVAT = (totalPrice - totalDiscount) * allMethod.vat.value / 100
            } else if (percentVAT) {
                totalVAT = (totalPrice - totalDiscount) * 10 / 100
            }
            setGrandTotal(totalPrice - totalDiscount + totalVAT)
        }
        getTotalVAT()
    }, [allMethod.vat.value, percentVAT, totalDiscount])

    useEffect(() => {
        setAllMethod({
            ...allMethod, payment_paid: {
                name: "Payment paid",
                value: grandTotal
            },
        })
    }, [grandTotal])

    useEffect(() => {
        let excessCash = allMethod.payment_paid.value - grandTotal
        setExcessCash(excessCash)
    }, [allMethod.payment_paid.value])

    const onChangeTextInput = (text, type) => {
        console.log("onChangeTextInput text, type == ", text, type, allMethod);
        text = text.replace(/,/g, "");
        text = Number(text);
        switch (type) {
            case 3:
                setAllMethod({
                    ...allMethod, payment_paid: {
                        name: "Payment paid",
                        value: text
                    },
                })
                break;
            case 2:
                setAllMethod({
                    ...allMethod, vat: {
                        name: "VAT",
                        value: text
                    },
                })
                break;
            case 1:
                setAllMethod({
                    ...allMethod, discount: {
                        name: "Discount",
                        value: text
                    },
                })
                break;
            default:
                break;
        }
    }


    useDidMountEffect(() => {
        for (const property in allMethod) {
            console.log('property', property, allMethod[property]);
            if (allMethod[property].name == sendMethod.name) {
                allMethod[property].value = 0
            }
        }
        if (choosePoint) setChoosePoint(false)
        setAllMethod({ ...allMethod })
    }, [sendMethod])


    const outputResult = (value) => {
        console.log('outputResult', value, sendMethod);
        for (const property in allMethod) {
            console.log('property', property, allMethod[property]);
            if (allMethod[property].name == sendMethod.name) {
                allMethod[property].value = value
            }
        }
        console.log('allMethod', allMethod);
        setAllMethod({ ...allMethod })
    }

    const addAccount = () => {
        let list = listMethod;
        list.push({ Id: "" + new Date(), Name: "Tiền mặt" })
        setListMethod([...list])
    }

    const deleteMethod = (item) => {
        let list = listMethod;
        list = list.filter(el => el.Id != item.Id);
        setListMethod([...list])
    }

    const onCallBack = (data) => {
        console.log("onCallBack data ", data);

    }

    return (
        <View style={styles.conatiner}>
            <ToolBarDefault
                {...props}
                navigation={props.navigation}
                clickLeftIcon={() => {
                    props.navigation.goBack()
                }}
                title={I18n.t('thanh_toan')} />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <KeyboardAwareScrollView style={{ flexGrow: 1 }}>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('khach_hang')}</Text>
                                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 7, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 }}>
                                    <Text style={{ marginLeft: 5 }}>{I18n.t('tat_ca')}</Text>
                                    <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginHorizontal: 10 }} />
                                </TouchableOpacity>
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={{ borderColor: colors.colorchinh, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 5, borderWidth: 0.5 }}>9</Text>
                                <Text style={{ flex: 5.3, textAlign: "right" }}>{currencyToString(totalPrice)}</Text>
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 2 }}>{I18n.t('tong_chiet_khau')}</Text>
                                <Text style={{ flex: 3, textAlign: "right" }}>{currencyToString(totalDiscount)}</Text>
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 3 }}>{I18n.t('chiet_khau')}</Text>
                                <View style={{ flexDirection: "row", flex: 3, marginLeft: 5 }}>
                                    <TouchableOpacity onPress={() => setPercent(false)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percent ? colors.colorchinh : "#fff" }}>
                                        <Text style={{ color: !percent ? "#fff" : "#000" }}>VNĐ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPercent(true)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percent ? "#fff" : colors.colorchinh }}>
                                        <Text style={{ color: percent ? "#fff" : "#000" }}>%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    value={"" + currencyToString(allMethod.discount.value)}
                                    onTouchStart={() => { setSendMethod(METHOD.discount) }}
                                    editable={deviceType == Constant.TABLET ? false : true}
                                    onChangeText={(text) => onChangeTextInput(text, 1)}
                                    style={{ textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: sendMethod.name == METHOD.discount.name ? colors.colorchinh : "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('diem_voucher')}</Text>
                                <View style={{ flexDirection: "row", flex: 3 }}>
                                    <TouchableOpacity onPress={() => {
                                        if (deviceType == Constant.TABLET)
                                            setChoosePoint(!choosePoint)
                                        else props.navigation.navigate(ScreenList.PointVoucher, { _onSelect: onCallBack })
                                    }}
                                        style={{ width: 110, borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 7, backgroundColor: colors.colorchinh }}>
                                        <Text style={{ color: "#fff", textAlign: "center", textTransform: "uppercase" }}>{I18n.t('chon')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ textAlign: "right", marginLeft: 10, flex: 3, padding: 6.8, paddingRight: 0 }}>{point}</Text>
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>VAT</Text>
                                <View style={{ flexDirection: "row", flex: 3, marginLeft: 5 }}>
                                    <TouchableOpacity onPress={() => setPercentVAT(false)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percentVAT ? colors.colorchinh : "#fff" }}>
                                        <Text style={{ color: !percentVAT ? "#fff" : "#000" }}>0%</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPercentVAT(true)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percentVAT ? "#fff" : colors.colorchinh }}>
                                        <Text style={{ color: percentVAT ? "#fff" : "#000" }}>10%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    value={"" + currencyToString(allMethod.vat.value)}
                                    onTouchStart={() => { setSendMethod(METHOD.vat); }}
                                    editable={deviceType == Constant.TABLET ? false : true}
                                    onChangeText={(text) => onChangeTextInput(text, 2)}
                                    style={{ textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: sendMethod.name == METHOD.vat.name ? colors.colorchinh : "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <View style={{ flex: 3, flexDirection: "row", alignItems: "center", }}>
                                    <IconFeather name="credit-card" size={20} color={colors.colorchinh} />
                                    <Text style={{ fontWeight: "bold", color: colors.colorchinh, marginLeft: 10 }}>{I18n.t('khach_phai_tra')}</Text>
                                </View>
                                <View style={{ flex: 3 }}></View>
                                <Text style={{ flex: 3, textAlign: "right", fontWeight: "bold" }}>{currencyToString(grandTotal)}</Text>

                            </View>
                            <View style={{ backgroundColor: "#fff", flexDirection: "column", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 3, padding: 10, paddingBottom: 0 }}>{I18n.t('tien_khach_tra')}</Text>
                                {
                                    listMethod.map((item, index) => {
                                        return (
                                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", }}>
                                                {
                                                    index != 0 ?
                                                        <TouchableOpacity onPress={() => deleteMethod(item)} style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh }}>
                                                            <Icon name="close" size={24} color={colors.colorchinh} style={{ marginTop: 3, alignContent: "center" }} />
                                                        </TouchableOpacity>
                                                        :
                                                        <View style={{ width: 32, height: 32, }}>
                                                        </View>
                                                }
                                                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 7, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 }}>
                                                    <Text style={{ marginLeft: 5 }}>{I18n.t('tien_mat')}</Text>
                                                    <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginHorizontal: 10 }} />
                                                </TouchableOpacity>
                                                <View style={{ flex: 3, justifyContent: "center", alignItems: "center", }}>
                                                    <TouchableOpacity style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh }}>
                                                        <Fontisto name="calculator" size={20} color={colors.colorchinh} />
                                                    </TouchableOpacity>
                                                </View>
                                                <TextInput
                                                    value={"" + currencyToString(allMethod.payment_paid.value)}
                                                    onTouchStart={() => { setSendMethod(METHOD.payment_paid) }}
                                                    editable={deviceType == Constant.TABLET ? false : true}
                                                    onChangeText={(text) => onChangeTextInput(text, 3)}
                                                    style={{ textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: sendMethod.name == METHOD.payment_paid.name ? colors.colorchinh : "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                                            </View>
                                        )
                                    })
                                }
                                <TouchableOpacity onPress={() => addAccount()}>
                                    <Text style={{ flex: 3, padding: 10, paddingTop: 5, color: colors.colorchinh }}>+ {I18n.t('them_tai_khoan_moi')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 2 }}>{I18n.t('tien_thua')}</Text>
                                <Text style={{ flex: 4, textAlign: "right", color: excessCash > 0 ? "green" : "red" }}>{currencyToString(excessCash)}</Text>
                            </View>
                        </Surface>
                    </KeyboardAwareScrollView>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => { }} style={{ flex: 1, alignItems: "center", backgroundColor: colors.colorLightBlue, paddingVertical: 15 }}>
                            <Text style={{ color: "#fff", textTransform: "uppercase", fontWeight: "bold" }}>{I18n.t('tam_tinh')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { }} style={{ borderLeftWidth: 2, borderLeftColor: "#fff", flex: 1, alignItems: "center", backgroundColor: colors.colorLightBlue, paddingVertical: 15 }}>
                            <Text style={{ color: "#fff", textTransform: "uppercase", fontWeight: "bold" }}>{I18n.t('thanh_toan')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <Calculator
                            method={sendMethod}
                            outputResult={outputResult}
                            choosePoint={choosePoint} />
                        :
                        null
                }
            </View>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View >
    );

}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    }
})