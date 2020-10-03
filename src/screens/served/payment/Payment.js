import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images } from '../../../theme';
import { ScreenList } from '../../../common/ScreenList';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../../common/Utils';
import colors from '../../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import Calculator from './calculator';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';


export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [percent, setPercent] = useState(false)
    const [percentVAT, setPercentVAT] = useState(false)
    const [method, setMethod] = useState(Constant.METHOD[0])
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('getVendorSession data payment', JSON.parse(data));
        }
        getVendorSession()
    }, [])

    const outputResult = (method) => {
        console.log('outputResult', method);
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
                    <ScrollView>

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
                                <Text style={{ flex: 5.3, textAlign: "right" }}>{currencyToString(1250000)}</Text>
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 2 }}>Tổng chiết khấu</Text>
                                <Text style={{ flex: 3, textAlign: "right" }}>{currencyToString(1250000)}</Text>
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                                <Text style={{ flex: 3 }}>Chiết khấu</Text>
                                <View style={{ flexDirection: "row", flex: 3 }}>
                                    <TouchableOpacity onPress={() => setPercent(false)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percent ? colors.colorchinh : "#fff" }}>
                                        <Text style={{ color: !percent ? "#fff" : "#000" }}>VNĐ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPercent(true)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percent ? "#fff" : colors.colorchinh }}>
                                        <Text style={{ color: percent ? "#fff" : "#000" }}>%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    onTouchStart={() => alert("Pressed...")}
                                    editable={false}
                                    style={{ backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8, paddingRight: 0 }} />
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>Điểm/Voucher</Text>
                                <View style={{ flexDirection: "row", flex: 3 }}>
                                    <TouchableOpacity style={{ width: 110, borderRadius: 5, borderWidth: 0.5, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 7, backgroundColor: colors.colorchinh }}>
                                        <Text style={{ color: "#fff", textAlign: "center", textTransform: "uppercase" }}>Chọn</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ textAlign: "right", marginLeft: 10, flex: 3, padding: 6.8, paddingRight: 0 }}>{currencyToString(1250000)}</Text>
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 3 }}>VAT</Text>
                                <View style={{ flexDirection: "row", flex: 3 }}>
                                    <TouchableOpacity onPress={() => setPercentVAT(false)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percentVAT ? colors.colorchinh : "#fff" }}>
                                        <Text style={{ color: !percentVAT ? "#fff" : "#000" }}>0%</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPercentVAT(true)} style={{ width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percentVAT ? "#fff" : colors.colorchinh }}>
                                        <Text style={{ color: percentVAT ? "#fff" : "#000" }}>15%</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    onTouchStart={() => alert("Pressed...")}
                                    editable={false}
                                    style={{ backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8, paddingRight: 0 }} />
                            </View>
                        </Surface>

                        <Surface style={styles.surface}>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 2 }}>Khách phải trả</Text>
                                <Text style={{ flex: 4, textAlign: "right" }}>{currencyToString(1250000)}</Text>
                            </View>
                            <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ flex: 2 }}>Tiền thừa</Text>
                                <Text style={{ flex: 4, textAlign: "right" }}>{currencyToString(1250000)}</Text>
                            </View>
                        </Surface>
                    </ScrollView>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => { }} style={{ flex: 1, alignItems: "center", backgroundColor: colors.colorLightBlue, paddingVertical: 15 }}>
                            <Text style={{ color: "#fff", textTransform: "uppercase", fontWeight: "bold" }}>Tạm tính</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { }} style={{ borderLeftWidth: 0.5, borderLeftColor: "#fff", flex: 1, alignItems: "center", backgroundColor: colors.colorLightBlue, paddingVertical: 15 }}>
                            <Text style={{ color: "#fff", textTransform: "uppercase", fontWeight: "bold" }}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <Calculator
                            method={method}
                            outputResult={outputResult} />
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