

import React, { Component, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import colors from '../../theme/Colors';


export default function MainToolBar(props) {
    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);

    const { deviceType } = useSelector(state => {
        return state.Common
    });
    useEffect(() => {
        props.outPutTextSearch(value)
    }, [value])

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
                    props.onClickLeft ? props.onClickLeft() : null
                    console.log("Click this.props ", props);
                    props.navigation.openDrawer();
                }} style={[{}, deviceType == Constant.TABLET ? { alignSelf: "flex-start" } : { alignItems: "center" }]}>
                    {/* <Image source={Images.logo_365_boss_white}
                        style={{ width: 172, height: 40, resizeMode: 'contain' }} /> */}
                    <Image source={Images.icon_menu} style={{ width: 48, height: 48 }} />
                </TouchableOpacity>
                <View style={{ flex: isSearch ? 3 : 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                    <Subheading
                        numberOfLines={1}
                        style={{
                            fontWeight: "bold",
                            fontSize: 18
                        }}
                    >
                        {props.title}
                    </Subheading>
                </View>
                <View style={{ flex: 5, marginRight: 10 }}>
                    {isSearch ?
                        <View style={{ borderRadius: 3, borderColor: "#fff", borderWidth: 1, backgroundColor: "#f2f2f2", flexDirection: "row", marginRight: 2, height: "80%" }}>
                            <TextInput
                                autoFocus={true}
                                style={{ flex: 1, color: "#000", paddingLeft: 5 }}
                                onChangeText={(text) => onChangeText(text)}
                                value={value}
                            />
                        </View>
                        :
                        null}
                </View>


                <View style={{ alignItems: "flex-end", marginRight: 13, flex: 1 }}>
                    {props.rightIcon ?
                        <TouchableOpacity style={styles.button} onPress={() => {
                            if (value != '') onChangeText('')
                            else setIsSearch(!isSearch)
                        }} >
                            <View style={{}}>
                                <Ionicons name={!isSearch ? "md-search" : "md-close"} size={30} color={colors.colorLightBlue} style={{}} />
                            </View>
                        </TouchableOpacity>
                        : null
                        // <TouchableOpacity onPress={props.clickRightIcon}>
                        //     <Image source={Images.icon_refresh} style={{width:48,height:48}}></Image>
                        // </TouchableOpacity>
                    }
                </View>
            </View>
        </View >
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 50,
        // flex: 1,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.24,
        shadowRadius: 0.3,
        backgroundColor: 'white',
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
