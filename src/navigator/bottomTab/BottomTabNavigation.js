import React from 'react';
import { StatusBar, Image, View, StyleSheet, TouchableOpacity, Text, ScrollView, SectionList } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Images, Colors } from '../../theme';
const Tab = createMaterialBottomTabNavigator();
import Main from '../../screens/main/Main';
import Icon from 'react-native-vector-icons/MaterialIcons';

import More from '../../screens/more/More'
import { useSelector } from 'react-redux';
import History from '../../screens/history/History'
import OverView from '../../screens/overView/overView'

import I18n from '../../common/language/i18n'

export default () => {

    const numberOrder = useSelector(state => {
        console.log("useSelector numberOrder state ", state);
        return state.Common.numberOrder > 0 ? state.Common.numberOrder : 0;
    });

    return (
        <Tab.Navigator
            initialRouteName="Home"
            activeColor={Colors.colorchinh}
            inactiveColor="#696969"
            shifting={false}
            barStyle={{ backgroundColor: '#ffffff', height: 50 }}
        >
            {/* tong_quan */}
            <Tab.Screen name="Home" component={Main} options={{
                tabBarLabel: I18n.t('phong_ban_'),
                tabBarIcon: ({ color }) => (
                    <View>
                        <Icon name="home" size={22} color={color} />
                    </View>
                ),
            }} />
            <Tab.Screen name="History" component={History} options={{
                tabBarLabel: I18n.t('lich_su'),
                tabBarIcon: ({ color }) => (
                    <Icon name="history" size={26} color={color} />
                ),
            }} />
            <Tab.Screen name="More" component={More} options={{
                tabBarLabel: I18n.t('them'),
                tabBarIcon: ({ color }) => (
                    <Icon name="more-horiz" size={26} color={color} />
                ),
            }} />

            <Tab.Screen name="khach_hang" component={OverView} options={{
                tabBarLabel: I18n.t('tong_quan'),
                tabBarIcon: ({ color }) => (
                    <Icon name="history" size={26} color={color} />
                ),
            }} />

        </Tab.Navigator>
    );
}