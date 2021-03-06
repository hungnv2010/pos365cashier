import React, { useEffect } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from './DrawerContent';
import Animated from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Main from '../../screens/main/Main';
import BottomTabNavigation from '../bottomTab/BottomTabNavigation';

import OverView from '../../screens/overView/overView'
import History from '../../screens/history/History'
import More from '../../screens/more/More'
import RoomCatalog from '../../screens/room/RoomCatalog'
import { ScreenList } from '../../common/ScreenList';
import Invoice from '../../screens/invoice/invoice';
import Settings from '../../screens/settings/Settings';
import VNPayPaymentSetting from '../../screens/settings/VNPAYPaymentSetting'
import RoomHistory from '../../screens/roomHistory/RoomHistory';
import RoomHistoryDetail from '../../screens/roomHistory/RoomHistoryDetailForPhone';
import Vouchers from '../../screens/voucher/Vouchers';
import ProductManager from '../../screens/products/ProductManager';
import OrderManagement from '../../screens/orderManagement/OrderManagement'
import Supplier from '../../screens/supplierManager/SupplierManager';
import EmployeeManager from '../../screens/employeeManager/EmployeeManager';
import ReportManager from '../../screens/reportManager/ReportManager';
import CustomerManage from '../../screens/customerManager/CustomerManage';
import RoomList from '../../screens/room/RoomList';
import Menu from '../../screens/main/Menu';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
const Drawer = createDrawerNavigator();
export default (propsFunc) => {


  return (
    <LinearGradient style={{ flex: 1 }} colors={['#FFAB40', '#FF5722']}>
      <Drawer.Navigator
        drawerStyle={{
          backgroundColor: '#fff',
          width: 300,
        }}
        drawerContent={props => {
          return <Menu {...props} />;
        }}
      >

        <Drawer.Screen name={ScreenList.Home} options={{ title: ScreenList.Home }}>
          {props => <Main  {...props} params={propsFunc.route.state ? propsFunc.route.state : ""} />}
        </Drawer.Screen>

        <Drawer.Screen name={ScreenList.OverView} options={{ title: ScreenList.OverView }}>
          {props => <OverView {...props} />}
        </Drawer.Screen>

        {/* <Drawer.Screen name={ScreenList.RoomList} options={{ title: ScreenList.RoomList }}>
          {props => <RoomList {...props} />}
        </Drawer.Screen> */}
        <Drawer.Screen name={ScreenList.RoomCatalog} options={{ title: ScreenList.RoomCatalog }}>
          {props => <RoomCatalog {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.CustomerManager} options={{ title: ScreenList.CustomerManager }}>
          {props => <CustomerManage {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.ProductManager} options={{ title: ScreenList.ProductManager }}>
          {props => <ProductManager {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.Settings} options={{ title: ScreenList.Settings }}>
          {props => <Settings {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.ReportManager} options={{ title: ScreenList.ReportManager }}>
          {props => <ReportManager {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.SupplierManager} options={{ title: ScreenList.SupplierManager }}>
          {props => <Supplier {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.EmployeeManager} options={{ title: ScreenList.EmployeeManager }}>
          {props => <EmployeeManager {...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.VNPayPaymentSetting} options={{ title: ScreenList.Settings }}>
          {props => <VNPayPaymentSetting{...props} />}
        </Drawer.Screen>

        <Drawer.Screen name={ScreenList.Vouchers} options={{ title: ScreenList.Vouchers }}>
          {props => <Vouchers{...props} />}
        </Drawer.Screen>
        <Drawer.Screen name={ScreenList.OrderManagement} options={{ title: ScreenList.OrderManagement }}>
          {props => <OrderManagement{...props} />}
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
