

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
import colors from '../../theme/Colors';
import I18n from '../../common/language/i18n'

export default function ToolBarPreviewHtml(props) {

    onClickBack = () => {
        props.navigation.pop();
    };

    return (
        // <LinearGradient
        //     start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        //     colors={['#FFAB40', '#FF5722']}
        //     style={{ height: 44, zIndex: 9999999999}}
        // >
            <View style={styles.toolbarContainer}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "center"
                }}
                >

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickRightIcon} style={{height: "100%", justifyContent: "center", paddingHorizontal: 10}}>
                            {props.rightIcon && props.clickRightIcon ?
                                <Icon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                                :
                                <Icon delayPressIn={0} color="#fff" name="keyboard-backspace" onPress={onClickBack} size={30} />
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Subheading
                            numberOfLines={1}
                            style={{
                                color: 'white'
                            }}
                        >
                            {props.title}
                        </Subheading>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickPrint} style={{ height: "100%", width: 50, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{ color: 'white', textTransform: "uppercase" }}>{I18n.t('in')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickCheck} style={{ height: "100%", width: 50, justifyContent: "center", alignItems: "center"}}>
                            <Icon delayPressIn={0} name="check" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        // </LinearGradient>
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

ToolBarPreviewHtml.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarPreviewHtml.defaultProps = {

}
