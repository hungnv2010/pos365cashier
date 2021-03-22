import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';



export default (props) => {
    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_nhan_vien')}
                outPutTextSearch={() => { }}
            />
            <Text>quan ly nhan vien</Text>
        </View>
    )
}
