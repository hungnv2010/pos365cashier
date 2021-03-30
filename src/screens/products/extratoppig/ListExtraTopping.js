import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import { Snackbar } from 'react-native-paper';
import I18n from '../../../common/language/i18n';
import { useSelector } from 'react-redux';
import MainToolBar from '../../main/MainToolBar';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';

export default (props) =>{
    return(
        <View>
            <ToolBarDefault
            {...props}
            title={I18n.t('danh_sach_extra_topping')}
            />
        </View>
    )
}