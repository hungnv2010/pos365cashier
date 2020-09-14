import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [roomGroups, setRoomGroups] = useState([])

    useEffect(() => {
        console.log("Room props ", props.route.params[0].Name);
        setRoomGroups(props.route.params)

    }, [])

    return (
        <View style={styles.conatiner}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('nhom_phong_ban')}
            />

            <View style={{ margin: 15, backgroundColor: "#fff", borderRadius: 5, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={"md-search"} size={25} color="black" style={{ marginLeft: 10 }} />
                <TextInput style={{ padding: 10, flex: 1 }} />
            </View>

            <ScrollView>
                {
                    roomGroups.map((item, index) => {
                        return (
                            <View style={{ margin: 15, marginTop: 0, backgroundColor: "#fff", padding: 10, borderRadius: 5, flexDirection: "column" }}>
                                <Text style={{ fontWeight: "bold" }}>{item.Name}</Text>
                                <Text style={{ marginTop: 5 }}>{I18n.t('so_luong_ban')}: 0</Text>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View>
    );

}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
})