import React from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from './DrawerContent';
import Animated from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Main from '../../screens/main/Main';
import BottomTabNavigation from '../bottomTab/BottomTabNavigation';

import OrderNow from '../../screens/ordernow/OrderNow'
import History from '../../screens/history/History'
import More from '../../screens/more/More'
import RoomCatalog from '../../screens/room/RoomCatalog'
import { ScreenList } from '../../common/ScreenList';

const Drawer = createDrawerNavigator();
export default () => {
  return (
    <LinearGradient style={{ flex: 1 }} colors={['#FFAB40', '#FF5722']}>
      <Drawer.Navigator
        drawerStyle={{
          backgroundColor: '#fff',
          width: 300,
        }}
        drawerContent={props => {
          return <DrawerContent {...props} />;
        }}
      >
        <Drawer.Screen name={ScreenList.Main} options={{ title: ScreenList.Main }}>
          {props => <Main {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.Home} options={{ title: ScreenList.Home }}>
          {props => <BottomTabNavigation {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.OrderNow} options={{ title: ScreenList.OrderNow }}>
          {props => <OrderNow {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.History} options={{ title: ScreenList.History }}>
          {props => <History {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.More} options={{ title: ScreenList.More }}>
          {props => <More {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.RoomCatalog} options={{ title: ScreenList.RoomCatalog }}>
          {props => <RoomCatalog {...props} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    shadowColor: '#FFF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 5,
    overflow: 'scroll',
    borderWidth: 1,
  },
  drawerStyles: { flex: 1, width: '80%', backgroundColor: 'transparent' },
  drawerItem: { alignItems: 'flex-start', marginVertical: 0 },
  drawerLabel: { color: 'white', marginLeft: 0 },
  avatar: {
    borderRadius: 60,
    marginBottom: 16,
    borderColor: 'white',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
