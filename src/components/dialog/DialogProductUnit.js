import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ImageBackground, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../../theme';
import I18n from "../../common/language/i18n";
import { RadioButton } from 'react-native-paper';

export default (props) => {
    return (
        <View >
            <View style={styles.headerModal}>
                <Text style={styles.headerModalText}>{I18n.t('chon_dvt')}</Text>
            </View>

            <TouchableOpacity onPress={() => {
                props.setIsLargeUnit(false)
            }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                <RadioButton.Android
                    color="orange"
                    status={!IsLargeUnit ? 'checked' : 'unchecked'}
                    onPress={() => {
                        props.setIsLargeUnit(false)
                    }}
                />
                <Text style={{ marginLeft: 20, fontSize: 20 }}>{itemOrder.Unit}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
                props.setIsLargeUnit(true)
            }} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <RadioButton.Android
                    color="orange"
                    status={IsLargeUnit ? 'checked' : 'unchecked'}
                    onPress={() => {
                        props.setIsLargeUnit(true)
                    }}
                />
                <Text style={{ marginLeft: 20, fontSize: 20 }}>{itemOrder.LargeUnit}</Text>
            </TouchableOpacity>

            <View style={[styles.wrapAllButtonModal, { justifyContent: "center", marginBottom: 10 }]}>
                <TouchableOpacity onPress={() => props.onClickSubmitUnit()} style={{
                    backgroundColor: Colors.colorchinh, alignItems: "center",
                    margin: 2,
                    width: 100,
                    borderWidth: 1,
                    borderColor: Colors.colorchinh,
                    padding: 5,
                    borderRadius: 4,
                }} >
                    <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                </TouchableOpacity>
            </View>

        </View >
    )
}

const styles = StyleSheet.create({
    headerModal: {
        backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4,
    },
    headerModalText: {
        margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, marginVertical: 10, color: "#fff"
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
    wrapAllButtonModal: {
        alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 15
    },
    wrapButtonModal: {
        alignItems: "center",
        margin: 2,
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
});