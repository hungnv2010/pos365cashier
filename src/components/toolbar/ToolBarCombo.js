import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import I18n from '../../common/language/i18n'
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';

export default forwardRef((props, ref) => {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [showProductService, setShowProductService] = useState(false);
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });



    useEffect(() => {
        const getData = async () => {
            console.log('props.route.params.room.ProductId', props.route.params.room.ProductId);
            if (props.route.params.room.ProductId > 0) {
                setShowProductService(true)
            }
        }
        getData()
    }, [])


    useEffect(() => {
        props.outputTextSearch(value)
    }, [value])

    useImperativeHandle(ref, () => ({
        clickCheckInRef(status) {
            console.log("clickCheckInRef status ", status);

            setShowProductService(status)
        }
    }));

    const onCallBack = (data, type) => {
        data.forEach(product => { if (product.Id && product.Id > 0) product.ProductId = product.Id })
        props.outputListProducts(data, type)
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
                    <TouchableOpacity onPress={() => { props.navigation.goBack() }} style={{ paddingLeft: 19, paddingRight: 19, paddingTop: 16, paddingBottom: 16 }}>
                        <Image source={Images.icon_back} style={{ width: 48, height: 48, }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 4, justifyContent: 'center', alignItems: 'flex-start', }}>
                    <Subheading numberOfLines={1} style={{ fontSize: 18, fontWeight: "bold" }} >
                        {props.title}
                    </Subheading>
                </View>
                <View style={{ flex: deviceType == Constant.TABLET ? 5 : 1, marginRight: 10 }}>
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

                <View style={{ flex: deviceType == Constant.TABLET ? 2 : 2, alignItems: "center", flexDirection: "row", justifyContent: "space-around", }}>
                    {deviceType == Constant.TABLET ?
                        <TouchableOpacity style={styles.button} onPress={() => {
                            if (value != '') onChangeText('')
                            else setIsSearch(!isSearch)
                        }} >
                            <View style={{}}>
                                <Ionicons name={!isSearch ? "md-search" : "md-close"} size={30} style={{}} color={Colors.colorLightBlue} />
                            </View>
                        </TouchableOpacity> : null
                    }

                    <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate('QRCode', { _onSelect: onCallBack }) }}  >
                        <View style={{}}>
                            <Icon name="qrcode-scan" size={25} style={{}} color={Colors.colorLightBlue} />
                        </View>
                    </TouchableOpacity>
                    {deviceType == Constant.PHONE && props.clickRightIcon ?
                        <TouchableOpacity style={styles.button} onPress={props.clickRightIcon }  >
                            <View style={{}}>
                                <Icon name="plus" size={25} style={{}} color={Colors.colorLightBlue} />
                            </View>
                        </TouchableOpacity> : null
                    }

                </View>

            </View>
        </View>
    )

})

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 44,
        backgroundColor: 'white',
        borderBottomColor: 'gray', borderBottomWidth: 0.5
    },
    button: {
        flex: 1
    }
})
