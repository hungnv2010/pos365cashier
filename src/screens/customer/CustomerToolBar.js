

import React, { Component, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import colors from '../../theme/Colors';


export default function CustomerToolBar(props) {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const inputRef = useRef(null)

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });



    useEffect(() => {
        props.outputTextSearch(value.trim())
    }, [value])

    useEffect(() => {
        if (isSearch) inputRef.current.focus()
    }, [isSearch])

    return (
        <View style={styles.toolbarContainer}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "center"
            }}
            >
                {
                    props.route.params._onSelect ?
                        <TouchableOpacity onPress={() => {
                            props.navigation.goBack();
                        }} style={[{paddingLeft:19,paddingRight:19,paddingTop:16,paddingBottom:16, justifyContent:'center'}, deviceType == Constant.TABLET ? { alignSelf: "flex-start" } : { alignItems: "center" }]}>

                            <Image source={Images.icon_back} style={{ width: 48, height: 48 ,}} />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => {
                            props.navigation.openDrawer();
                        }} style={[{}, deviceType == Constant.TABLET ? { alignSelf: "flex-start" } : { alignItems: "center" }]}>

                            <Image source={Images.icon_menu} style={{ width: 48, height: 48 }} />
                        </TouchableOpacity>
                }

                <View style={{ flex: 4, flexDirection: 'row' }}>

                    {isSearch ?
                        <View style={{ marginLeft: 15, flex: 1, borderRadius: 3, borderColor: "#fff", borderWidth: 1, backgroundColor: "#fff", marginRight: 2, height: "80%" }}>
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

                <View style={{ alignItems: "center" }}>


                    <TouchableOpacity onPress={() => {
                        if (value != '') onChangeText('')
                        else setIsSearch(!isSearch)
                    }} style={{ marginHorizontal: 15, }}>
                        <IonIcon name={!isSearch ? "md-search" : "md-close"} size={30} color={colors.colorLightBlue} />
                    </TouchableOpacity>

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
        backgroundColor: 'white',
        height: 44,borderBottomColor:'gray',
        borderBottomWidth:0.5
    },
})


