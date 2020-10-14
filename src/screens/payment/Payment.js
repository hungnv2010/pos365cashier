import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback } from "react-native";
import { Snackbar, Surface, RadioButton } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
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
import ToolBarPayment from '../../components/toolbar/ToolbarPayment';
import SearchVoucher from './SearchVoucher';

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

let timeClickCash = 1000;

let room = {};

const CUSTOMER_DEFAULT = { Id: "", Name: I18n.t('khach_le') };

export default (props) => {

    const CASH = {
        Id: 0,
        MethodId: 0,
        Name: I18n.t('tien_mat'),
        Value: 0,
    }
    // const totalPrice = props.route.params.totalPrice ? props.route.params.totalPrice : 0
    const [totalPrice, setTotalPrice] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [choosePoint, setChoosePoint] = useState(0)
    const [percent, setPercent] = useState(false)
    const [totalDiscount, setTotalDiscount] = useState(0)
    const [excessCash, setExcessCash] = useState(0)
    const [grandTotal, setGrandTotal] = useState(props.route.params.totalPrice ? props.route.params.totalPrice : 0)
    const [percentVAT, setPercentVAT] = useState(false)
    const [point, setPoint] = useState(0)
    const [allMethod, setAllMethod] = useState(METHOD)
    const [sendMethod, setSendMethod] = useState(METHOD.payment_paid)
    const [listMethod, setListMethod] = useState([CASH])
    const [customer, setCustomer] = useState(CUSTOMER_DEFAULT)
    const [textSearch, setTextSearch] = useState("")
    const [listVoucher, setListVoucher] = useState([])
    const [vendorSession, setVendorSession] = useState({})
    const [showModal, setShowModal] = useState(false);
    const [itemMethod, setItemMethod] = useState(CASH);
    const toolBarPaymentRef = useRef();
    const itemAccountRef = useRef();
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });



    useEffect(() => {

        const getRoom = async () => {
            const row_key = `${props.route.params.RoomId}_${props.route.params.Position}`
            let serverEvent = await realmStore.queryServerEvents()
            room = serverEvent.filtered(`RowKey == '${row_key}'`)

            let orderDetails = JSON.parse(room[0].JsonContent).OrderDetails;
            let total = 0;
            if (orderDetails && orderDetails.length > 0) {
                orderDetails.forEach(item => {
                    total += item.Price * item.Quantity
                });
            }
            setTotalPrice(total);
            CASH.Value = total;
        }
        getRoom()

        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('getVendorSession data payment', JSON.parse(data));
            console.log('payment props', props);
            setVendorSession(JSON.parse(data));
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
        console.log("useDidMountEffect ");

        for (const property in allMethod) {
            console.log('property', property, allMethod[property]);
            if (allMethod[property].name == sendMethod.name) {
                allMethod[property].value = 0
            }
        }

        setChoosePoint(0)
        toolBarPaymentRef.current.setStatusSearch(false)
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
        let newDate = new Date().getTime();
        if (timeClickCash + 500 < newDate) {
            let list = listMethod;
            console.log("timeClickCash list=== ", list);
            list.push({ ...CASH, Id: timeClickCash, MethodId: 0, Value: list.length > 0 ? 0 : totalPrice })
            setListMethod([...list])
            console.log("timeClickCash list===| ", list);
            timeClickCash = newDate;
        }
    }

    const deleteMethod = (item) => {
        let total = listMethod.reduce(getSum, 0);
        let list = listMethod;
        list = list.filter(el => el.Id != item.Id);
        setListMethod([...list])
        setExcessCash(total + item.Value - totalPrice)
    }

    const onCallBack = (data) => {
        console.log("onCallBack data ", data);

    }

    const onCallBackCustomer = (data) => {
        console.log("onCallBackCustomer data ", data);
        setCustomer(data);
    }

    const addCustomer = () => {
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBackCustomer })
    }

    const onClickSearch = () => {
        toolBarPaymentRef.current.setStatusSearch(true)
        setTextSearch('');
        setChoosePoint(2)
    }

    const callBackSearch = (data) => {
        console.log('callBackSearch === ', data);
        toolBarPaymentRef.current.setStatusSearch(false)
        if (listVoucher.length > 0) {
            let filterList = listVoucher.filter(item => item.Id == data.Id)
            console.log("onCallBack filterList ", filterList);
            if (filterList.length == 0) {
                console.log("onCallBack listVoucher ", listVoucher);
                let list = listVoucher;
                list.push(data)
                console.log("onCallBack list ", list);
                setListVoucher([...list])
            }
        } else {
            setListVoucher([data])
        }
        toolBarPaymentRef.current.setStatusSearch(false)
        setChoosePoint(1)
    }

    const onClickNote = () => {
        alert('ok')
    }

    const onClickShowListMethod = (item) => {
        console.log("onClickShowListMethod ", item);
        itemAccountRef.current = item;
        setItemMethod(item)
        setShowModal(true)
    }

    const onClickCancelFilter = () => {
        setShowModal(false)
    }

    const onClickOkFilter = () => {
        console.log("onClickOkFilter ", listMethod);
        setShowModal(false)
        let list = [];
        listMethod.forEach(element => {
            if (itemAccountRef.current.Id == element.Id) {
                list.push({ ...itemMethod, Value: element.Value })
            } else
                list.push(element)
        });
        setListMethod([...list])
    }

    const onSelectMethod = (item) => {
        console.log("onSelectMethod ", item, itemMethod);
        setItemMethod({ ...item, MethodId: item.Id });
    }

    const getSum = (total, num) => {
        return total + Math.round(num.Value);
    }

    const setListVoucherTemp = (item, value) => {
        let list = [];
        listMethod.forEach(element => {
            if (item.Id == element.Id) {
                list.push({ ...item, Value: value })
            } else
                list.push(element)
        });
        console.log("onClickOkFilter list ", list);
        setListMethod([...list])
    }

    const checkExcessCash = (item) => {
        let total = listMethod.reduce(getSum, 0);
        if (total < totalPrice) {
            setListVoucherTemp(item, totalPrice - total + item.Value)
            setExcessCash(0)
        }
    }

    const onChangeTextPaymentPaid = (text, item) => {
        let total = 0;
        text = text.replace(/,/g, "");
        text = Number(text);
        let list = [];
        listMethod.forEach(element => {
            if (item.Id == element.Id) {
                list.push({ ...element, Value: text })
                total += text;
            } else {
                list.push(element)
                total += element.Value;
            }
        });
        setListMethod([...list])
        setExcessCash(total - totalPrice)
    }

    const setValueMethod = (item) => {
        setListVoucherTemp(item, 0)
        let total = listMethod.reduce(getSum, 0);
        setExcessCash(total - item.Value - totalPrice)
    }

    const renderFilter = () => {
        console.log("renderFilter vendorSession ", vendorSession);
        return (
            <View style={{ backgroundColor: "#fff", padding: 10, }}>
                <Text style={{ padding: 10, fontWeight: "bold", textTransform: "uppercase", color: colors.colorLightBlue }}>Loại hình thanh toán</Text>
                <ScrollView style={{ maxHeight: Metrics.screenWidth }}>
                    {
                        vendorSession.Accounts && [CASH].concat(vendorSession.Accounts).map((item, index) => {
                            return (
                                <TouchableOpacity onPress={() => onSelectMethod(item)} style={{ flexDirection: "row", alignItems: "center" }}>
                                    <RadioButton.Android
                                        status={itemMethod.MethodId == item.Id ? 'checked' : 'unchecked'}
                                        onPress={() => onSelectMethod(item)}
                                        style={{ padding: 0, margin: 0 }}
                                        color={colors.colorchinh}
                                    />
                                    <Text style={{ marginLeft: 0 }}>{item.Name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
                <View style={{ justifyContent: "center", flexDirection: "row", paddingTop: 10 }}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" }} onPress={onClickCancelFilter}>
                        <Text style={{ textAlign: "center", color: "#000" }}>{I18n.t("huy")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" }} onPress={onClickOkFilter}>
                        <Text style={{ textAlign: "center", color: "#fff" }}>{I18n.t("dong_y")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.conatiner}>
            <ToolBarPayment
                ref={toolBarPaymentRef}
                {...props}
                clickRightIcon={(data) => { setTextSearch(data); }}
                onClickBackSearch={() => { setChoosePoint(1) }}
                clickNote={onClickNote}
                title={I18n.t('thanh_toan')} />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <KeyboardAwareScrollView style={{ flexGrow: 1 }}>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('khach_hang')}</Text>
                                <TouchableOpacity onPress={addCustomer} style={{ flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 7, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 }}>
                                    <Text style={{ marginLeft: 5 }}>{customer.Name}</Text>
                                    <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginHorizontal: 10 }} />
                                </TouchableOpacity>
                            </View>
                        </Surface>
                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>{I18n.t('tong_thanh_tien')}</Text>
                                <Text style={{ borderColor: colors.colorchinh, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 5, borderWidth: 0.5 }}>{room && room[0] && room[0].JsonContent ? JSON.parse(room[0].JsonContent).OrderDetails.length : 0}</Text>
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
                                        if (deviceType == Constant.TABLET) {
                                            toolBarPaymentRef.current.setStatusSearch(false)
                                            setChoosePoint(1)
                                        }
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
                                                <TouchableOpacity onPress={() => onClickShowListMethod(item)} style={{ flexDirection: "row", justifyContent: "space-between", marginLeft: 20, backgroundColor: "#eeeeee", marginLeft: 10, flex: 7, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, paddingVertical: 7 }}>
                                                    <Text style={{ marginLeft: 5 }}>{item.Name}</Text>
                                                    <Image source={Images.arrow_down} style={{ width: 14, height: 14, marginHorizontal: 10 }} />
                                                </TouchableOpacity>
                                                <View style={{ flex: 3, justifyContent: "center", alignItems: "center", }}>
                                                    <TouchableOpacity onPress={() => checkExcessCash(item)} style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh }}>
                                                        <Fontisto name="calculator" size={20} color={colors.colorchinh} />
                                                    </TouchableOpacity>
                                                </View>
                                                <TextInput
                                                    value={"" + currencyToString(item.Value)}
                                                    onTouchStart={() => { setValueMethod(item) }}
                                                    editable={deviceType == Constant.TABLET ? false : true}
                                                    onChangeText={(text) => onChangeTextPaymentPaid(text, item)}
                                                    style={{ textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 0, flex: 3, borderColor: sendMethod.name == METHOD.payment_paid.name ? colors.colorchinh : "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
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
                        choosePoint == 0 ?
                            <Calculator
                                method={sendMethod}
                                outputResult={outputResult} />
                            :
                            (
                                choosePoint == 1 ?
                                    < PointVoucher
                                        listVoucher={listVoucher}
                                        onClickSearch={() => onClickSearch()} />
                                    :
                                    <SearchVoucher
                                        listVoucher={listVoucher}
                                        text={textSearch}
                                        callBackSearch={(item) => {
                                            callBackSearch(item)
                                        }}
                                    />
                            )
                        :
                        null
                }
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>
                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 0,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            {renderFilter()}
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    },
})