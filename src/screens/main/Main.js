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

export default (props) => {

  const scanFromOrder = useRef(null)
  const scanPaymentStatus = useRef(null)
  const viewPrintRef = useRef();
  const dispatch = useDispatch();
  const [textSearch, setTextSearch] = useState('')
  const [autoPrintKitchen, setAutoPrintKitchen] = useState(false)
  const { listPrint, isFNB, printProvisional, printReturnProduct, syncRetail } = useSelector(state => {
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
      viewPrintRef.current.printProvisionalRef(printProvisional.jsonContent, printProvisional.provisional)
      dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: "" })
    }
  }, [printProvisional])

  useFocusEffect(
    React.useCallback(() => {
      const getSettingObj = async () => {
        let settingObject = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        settingObject = JSON.parse(settingObject)
        if (settingObject) {
          console.log('settingObject', settingObject);
          setAutoPrintKitchen(settingObject.tu_dong_in_bao_bep)
        }
      }
      getSettingObj()
    }, [])
  );

  useEffect(() => {
    const getStoreInfo = async () => {
      dialogManager.showLoading()
      let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      vendorSession = JSON.parse(vendorSession)
      let currentBranch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
      currentBranch = JSON.parse(currentBranch)
      console.log('getStoreInfo', currentBranch);

      if (vendorSession) {
        if (currentBranch && currentBranch.FieldId) {
          if (currentBranch.FieldId == 3 || currentBranch.FieldId == 11) {
            let state = store.getState()
            signalRManager.init({ ...vendorSession, SessionId: state.Common.info.SessionId }, true)
            dispatch({ type: 'IS_FNB', isFNB: true })
          } else {
            dispatch({ type: 'IS_FNB', isFNB: false })
          }
        } else {
          if (vendorSession.CurrentRetailer && (vendorSession.CurrentRetailer.FieldId == 3 || vendorSession.CurrentRetailer.FieldId == 11)) {
            let state = store.getState()
            signalRManager.init({ ...vendorSession, SessionId: state.Common.info.SessionId }, true)
            dispatch({ type: 'IS_FNB', isFNB: true })
          } else {
            dispatch({ type: 'IS_FNB', isFNB: false })
          }
        }
      }
    }
    getStoreInfo()
  }, [])

  useEffect(() => {

    AppState.addEventListener('change', handleChangeState);

    scanPaymentStatus.current = setInterval(() => {
      getPaymentStatus()
    }, 15000);

    Print.registerPrint("")

    return () => {
      if (scanPaymentStatus.current) {
        clearInterval(scanPaymentStatus.current)
      }
      AppState.removeEventListener('change', handleChangeState);
    }
  }, [])

  useEffect(() => {
    const syncDatas = async () => {
      if (isFNB === null) return
      dispatch({ type: 'ALREADY', already: false })

      NetInfo.fetch().then(async state => {
        if (state.isConnected == true && state.isInternetReachable == true) {
          if (isFNB === true) {
            await realmStore.deleteAllForFnb()
          } else {
            await realmStore.deleteAllForRetail()
          }
        }
      });

      if (isFNB === true) {
        await dataManager.syncAllDatas()

      } else {
        await dataManager.syncAllDatasForRetail()
      }
      dispatch({ type: 'ALREADY', already: true })
      dialogManager.hiddenLoading()
    }
    syncDatas()


  }, [isFNB])

  useEffect(() => {
    if (autoPrintKitchen && isFNB) {
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
  }, [isFNB, autoPrintKitchen])

  const getDataNewOrders = async () => {
    let result = await dataManager.initComfirmOrder()
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


  const handleChangeState = (newState) => {
    if (newState === "active") {

    }
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
              <Order {...props} textSearch={textSearch} />
            </>
            :
            <MainRetail
              {...props}
              syncForRetail={clickSyncForRetail} />

      }
    </View>
  );
};


