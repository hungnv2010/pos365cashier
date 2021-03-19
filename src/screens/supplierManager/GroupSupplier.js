import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';



export default (props) => {
    return (
        <View style={{ flex: 1 }}>
           <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('nhom_nha_cung_cap')}
            />
            <Text>nhom_nha_cung_cap</Text>
        </View>
    )
}
