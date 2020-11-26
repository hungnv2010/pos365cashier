import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Switch, Text, TouchableOpacity } from 'react-native';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { Constant } from "../../common/Constant";
import { set } from 'react-native-reanimated';
import I18n from '../../common/language/i18n';
export default function SettingSwitch(props) {
    const [stateSwitch, setStateSwitch] = useState(props.isStatus)

    useEffect(() => {
        setStateSwitch(props.isStatus)
    }, [props.isStatus])

    const onSwitchClick = () => {
        setStateSwitch(!stateSwitch)
        setThumbColor(!stateSwitch)
        props.output({ title: props.title, stt: !stateSwitch })
    }
    const setThumbColor = (a) => {
        if (a == true) {
            return "#FF4500"
        } else {
            return "silver"
        }
    }
    return (
        <TouchableOpacity onPress={() => onSwitchClick()}>
            <View style={styles.styleItemSwitch}>
                <Text style={{ fontSize: 16, flex: 6, marginLeft: 20, marginTop: 20 }}>{I18n.t(props.title)}</Text>
                <Switch style={{ flex: 1, marginTop:20 }} value={stateSwitch} onValueChange={() => onSwitchClick()} trackColor={{ false: "silver", true: "#FFA07A" }}
                    thumbColor={setThumbColor(stateSwitch)}
                ></Switch>
            </View>
        </TouchableOpacity>

    )
}
const styles = StyleSheet.create({
    styleItemSwitch: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10
    }
})
