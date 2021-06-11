import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text, ActivityIndicator, NativeModules } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import Order from './order/Order';
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import signalRManager from '../../common/SignalR';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import store from '../../store/configureStore';
import { useDispatch, useSelector } from 'react-redux';
import realmStore from '../../data/realm/RealmStore';
import MainRetail from './retail/MainRetail';
import { useFocusEffect } from '@react-navigation/native';
import ViewPrint, { TYPE_PRINT } from '../more/ViewPrint';
import { Colors } from '../../theme';
import NetInfo from "@react-native-community/netinfo";
const { Print } = NativeModules;
import RetailCustomerOrderForPhone from './retail/retailForPhone/retailCustomerOrderForPhone';

export default (props) => {

  const scanFromOrder = useRef(null)
  const scanPaymentStatus = useRef(null)
  const viewPrintRef = useRef();
  const dispatch = useDispatch();
  const [textSearch, setTextSearch] = useState('')
  const [autoPrintKitchen, setAutoPrintKitchen] = useState(false)
  const [permission, setPermission] = useState(true)
  const [itemPer, setItemPer] = useState()
  const { listPrint, isFNB, printProvisional, printReturnProduct, appState, deviceType, allPer } = useSelector(state => {
    return state.Common
  })


  useEffect(() => {
    if (listPrint != "") {
      console.log("useEffect ===== listPrint ", listPrint);
      viewPrintRef.current.printKitchenRef(listPrint)
      dispatch({ type: 'LIST_PRINT', listPrint: "" })
    }
  }, [listPrint])

  useEffect(() => {
    if (printReturnProduct != "") {
      console.log("useEffect ===== printReturnProduct ", printReturnProduct);
      viewPrintRef.current.printKitchenRef(printReturnProduct, TYPE_PRINT.RETURN_PRODUCT)
      dispatch({ type: 'PRINT_RETURN_PRODUCT', printReturnProduct: "" })
    }
  }, [printReturnProduct])

  useEffect(() => {
    if (printProvisional != "") {
      console.log("useEffect ===== printProvisional ", printProvisional);
      viewPrintRef.current.printProvisionalRef(printProvisional.jsonContent, printProvisional.provisional, printProvisional.imgQr && printProvisional.imgQr != '' ? printProvisional.imgQr : "")
      dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: "" })
    }
  }, [printProvisional])

  useFocusEffect(
    React.useCallback(() => {
      const getSettingObj = async () => {
        let settingObject = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        settingObject = JSON.parse(settingObject)
        console.log('settingObject == ', settingObject);
        if (settingObject) {
          console.log('settingObject', settingObject);
          setAutoPrintKitchen(settingObject.tu_dong_in_bao_bep)
        }
      }
      getSettingObj()
    }, [])
  );

  useEffect(() => {
    console.log('mainScreen props', props);
    const getStoreInfo = async () => {
      dialogManager.showLoading()
      let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      vendorSession = JSON.parse(vendorSession)
      let currentBranch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
      currentBranch = JSON.parse(currentBranch)
      let lastBranch = await getFileDuLieuString(Constant.LAST_BRANCH, true);
      lastBranch = lastBranch ? JSON.parse(lastBranch) : { Id: null }
      let privileges = await getFileDuLieuString(Constant.PRIVILEGES, true)
      console.log('privileges', privileges);
      privileges = privileges ? JSON.parse(privileges) : []

      if (vendorSession) {
        if (currentBranch && currentBranch.FieldId) {
          console.log("current Branch",currentBranch);
          if (currentBranch.FieldId == 3 || currentBranch.FieldId == 11) {
            let state = store.getState()
            signalRManager.init({ ...vendorSession, SessionId: state.Common.info.SessionId })
            dispatch({ type: 'IS_FNB', isFNB: true })
          } else {
            dispatch({ type: 'IS_FNB', isFNB: false })
          }
        } else {
          if (vendorSession.CurrentRetailer && (vendorSession.CurrentRetailer.FieldId == 3 || vendorSession.CurrentRetailer.FieldId == 11)) {
            let state = store.getState()
            signalRManager.init({ ...vendorSession, SessionId: state.Common.info.SessionId })
            dispatch({ type: 'IS_FNB', isFNB: true })
          } else {
            dispatch({ type: 'IS_FNB', isFNB: false })
          }
        }
      }

      let permission = privileges.filter(itm => itm.id == 'Order')
      if (permission.length > 0){
       setPermission(permission[0].expanded)
       setItemPer(permission[0])
      }
    }
    getStoreInfo()
    Print.registerPrint("")
  }, [])

  useEffect(() => {
    const syncDatas = async () => {
      if (isFNB === null) return
      dispatch({ type: 'ALREADY', already: false })
      console.log("isFNBBBBBB");
      let state = await NetInfo.fetch()
      if (state.isConnected == true && state.isInternetReachable == true) {
        if (isFNB === true) {
          await dataManager.syncServerEvent()
          // await realmStore.deleteAllForFnb(false)
          await dataManager.syncAllDatas()
        }
        if (isFNB === false) {
          // await realmStore.deleteAllForRetail()
          await dataManager.syncAllDatasForRetail()
        }
      }

      dispatch({ type: 'ALREADY', already: true })
      dialogManager.hiddenLoading()
    }
    syncDatas()


  }, [isFNB])


  useEffect(() => {
    if (autoPrintKitchen && isFNB && appState == 'active') {
      scanFromOrder.current = setInterval(() => {
        getDataNewOrders()
      }, 15000);
    }
    return () => {
      console.log('scanFromOrder', scanFromOrder.current);
      if (scanFromOrder.current) {
        clearInterval(scanFromOrder.current)
      }
    }
  }, [isFNB, autoPrintKitchen, appState])

  useEffect(() => {
    if (appState == 'active') {
      scanPaymentStatus.current = setInterval(() => {
        getPaymentStatus()
      }, 15000);
    }
    return () => {
      if (scanPaymentStatus.current) {
        clearInterval(scanPaymentStatus.current)
      }
    }
  }, [appState])

  const getDataNewOrders = async () => {
    let result = await dataManager.initComfirmOrder()
    console.log('getDataNewOrders', result);
    if (result != null) {
      viewPrintRef.current.printDataNewOrdersRef(result.newOrders != null ? JSON.stringify(result.newOrders) : null, result.listOrdersReturn != null ? JSON.stringify(result.listOrdersReturn) : null)
      if (result.listRoom && result.listRoom != null)
        dataManager.updateFromOrder(result.listRoom)
    }
  }
  const getPaymentStatus = async () => {
    let result = await dataManager.getPaymentStatus()
    console.log('getPaymentStatus', result);
  }


  const onClickSearch = (text) => {
    setTextSearch(text)
  }

  const clickSyncForRetail = async () => {
    NetInfo.fetch().then(async state => {
      if (!(state.isConnected == true && state.isInternetReachable == true)) {
        dialogManager.showPopupOneButton(I18n.t('loi_ket_noi_mang'), I18n.t('thong_bao'), () => {
          dialogManager.destroy();
        }, null, null, I18n.t('dong'))
        return;
      } else {
        dialogManager.showLoading()
        dispatch({ type: 'ALREADY', already: false })
        await realmStore.deleteAllForRetail()
        await dataManager.syncAllDatasForRetail()
        dispatch({ type: 'ALREADY', already: true })
        dialogManager.hiddenLoading()
      }
    });

  }


  return (
    <View style={{ flex: 1 }}>
      <ViewPrint
        ref={viewPrintRef}
      />
      {
        isFNB === null ?
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" style={{}} color={Colors.colorchinh} />
          </View>
          :
          isFNB === true ?
            <>
              <MainToolBar
                navigation={props.navigation}
                title={I18n.t('man_hinh_thu_ngan')}
                rightIcon="md-search"
                outPutTextSearch={onClickSearch}
              />
              {
                permission || allPer.IsAdmin ?
                  <Order {...props} textSearch={textSearch} itemPer={itemPer} />
                  :
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={deviceType == Constant.TABLET ? { fontSize: 20 } : {}}>{I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay')}</Text>
                  </View>
              }
            </>
            :
            deviceType == Constant.TABLET ?
              <MainRetail
                {...props}
                syncForRetail={clickSyncForRetail} />
              :
              <RetailCustomerOrderForPhone
                {...props}
                syncForRetail={clickSyncForRetail} />

      }
    </View>
  );
};


