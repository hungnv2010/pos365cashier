import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput
} from 'react-native';
import { Colors, Metrics, Images } from '../../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import I18n from '../../../common/language/i18n'
import { useSelector } from 'react-redux'
import { Constant } from '../../../common/Constant';

export default forwardRef((props, ref) => {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);

    const { deviceType } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        props.outputTextSearch(value)
    }, [value])


    const onCallBack = (data) => {
        console.log('onCallBack data', data);
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

                <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { props.navigation.openDrawer() }}>
                        <Icon name="menu" size={28} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1.5, justifyContent: 'center', alignItems: 'flex-start', }}>
                    <Subheading numberOfLines={1} style={{ color: 'white', fontSize: 18, fontWeight: "bold" }} >
                        {I18n.t('don_hang')}
                    </Subheading>
                </View>
                <View style={{ flex: 3, marginRight: 10 }}>
                    {isSearch ?
                        <View style={{ borderRadius: 3, borderColor: "#fff", borderWidth: 1, backgroundColor: "#fff", flexDirection: "row", marginRight: 2, height: "80%" }}>
                            <TextInput
                                autoFocus={true}
                                style={{ flex: 1, color: "#000" }}
                                onChangeText={(text) => onChangeText(text)}
                                value={value}
                            />
                        </View>
                        :
                        null}
                </View>

                <View style={{ flex: deviceType == Constant.TABLET ? 3 : 4, alignItems: "center", flexDirection: "row", justifyContent: "space-around", }}>
                    {
                        deviceType == Constant.TABLET ?
                            <TouchableOpacity style={styles.button} onPress={() => {
                                if (value != '') onChangeText('')
                                else setIsSearch(!isSearch)
                            }} >
                                <View style={{}}>
                                    <Ionicons name={!isSearch ? "md-search" : "md-close"} size={30} color="white" style={{}} />
                                </View>
                            </TouchableOpacity>
                            :
                            null
                    }

                    <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate('QRCode', { _onSelect: onCallBack }) }} >
                        <View style={{}}>
                            <Icon name="qrcode-scan" size={25} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate('NoteBook', { _onSelect: onCallBack }) }} >
                        <View style={{}}>
                            <Icon name="library-books" size={28} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { }} >
                        <View style={{}}>
                            <Icon name="refresh" size={25} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>

                    {
                        deviceType == Constant.TABLET ?
                            null
                            :
                            <TouchableOpacity style={styles.button} onPress={() => {props.navigation.navigate('RetailSelectProduct', { _onSelect: onCallBack }) }} >
                                <View style={{}}>
                                    <Icon name="check" size={25} color="white" style={{}} />
                                </View>
                            </TouchableOpacity>
                    }
                </View>

            </View>
        </View>
    )

})

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 40,
        backgroundColor: Colors.colorchinh,
    },
    button: {
        flex: 1
    }
})

