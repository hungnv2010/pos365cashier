import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, ImageBackground, Platform } from 'react-native';
import { Colors, Images, Metrics } from '../../theme';
import { currencyToString } from '../../common/Utils'
import I18n from "../../common/language/i18n"
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';


// export default (props) => {

export const ReturnProduct = (props) => {

    // const [itemOrder, setItemOrder] = useState({ ...props.item })
    const [Quantity, setQuantity] = useState(props.Quantity)
    const [QuantityChange, setQuantityChange] = useState(props.QuantitySubtract > 0 ? props.QuantitySubtract : props.Quantity)
    const [Name, setName] = useState(props.Name)
    const [vendorSession, setVendorSession] = useState(props.vendorSession);
    const [Description, setDescription] = useState("");

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    useEffect(() => {
        console.log("ReturnProduct ", props);
    }, [])

    const onClickOk = () => {
        let data = {
            QuantityChange: (Quantity - QuantityChange) > 0 ? QuantityChange : Quantity,
            Name: Name,
            Description: Description,
        }
        props.getDataOnClick(data)
        props.setShowModal(false)
    }

    return (
        <View >
            <View style={styles.headerModal}>
                <Text style={[styles.headerModalText, { marginVertical: deviceType == Constant.PHONE ? 10 : 20 }]}>{I18n.t('huy_tra')} {Name}</Text>
            </View>
            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 0 }} >
                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('so_luong')}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <TouchableOpacity onPress={() => {
                            if (QuantityChange > 0) {
                                setQuantityChange(Number(QuantityChange) - 1)
                            }
                        }}>
                            <Text style={styles.button}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                            returnKeyType='done'
                            onChangeText={text => {
                                console.log("text ", text);
                                if (isNaN(text) || text.length > 4) return
                                if (Number(text) <= Number(Quantity))
                                    setQuantityChange(text)
                            }}
                            style={styles.textQuantityModal}
                            value={"" + QuantityChange}
                            keyboardType="numeric" />
                        <TouchableOpacity onPress={() => {
                            if (Number(QuantityChange) < Quantity)
                                setQuantityChange(Number(QuantityChange) + 1)
                        }}>
                            <Text style={styles.button}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItem: "center", padding: 0 }} >
                    <Text style={{ fontSize: 14, flex: 3, alignSelf: "center" }}>{I18n.t('con_lai_so_luong')}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>

                        <TextInput
                            returnKeyType='done'
                            editable={false} selectTextOnFocus={false}
                            style={[styles.textQuantityModalOnly, { marginHorizontal: 0 }]}
                            value={"" + ((Quantity - QuantityChange) > 0 ? (Quantity - QuantityChange) : 0)}
                            keyboardType="numeric" />

                    </View>
                </View>
                {vendorSession.Settings.ReturnHistory == true ?
                    <View>
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => setShowModal(false)}>
                            <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('ly_do')}</Text>
                            <View style={{ flexDirection: "row", flex: 7 }}>
                                <TextInput
                                    onChangeText={text => {
                                        setDescription(text)
                                    }}
                                    numberOfLines={3}
                                    multiline={true}
                                    value={Description}
                                    style={styles.descModal}
                                    placeholder={I18n.t('ly_do')} />
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 15 }}>
                            <View style={{ flex: 3 }}></View>
                            <View style={{ flex: 7, flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
                                <TouchableOpacity onPress={() => {
                                    setDescription(I18n.t('khach_yeu_cau'))
                                }} style={{}} >
                                    <Text style={{ textDecorationLine: "underline", color: colors.colorLightBlue, fontSize: I18n.locale == "vi" ? 13 : 11 }}>{I18n.t('khach_yeu_cau')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    setDescription(I18n.t('thao_tac_sai'))
                                }} style={{}} >
                                    <Text style={{ textDecorationLine: "underline", color: colors.colorLightBlue, fontSize: I18n.locale == "vi" ? 13 : 11 }}>{I18n.t('thao_tac_sai')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    : null}
                <View style={styles.wrapAllButtonModal}>
                    <TouchableOpacity onPress={() => props.setShowModal(false)} style={[styles.wrapButtonModal, deviceType == Constant.PHONE ? { marginHorizontal: 10 } : { marginHorizontal: 10, marginTop: 10 }]} >
                        <Text style={styles.buttonModal}>{I18n.t('huy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={(vendorSession.Settings.ReturnHistory == true && Description == "") || QuantityChange == 0} onPress={() => onClickOk()} style={[styles.wrapButtonModal, { backgroundColor: Colors.colorchinh, opacity: ((vendorSession.Settings.ReturnHistory == true && Description == "") || QuantityChange == 0) ? .5 : 1 }, deviceType == Constant.PHONE ? { marginHorizontal: 10 } : { marginHorizontal: 10, marginTop: 10 }]} >
                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainItem: {
        borderBottomColor: "#ddd", borderBottomWidth: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 10,
        borderBottomColor: "#ABB2B9",
        borderBottomWidth: 0.5,
    },
    wrapTamTinh: {
        borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white"
    },
    tamTinh: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5
    },
    textTamTinh: {
        fontWeight: "bold"
    },
    totalPrice: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-around"
    },
    footerMenu: {
        height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center"
    },
    headerModal: {
        backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4,
    },
    headerModalText: {
        textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, color: "#fff", marginVertical: 20
    },
    button: {
        borderColor: Colors.colorchinh,
        borderWidth: 1,
        color: Colors.colorchinh,
        fontWeight: "bold",
        paddingHorizontal: 17,
        paddingVertical: 10,
        borderRadius: 5
    },
    textPriceModal: {
        padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4
    },
    wrapTextPriceModal: {
        alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC"
    },
    wrapAllButtonModal: {
        alignItems: "center", justifyContent: "space-between", flexDirection: "row",
    },
    wrapButtonModal: {
        alignItems: "center",
        // margin: 10,
        // marginHorizontal: 10,
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.colorchinh,
        padding: 5,
        borderRadius: 4,
        backgroundColor: "#fff"
    },
    buttonModal: {
        color: Colors.colorchinh, textTransform: "uppercase"
    },
    descModal: {
        height: 50,
        flex: 7,
        fontStyle: "italic",
        fontSize: 12,
        borderWidth: 0.5,
        borderRadius: 4,
        backgroundColor: "#D5D8DC",
        padding: 5, color: "#000"
    },
    textQuantityModal: {
        padding: 6,
        textAlign: "center",
        // margin: 10,
        marginHorizontal: 10,
        flex: 1,
        borderRadius: 4,
        borderWidth: 0.5,
        backgroundColor: "#D5D8DC", color: "#000"
    },
    textQuantityModalOnly: {
        padding: 6,
        textAlign: "center",
        margin: 10,
        flex: 1,
        borderRadius: 4,
        borderWidth: 0.5,
        backgroundColor: "#D5D8DC", color: "#000"
    },
});
