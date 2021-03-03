

import React, { Component, useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import colors from '../../theme/Colors';

export default function ToolBarDefault(props) {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const inputRef = useRef(null)

    useEffect(() => {
        props.outputTextSearch(value)
    }, [value])

    useEffect(() => {
        if (isSearch) inputRef.current.focus()
    }, [isSearch])

    let blockClick = false;

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
                    {props.clickLeftIcon && props.leftIcon ?
                        <TouchableOpacity onPress={props.clickLeftIcon} style={{paddingLeft:19,paddingRight:19,paddingTop:16,paddingBottom:16}}>
                        <Image source={Images.icon_back} style={{width:48,height:48,}}/>
                    </TouchableOpacity>
                        :
                        null
                    }
                </View>

                <View style={{ flex: 3 }}>
                    {isSearch ?
                        <View style={{ borderRadius: 3, borderColor: "#fff", borderWidth: 1, backgroundColor: "#fff", flexDirection: "row", marginRight: 2, height: "80%" }}>
                            <TextInput
                                ref={inputRef}
                                style={{ backgroundColor: "transparent", flex: 1, color: "#000" }}
                                onChangeText={(text) => onChangeText(text)}
                                value={value}
                            />
                        </View>
                        :
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
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
                    }
                </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={() => {
                        if (value != '') onChangeText('')
                        else setIsSearch(!isSearch)
                    }}>
                        <Ionicons name={!isSearch ? "md-search" : "md-close"} size={30} color={colors.colorLightBlue} style={{}} />
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={() => {
                        if (blockClick == false) {
                            blockClick = true;
                            props.onClickDone()
                            setTimeout(() => {
                                blockClick = false;
                            }, 1000);
                        }
                    }
                    }>
                        <Icon name="check" size={30} color={colors.colorLightBlue} style={{}} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 44,
        backgroundColor: 'white'
    },
})

ToolBarDefault.propTypes = {
    title: PropTypes.string,
    leftIcon: PropTypes.string,
    onClickSearch: PropTypes.func,
    clickLeftIcon: PropTypes.func,
    onClickDone: PropTypes.func
}

ToolBarDefault.defaultProps = {

}
