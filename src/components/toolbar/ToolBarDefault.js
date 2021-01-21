

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


export default function ToolBarDefault(props) {


    return (
        <View style={styles.toolbarContainer}>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickLeftIcon ?
                    <TouchableOpacity onPress={props.clickLeftIcon} style={{paddingLeft:19,paddingRight:19,paddingTop:16,paddingBottom:16}}>
                        <Image source={Images.icon_back} style={{width:10,height:16,}}/>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => {
                        props.navigation.pop()
                    }} style={{paddingLeft:19,paddingRight:19,paddingTop:16,paddingBottom:16}}>
                        <Image source={Images.icon_back} style={{width:10,height:16,}}/>
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

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickRightIcon && props.rightIcon ?
                    <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={props.clickRightIcon}>
                        {props.rightIcon == 'md-search' ?
                            <IonIcon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                            :
                            <Icon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                        }
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
