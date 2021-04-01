import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons'
import Fonts from '../../theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import colors from '../../theme/Colors';

export default function ToolBarDefault(props) {


    return (
        <View style={styles.toolbarContainer}>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickLeftIcon ?
                    <TouchableOpacity onPress={props.clickLeftIcon} style={{ paddingLeft: 19, paddingRight: 19, paddingTop: 16, paddingBottom: 16 }}>
                        <Image source={Images.icon_back} style={{ width: 48, height: 48, }} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => {
                        props.navigation.pop()
                    }} style={{ paddingLeft: 19, paddingRight: 19, paddingTop: 16, paddingBottom: 16 }}>
                        <Image source={Images.icon_back} style={{ width: 48, height: 48, }} />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 5, paddingLeft: 10, alignItems: 'center', flexDirection: 'row' }}>
                <Subheading
                    numberOfLines={1}
                    style={{
                        fontWeight: "bold"
                    }}
                >
                    {props.title}
                </Subheading>
            </View>
        </View>


    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 44,
        backgroundColor: 'white',
        zIndex: 99999999,
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray'
    },
})

ToolBarDefault.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarDefault.defaultProps = {
    leftIcon: "keyboard-backspace"
}
