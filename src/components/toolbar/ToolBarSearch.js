

import React, { Component, useState } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    TextInput, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/Colors';

export default function ToolBarSearch(props) {

    let blockClick = false;

    const [showInput, setShowInput] = useState(props.active ? props.active : false);
    const [textSearch, setTextSearch] = useState("");

    const onClickSearch = () => {
        setTextSearch("")
        setShowInput(true)
    }

    const onSubmitEditing = (text) => {
        setShowInput(false)
        console.log("onSubmitEditing " + JSON.stringify(text.nativeEvent.text));
        props.clickRightIcon(text.nativeEvent.text)
    }

    return (
        <View style={styles.toolbarContainer}>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickLeftIcon ?
                    <TouchableOpacity onPress={props.clickLeftIcon} style={{ paddingLeft: 19, paddingRight: 19, paddingTop: 16, paddingBottom: 16 }}>
                        <Image source={Images.icon_back} style={{ width: 48, height: 48, }} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => {
                        if (blockClick == false) {
                            blockClick = true;
                            props.navigation.pop()
                            setTimeout(() => {
                                blockClick = false;
                            }, 1000);
                        }
                    }}>
                        <Image source={Images.icon_back} style={{ width: 48, height: 48, paddingLeft: 19, paddingRight: 19, paddingTop: 16, paddingBottom: 16 }} />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 5, paddingLeft: 10, alignItems: 'center', flexDirection: 'row' }}>
                {showInput == false ?
                    <Subheading
                        numberOfLines={1}
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        {props.title}
                    </Subheading>
                    :
                    <View style={{ flex: 1, borderRadius: 3, borderColor: "#fff", borderWidth: 1, backgroundColor: "#fff", flexDirection: "row", marginRight: 2, height: "80%" }}>
                        <TextInput value={textSearch} style={{ flex: 1, color: "#000" }}
                            autoFocus={true}
                            onSubmitEditing={(text) => onSubmitEditing(text)}
                            onChangeText={(text) => {
                                setTextSearch(text)
                                props.clickRightIcon(text)
                            }}
                        />
                    </View>
                }
            </View>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {showInput == false ?
                    <TouchableOpacity onPress={() => onClickSearch()}>
                        <Ionicons name={props.rightIcon} size={props.size ? props.size : 30} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => setShowInput(false)}>
                        <Icon name="close" size={props.size ? props.size : 30} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                }
            </View>
        </View>


    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 44,
        backgroundColor: 'white',
    },
})

ToolBarSearch.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarSearch.defaultProps = {
    leftIcon: "keyboard-backspace"
}
