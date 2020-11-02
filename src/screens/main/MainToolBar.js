

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';


export default function MainToolBar(props) {

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    return (
        <View style={styles.toolbarContainer}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "center"
            }}
            >

                <TouchableOpacity onPress={() => {
                    console.log("Click this.props ", props);
                    props.navigation.openDrawer();
                }} style={[{ marginLeft: 15 }, deviceType == Constant.TABLET ? { alignSelf: "flex-start" } : { alignItems: "center" }]}>
                    {/* <Image source={Images.logo_365_boss_white}
                        style={{ width: 172, height: 40, resizeMode: 'contain' }} /> */}
                    <Icon style={{ marginTop: 0 }} name="menu" size={32} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                    <Subheading
                        numberOfLines={1}
                        style={{
                            color: 'white',
                            fontWeight: "bold",
                            fontSize: 18
                        }}
                    >
                        {props.title}
                    </Subheading>
                </View>

                <View style={{ marginRight: 15, alignItems: "center" }}>
                    {props.clickRightIcon && props.rightIcon ?
                        <TouchableOpacity onPress={props.clickRightIcon}>
                            <Icon name={props.rightIcon} size={props.size ? props.size : 28} color="white" />
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>
            </View>
        </View >
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 44,
        // flex: 1,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.24,
        shadowRadius: 0.3,
        backgroundColor: Colors.colorchinh,
        height: 44
    },
})

MainToolBar.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

MainToolBar.defaultProps = {

}
