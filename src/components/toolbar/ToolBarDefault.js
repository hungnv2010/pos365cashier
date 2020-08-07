

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';


export default function ToolBarDefault(props) {

    let blockClick = false;

    return (
        <View style={styles.toolbarContainer}>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickLeftIcon ?
                    <TouchableOpacity onPress={props.clickLeftIcon}>
                        <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
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
                        <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 5, paddingLeft: 10, alignItems: 'center', flexDirection: 'row' }}>
                <Subheading
                    numberOfLines={1}
                    style={{
                        color: 'white', fontWeight: "bold"
                    }}
                >
                    {props.title}
                </Subheading>
            </View>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
                {props.clickRightIcon && props.rightIcon ?
                    <TouchableOpacity style={{paddingHorizontal: 10}} onPress={props.clickRightIcon}>
                        <Icon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                    :
                    null
                }
            </View>
        </View>


    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 40,
        backgroundColor: Colors.colorchinh,
        zIndex: 99999999
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
