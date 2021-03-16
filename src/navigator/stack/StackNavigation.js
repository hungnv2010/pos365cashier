import React, { useState, useEffect, createRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Animated from 'react-native-reanimated';
import Login from '../../screens/login/LoginScreen';
import ServedForTablet from '../../screens/served/servedForTablet/ServedForTablet';
import DrawerNavigation from '../drawer/DrawerNavigation'
import OverView from '../../screens/overView/overView'
import PrintHtml from '../../screens/more/printHtml/PrintHtml'
import Main from '../../screens/main/Main';
import QRCode from '../../screens/QRCode/QRCode';
import NoteBook from '../../screens/noteBook/NoteBook';
import DetailNoteBook from '../../screens/noteBook/DetailNoteBook';
import { Topping, PageServed, SelectProduct } from '../../screens/served/servedForPhone/index'
import PrintWebview from '../../screens/more/PrintWebview';
import DetailHistory from '../../screens/history/DetailHistory'
import ChangeTable from '../../screens/changeTable/Main';
import RoomList from '../../screens/room/RoomList'
import RoomCategory from '../../screens/room/RoomCategory'
import RoomDetail from '../../screens/room/RoomDetail'
import CashFlow from '../../screens/cashflow/CashFlow'
import InvoiceDetail from '../../screens/invoice/invoiceDetail';
import Payment from '../../screens/payment/Payment'
import PointVoucher from '../../screens/payment/pointVoucher'
import SearchVoucher from '../../screens/payment/SearchVoucher'
import InvoiceDetailForPhone from '../../screens/invoice/invoiceDetailForPhone';
import { ScreenList } from '../../common/ScreenList';
import Customer from '../../screens/customer/Customer';
import CustomerDetailForPhone from '../../screens/customer/CustomerDetailForPhone';
import Settings from '../../screens/settings/Settings';
import VNPayPaymentSetting from '../../screens/settings/VNPAYPaymentSetting';
import CommodityWaiting from '../../screens/main/retail/commodityWaiting'
import RoomHistory from '../../screens/roomHistory/RoomHistory'
import RoomHistoryDetailForPhone from '../../screens/roomHistory/RoomHistoryDetailForPhone';

import RetailSelectProduct from '../../screens/main/retail/retailForPhone/retailSelectProducts'
import MainRetail from '../../screens/main/retail/MainRetail'
import Pricebook from '../../screens/served/Pricebook';
import SplitTable from '../../screens/splitTable/SplitTable'
import OrderOffline from '../../screens/orderOffline/OrderOffline'
import ProductDetail from '../../screens/products/ProductDetail'

import PaymentPendingList from '../../screens/orderManagement/paymentPending/PaymentPendingList';
import DetailPaymentPending from '../../screens/orderManagement/paymentPending/DetailPaymentPending';
import Invoice from '../../screens/invoice/invoice';

const MainStack = createStackNavigator();


export default (props) => {

    return (
        <Animated.View style={{ flex: 1 }}>
            <MainStack.Navigator
                headerMode="none">
                <MainStack.Screen name={ScreenList.Login}>{props => <Login {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Home}>{props => <DrawerNavigation {...props} screenOptions={{ headerLeft: null }} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.ServedForTablet}>{props => <ServedForTablet {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.PrintHtml}>{props => <PrintHtml {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Topping}>{props => <Topping {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.NoteBook}>{props => <NoteBook {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.DetailNoteBook}>{props => <DetailNoteBook {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.QRCode}>{props => <QRCode {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.OverView}>{props => <OverView {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.PageServed}>{props => <PageServed {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.SelectProduct}>{props => <SelectProduct {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Main}>{props => <Main {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.ChangeTable}>{props => <ChangeTable {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.DetailHistory}>{props => <DetailHistory {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.PrintWebview}>{props => <PrintWebview {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.RoomList}>{props => <RoomList {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.RoomCategory}>{props => <RoomCategory {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.RoomDetail}>{props => <RoomDetail {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.CashFlow}>{props => <CashFlow {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.InvoiceDetail}>{props => <InvoiceDetail {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Payment}>{props => <Payment {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Customer}>{props => <Customer {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.CustomerDetailForPhone}>{props => <CustomerDetailForPhone {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.InvoiceDetailForPhone}>{props => <InvoiceDetailForPhone {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.PointVoucher}>{props => <PointVoucher {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.SearchVoucher}>{props => <SearchVoucher {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Settings}>{props => <Settings />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.VNPayPaymentSetting}>{props => <VNPayPaymentSetting />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.RoomHistory}>{props => <RoomHistory {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.RoomHistoryDetailForPhone}>{props => <RoomHistoryDetailForPhone {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.CommodityWaiting}>{props => <CommodityWaiting {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.RetailSelectProduct}>{props => <RetailSelectProduct {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.MainRetail}>{props => <MainRetail {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.SplitTable}>{props => <SplitTable {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.PriceBook}>{props => <Pricebook {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.OrderOffline}>{props => <OrderOffline {...props} />}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Vouchers}>{props => <Vouchers {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Product}>{props=> <Product {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.ProductDetail}>{props=> <ProductDetail {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.PaymentPendingList}>{props=> <PaymentPendingList {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.DetailPaymentPending}>{props=> <DetailPaymentPending {...props}/>}</MainStack.Screen>
                <MainStack.Screen name={ScreenList.Invoice}>{props=> <Invoice {...props}/>}</MainStack.Screen>
            </MainStack.Navigator>
        </Animated.View>
    );
};