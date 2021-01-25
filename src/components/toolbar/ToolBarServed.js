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

export default forwardRef((props, ref) => {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [showProductService, setShowProductService] = useState(false);


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
                    <TouchableOpacity onPress={() => { props.navigation.goBack() }} style={{paddingLeft:19,paddingRight:19,paddingTop:16,paddingBottom:16}}>
                        <Image source={Images.icon_back} style={{ width: 10, height: 16, }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start', }}>
                    <Subheading numberOfLines={1} style={{ color: 'white', fontSize: 18, fontWeight: "bold" }} >
                        {I18n.t('don_hang')}
                    </Subheading>
                </View>
                <View style={{ flex: 5, marginRight: 10 }}>
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

                <View style={{ flex: 2, alignItems: "center", flexDirection: "row", justifyContent: "space-around", }}>
                    <TouchableOpacity style={styles.button} onPress={() => {
                        if (value != '') onChangeText('')
                        else setIsSearch(!isSearch)
                    }} >
                        <View style={{}}>
                            <Ionicons name={!isSearch ? "md-search" : "md-close"} size={30} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>
                    {
                        showProductService ?
                            <TouchableOpacity style={styles.button} onPress={() => { props.outputClickProductService() }} >

                                <View style={{}}>
                                    <Icon name="clock-outline" size={30} color="white" />
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

