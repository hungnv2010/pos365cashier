import React, { createRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Animated from 'react-native-reanimated';
import SelectProduct from '../../screens/selectProduct/SelectProduct';
import PageServed from '../../screens/served/pageServed/PageServed';
import Topping from '../../screens/served/Topping';


const MainStack = createStackNavigator();
export const navigationRef = createRef();
export default (props) => {

    return (
        <Animated.View style={{ flex: 1 }}>
            <MainStack.Navigator
                headerMode="none"
            >
                <MainStack.Screen name="SelectProduct">{props => <SelectProduct {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Topping">{props => <Topping {...props} />}</MainStack.Screen>
                <MainStack.Screen name="PageServed">{props => <PageServed {...props} />}</MainStack.Screen>
            </MainStack.Navigator>
        </Animated.View>
    );
};