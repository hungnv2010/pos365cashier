

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import I18n from '../../common/language/i18n'
import colors from '../../theme/Colors';

export default function ToolBarPrintHtml(props) {

    const onClickBack = () => {
        props.navigation.pop();
    };

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });


    return (
        // <LinearGradient
        //     start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        //     colors={['#FFAB40', '#FF5722']}
        //     style={{ height: 44 }}
        // >
        <View style={{ height: 44, backgroundColor: 'white' }}>
            <View style={styles.toolbarContainer}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "center"
                }}
                >

                    <View style={{ flex: 0.6, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickRightIcon} style={{ height: "100%", justifyContent: "center", paddingHorizontal: 10 }}>
                            {props.rightIcon && props.clickRightIcon ?
                                <Icon name={props.rightIcon} size={props.size ? props.size : 30} color={colors.colorLightBlue} />
                                :
                                <TouchableOpacity onPress={()=>onClickBack()} style={{ paddingLeft: 19, paddingRight: 19, paddingTop: 16, paddingBottom: 16 }}>
                                    <Image source={Images.icon_back} style={{ width: 48, height: 48, }} />
                                </TouchableOpacity>
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Subheading
                            numberOfLines={1}
                            style={{
                            }}
                        >
                            {props.title}
                        </Subheading>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickDefault} >
                            <Text style={{  textTransform: "uppercase" }}>{I18n.t('mac_dinh')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1.4, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickLoadOnline} >
                            <Text style={{  }}>LOAD ONLINE</Text>
                        </TouchableOpacity>
                    </View>
                    {deviceType == Constant.PHONE ?
                        <View style={{ flex: 1, alignItems: "center" }}>
                            <TouchableOpacity onPress={props.clickShow} >
                                <Text style={{  textTransform: "uppercase" }}>{I18n.t('hien_thi')}</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
                            <View style={{ alignItems: "center" }}>
                                <TouchableOpacity onPress={props.clickPrint} style={{ height: "100%", justifyContent: "center", paddingHorizontal: 10 }} >
                                    <Text style={{  textTransform: "uppercase" }}>{I18n.t('in')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ alignItems: "center" }}>
                                <TouchableOpacity onPress={props.clickCheck} style={{ height: "100%", justifyContent: "center", paddingHorizontal: 10 }} >
                                    <Icon delayPressIn={0} name="check" color={colors.colorLightBlue} size={24} />
                                </TouchableOpacity>
                            </View>
                        </View>}
                </View>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 44,
        flex: 1,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.24,
        shadowRadius: 0.3,
        borderBottomWidth:0.5,
        borderBottomColor:'gray'
    },
})

ToolBarPrintHtml.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarPrintHtml.defaultProps = {

}
