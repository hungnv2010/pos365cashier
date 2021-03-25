import React, { useEffect, useState , useRef} from 'react'
import { View, StyleSheet, Switch, Text, TouchableOpacity } from 'react-native';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { Constant } from "../../common/Constant";
import { set } from 'react-native-reanimated';
import I18n from '../../common/language/i18n';
import colors from '../../theme/Colors';
export default function SettingSwitch(props) {
    const [stateSwitch, setStateSwitch] = useState(props.isStatus)
    const [isDisable, setIsDisable] = useState(false)
    const pause = useRef(false)

    useEffect(() => {
        setStateSwitch(props.isStatus)
    }, [props.isStatus])

    const onSwitchClick = () => {
        if(pause.current == false){
            setStateSwitch(!stateSwitch)
        setThumbColor(!stateSwitch)
        setIsDisable(true)
        props.output({ title: props.title, stt: !stateSwitch }) 
        pause.current = true
        setTimeout(() => {
            pause.current = false 
            setIsDisable(false) 
        }, 1000)

        }
        
    }
    const setThumbColor = (a) => {
        if (a == true) {
            return colors.colorchinh
        } else {
            return "silver"
        }

    }
    return (
        <TouchableOpacity onPress={() => onSwitchClick()}>
            <View style={styles.styleItemSwitch}>
                <Text style={{ fontSize: 16, flex: 6, marginLeft: 20, marginTop: 20 }}>{I18n.t(props.title)}</Text>
                <Switch style={{ flex: 1, marginTop: 20, marginRight: 20 }} value={stateSwitch} onValueChange={() => onSwitchClick()} trackColor={{ false: "silver", true: "#FFA07A" }}
                    thumbColor={setThumbColor(stateSwitch)} disabled={isDisable}
                ></Switch>
            </View>
        </TouchableOpacity>

    )
}
const styles = StyleSheet.create({
    styleItemSwitch: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10, justifyContent: 'center', alignItems: 'center'
    }
})
