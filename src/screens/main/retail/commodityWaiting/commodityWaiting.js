import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput
} from 'react-native';
import ToolBarDefault from '../../../../components/toolbar/ToolBarDefault';
import realmStore from '../../../../data/realm/RealmStore';


export default (props) => {

    useEffect(() => {
        const getCommodityWaiting = async () => {
            let serverEvents = await realmStore.queryServerEvents()
            console.log('commodityWaiting serverEvents', JSON.parse(JSON.stringify(serverEvents)));
        }
        getCommodityWaiting()
    }, [])

    return (
        <View style={{ flex: 1, }}>
            <ToolBarDefault
                {...props}
                title="Commodity waiting for payment" />
        </View>
    )

}


