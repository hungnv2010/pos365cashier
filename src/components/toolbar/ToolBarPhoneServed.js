

import React, { Component, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
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
import realmStore from '../../data/realm/RealmStore';
import colors from '../../theme/Colors';


export default forwardRef((props, ref) => {

    let blockClick = false;

    const [showProductService, setShowProductService] = useState(false);


    useImperativeHandle(ref, () => ({
        clickCheckInRef(status) {
            console.log("clickCheckInRef status ", status);
            setShowProductService(status)
        }
    }));

    useEffect(() => {
        const getData = async () => {
            if (props.route.params.room.ProductId > 0) {
                setShowProductService(true)
            }
        }
        getData()
    }, [])

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
                        <Icon name={props.leftIcon} size={props.size ? props.size : 30}  />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 5, paddingLeft: 10, alignItems: 'center', flexDirection: 'row' }}>
                <Subheading
                    numberOfLines={1}
                    style={{
                        color: 'black', fontWeight: "bold"
                    }}
                >
                    {props.title}
                </Subheading>
            </View>
            <View style={{ flex: 4, flexDirection: "row" }}>
                {showProductService ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity onPress={props.clickProductService}>
                        <Icon name="clock-outline" size={props.size ? props.size : 30} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                </View> : null}
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} >
                    <TouchableOpacity onPress={props.clickQRCode}>
                        <Icon name="qrcode-scan" size={props.size ? props.size : 23} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity onPress={props.clickNoteBook}>
                        <Icon name="library-books" size={props.size ? props.size : 26} color={colors.colorLightBlue} />
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    {props.clickRightIcon && props.rightIcon ?
                        <TouchableOpacity onPress={props.clickRightIcon}>
                            <Icon name={props.rightIcon} size={props.size ? props.size : 30} color={colors.colorLightBlue} />
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>
            </View>
        </View>


    )

}
)
const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 44,
        backgroundColor:'white',
        borderBottomWidth:0.5,borderBottomColor:'gray'
    },
})

// ToolBarPhoneServed.propTypes = {
//     title: PropTypes.string,
//     rightIcon: PropTypes.string,
//     leftIcon: PropTypes.string,
//     clickRightIcon: PropTypes.func,
//     clickLeftIcon: PropTypes.func
// }

// ToolBarPhoneServed.defaultProps = {
//     leftIcon: "keyboard-backspace"
// }

