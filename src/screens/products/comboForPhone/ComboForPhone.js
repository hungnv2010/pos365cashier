import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault'
import I18n from '../../../common/language/i18n';
import SelectProduct from '../../served/servedForTablet/selectProduct/SelectProduct'
import { Constant } from '../../../common/Constant';
import { useSelector } from 'react-redux';
import { Images } from '../../../theme';
import { TextInput } from 'react-native-gesture-handler';
import { ceil } from 'react-native-reanimated';
import { currencyToString } from '../../../common/Utils';
import ToolBarCombo from '../../../components/toolbar/ToolBarCombo'

export default (props) => {

    const outputTextSearch = () =>{
        
    }
    return (
        <View>
            <ToolBarCombo
                    {...props}
                    //outputClickProductService={outputClickProductService}
                    navigation={props.navigation}
                    outputTextSearch={outputTextSearch} 
                    />
        </View>
    )
}