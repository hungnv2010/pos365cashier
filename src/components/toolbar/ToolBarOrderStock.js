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

                <View style={{ flex: deviceType == Constant.TABLET ? 2 : 2, alignItems: 'flex-end', flexDirection: "row", justifyContent: 'flex-end',marginRight:20 }}>

                    <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate('QRCode', { _onSelect: onCallBack }) }}  >
                        <View style={{}}>
                            <Icon name="qrcode-scan" size={25} style={{}} color={Colors.colorLightBlue} />
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
        height: 44,
        backgroundColor: 'white',
        borderBottomColor: 'gray', borderBottomWidth: 0.5
    },
    button: {
        flex: 1,justifyContent:'flex-end',alignItems:'flex-end'
    }
})
