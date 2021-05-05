

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
        <View style={styles.toolbarContainer}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "center"
            }}
            >
                <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={() => props.navigation.pop()} style={{ height: "100%", justifyContent: "center", paddingHorizontal: 10 }}>
                        <Image source={Images.icon_back} style={{ width: 48, height: 48 }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                    <Subheading
                        numberOfLines={1}
                        style={{

                        }}
                    >
                        {props.title}
                    </Subheading>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>

                </View>
                {/* <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={props.clickPrint} style={{ height: "100%", width: 50, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: '#000', textTransform: "uppercase" }}>{I18n.t('in')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={props.clickCheck} style={{ height: "100%", width: 50, justifyContent: "center", alignItems: "center" }}>
                        <Icon delayPressIn={0} name="check" size={24} color="#000" />
                    </TouchableOpacity>
                </View> */}
            </View>
        </View >
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 44,
        backgroundColor: 'white',
        zIndex: 99999999, borderBottomColor: 'gray',
        borderBottomWidth: 0.5
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
