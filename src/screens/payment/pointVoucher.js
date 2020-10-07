import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import IconFeather from 'react-native-vector-icons/Feather';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { Images } from '../../theme';


export default (props) => {
    return (
        <View style={{ flex: 1 }}>
            <Surface style={styles.surface}>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" }}>
                    <View style={{ flex: 3, flexDirection: "row", alignItems: "center", }}>
                        <Image source={Images.icon_checked} style={{ width: 20, height: 20, marginRight: 10 }} />
                        <Text style={{ fontWeight: "bold", color: colors.colorchinh }}>{I18n.t('tong_tien')}</Text>
                    </View>
                    <View style={{ flex: 3 }}></View>
                    <Text style={{ flex: 3, textAlign: "right", fontWeight: "bold" }}>{}</Text>
                </View>
            </Surface>
            <Surface style={styles.surface}>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                        <Image source={Images.icon_checked} style={{ width: 20, height: 20, marginRight: 10 }} />
                        <Text style={{ fontWeight: "bold", color: colors.colorchinh }}>{I18n.t('tong_tien')}</Text>
                    </View>
                </View>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                    <Text>{I18n.t('diem_hien_tai')}</Text>
                    <Text>0</Text>
                </View>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                    <Text style={{ flex: 3 }}>{I18n.t('diem_su_dung')}</Text>
                    <View style={{ flex: 3 }}></View>
                    <TextInput
                        value={"" + 1}
                        onTouchStart={() => { alert('press') }}
                        editable={false}
                        style={{ textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                </View>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#ccc", }}>
                    <Text>{I18n.t('tien_chiet_khau')}</Text>
                    <Text>{currencyToString(12000)}</Text>
                </View>
            </Surface>
            <Surface style={styles.surface}>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", paddingHorizontal: 10, alignItems: "center" }}>
                    <View style={{ flex: 3, flexDirection: "row", alignItems: "center", }}>
                        <Image source={Images.icon_checked} style={{ width: 20, height: 20, marginRight: 10 }} />
                        <Text style={{ fontWeight: "bold", color: colors.colorchinh }}>{I18n.t('tong_tien')}</Text>
                    </View>
                    <TextInput
                        value={"" + 1}
                        onTouchStart={() => { alert('press') }}
                        editable={false}
                        style={{ textAlign: "right", backgroundColor: "#eeeeee", marginLeft: 10, flex: 3, borderColor: "gray", borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                </View>
            </Surface>
        </View>
    )
}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    }
})



