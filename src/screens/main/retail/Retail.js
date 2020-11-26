import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import I18n from '../../common/language/i18n';
import MainToolBar from '../main/MainToolBar';
import moment from 'moment';
import 'moment/min/locales'

export default (props) => {

    // const [dataItem, setDataItem] = useState("")
    // const [listHistoryOrder, setListOrder] = useState([])
    // const { deviceType } = useSelector(state => {
    //     console.log("useSelector state ", state);
    //     return state.Common
    // });

    useEffect(() => {

    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('lich_su_goi_mon')}
            />
        </View>
    );
};