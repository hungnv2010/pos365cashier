

import React, { Component, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { Colors, Metrics, Images } from '../../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types';
import { Constant } from '../../../common/Constant';
import { useSelector } from 'react-redux';
import colors from '../../../theme/Colors';


export default function CustomerToolBar(props) {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const inputRef = useRef(null)

    const { deviceType } = useSelector(state => {
        return state.Common
    });



    useEffect(() => {
        props.outputTextSearch(value.trim())
    }, [value])

    useEffect(() => {
        if (isSearch) inputRef.current.focus()
    }, [isSearch])
    const onClickFilter = () =>{
        props.clickFilter()
    }

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
                    props.navigation.goBack();
                }} style={{ padding: 15, }}>

                    <Image source={Images.icon_back} style={{ width: 48, height: 48, }} />
                </TouchableOpacity>

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

                <View style={{ alignItems: "center",flexDirection:'row' }}>


                    <TouchableOpacity onPress={() => {
                        if (value != '') onChangeText('')
                        else setIsSearch(!isSearch)
                    }} style={{ marginHorizontal: 15, }}>
                        <IonIcon name={!isSearch ? "md-search" : "md-close"} size={30} color={Colors.colorLightBlue} />

                    </TouchableOpacity>
                    {
                        props.iconfilter ?
                            <TouchableOpacity onPress={()=>onClickFilter()}>
                                <Icon name={props.iconfilter} size={30} color={Colors.colorLightBlue} />
                            </TouchableOpacity> : null
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
        backgroundColor: 'white',
        height: 44, borderBottomColor: 'gray',
        borderBottomWidth: 0.5
    },
})


