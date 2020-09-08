import React, { useState, useEffect, createRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Animated from 'react-native-reanimated';
import Login from '../../screens/login/LoginScreen';
import ServedForTablet from '../../screens/served/servedForTablet/ServedForTablet';
import BottomTabNavigation from '../bottomTab/BottomTabNavigation';
import DrawerNavigation from '../drawer/DrawerNavigation'
import PrintHtml from '../../screens/more/printHtml/PrintHtml'
import Preview from '../../screens/more/printHtml/Preview'
import Main from '../../screens/main/Main';
import QRCode from '../../screens/QRCode/QRCode';
import NoteBook from '../../screens/noteBook/NoteBook';
import DetailNoteBook from '../../screens/noteBook/DetailNoteBook';
import { Topping, PageServed, SelectProduct } from '../../screens/served/servedForPhone/index'
import PrintWebview from '../../screens/more/PrintWebview';
import DetailHistory from '../../screens/history/DetailHistory'
import ChangeTable from '../../screens/changeTable/Main';
const MainStack = createStackNavigator();


export default (props) => {

    return (
        <Animated.View style={{ flex: 1 }}>
            <MainStack.Navigator
                headerMode="none">
                <MainStack.Screen name="Login">{props => <Login {...props} />}</MainStack.Screen>
                {/* <MainStack.Screen name="Home">{props => <DrawerNavigation {...props} screenOptions={{ headerLeft: null }} />}</MainStack.Screen> */}
                <MainStack.Screen name="Home">{props => <BottomTabNavigation {...props} screenOptions={{ headerLeft: null }} />}</MainStack.Screen>
                <MainStack.Screen name="ServedForTablet">{props => <ServedForTablet {...props} />}</MainStack.Screen>
                <MainStack.Screen name="PrintHtml">{props => <PrintHtml {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Preview">{props => <Preview {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Topping">{props => <Topping {...props} />}</MainStack.Screen>
                <MainStack.Screen name="NoteBook">{props => <NoteBook {...props} />}</MainStack.Screen>
                <MainStack.Screen name="DetailNoteBook">{props => <DetailNoteBook {...props} />}</MainStack.Screen>
                <MainStack.Screen name="QRCode">{props => <QRCode {...props} />}</MainStack.Screen>
                <MainStack.Screen name="PageServed">{props => <PageServed {...props} />}</MainStack.Screen>
                <MainStack.Screen name="SelectProduct">{props => <SelectProduct {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Main">{props => <Main {...props} />}</MainStack.Screen>
                <MainStack.Screen name="ChangeTable">{props => <ChangeTable {...props} />}</MainStack.Screen>
                <MainStack.Screen name="DetailHistory">{props => <DetailHistory {...props} />}</MainStack.Screen>
                <MainStack.Screen name="PrintWebview">{props => <PrintWebview {...props} />}</MainStack.Screen>
            </MainStack.Navigator>
        </Animated.View>
    );
};