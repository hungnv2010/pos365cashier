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
import RetailToolBar from '../main/retail/retailToolbar';
import Customer from '../customer/Customer';
import ViewPrint, { TYPE_PRINT } from '../more/ViewPrint';
import { Colors } from '../../theme';
import NetInfo from "@react-native-community/netinfo";
const { Print } = NativeModules;

export default (props) => {

  let scanFromOrder = null
  const viewPrintRef = useRef();
  const dispatch = useDispatch();
  const [textSearch, setTextSearch] = useState('')
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

  // useEffect(() => {
  //   if (syncRetail != false) {
  //     clickSyncForRetail()
  //     dispatch({ type: 'SYNCRETAIL', syncRetail: false })
  //   }
  // }, [syncRetail])

  // PRINT_PROVISIONAL

  useEffect(() => {
    const getCurrentBranch = async () => {
      dialogManager.showLoading()
      let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      vendorSession = JSON.parse(vendorSession)
      let currentBranch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
      currentBranch = JSON.parse(currentBranch)
      console.log('getCurrentBranch', currentBranch);
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
    getCurrentBranch()
  }, [])

  useEffect(() => {

    AppState.addEventListener('change', handleChangeState);



    Print.registerPrint("")

    return () => {
      AppState.removeEventListener('change', handleChangeState);
    }
  }, [])

  useEffect(() => {
    const syncDatas = async () => {
      if (isFNB === null) return
      dispatch({ type: 'ALREADY', already: false })
      // await realmStore.deleteAllForFnb()
      if (isFNB === true) {
        const getDataNewOrders = async () => {
          let result = await dataManager.initComfirmOrder()
          console.log('getDataNewOrders', result);
          if (result != null) {
            if (result.newOrders && result.newOrders != null)
              viewPrintRef.current.printKitchenRef(JSON.stringify(result.newOrders))
            if (result.listRoom && result.listRoom != null)
              dataManager.updateFromOrder(result.listRoom)
          }
        }

        scanFromOrder = setInterval(() => {
          getDataNewOrders()
        }, 15000);
        await realmStore.deleteAllForFnb()
        await dataManager.syncAllDatas()
      } else {
        await realmStore.deleteAllForRetail()
        await dataManager.syncAllDatasForRetail()
      }
      dispatch({ type: 'ALREADY', already: true })
      dialogManager.hiddenLoading()
    }
    syncDatas()

    return () => {
      if (scanFromOrder) clearInterval(scanFromOrder)
    }
  }, [isFNB])


  const handleChangeState = (newState) => {
    if (newState === "active") {

    }
  }

  const clickRightIcon = async () => {
    NetInfo.fetch().then(async state => {
      if (!(state.isConnected == true && state.isInternetReachable == true)) {
        dialogManager.showPopupOneButton(I18n.t('loi_ket_noi_mang'), I18n.t('thong_bao'), () => {
          dialogManager.destroy();
        }, null, null, I18n.t('dong'))
        return;
      } else {
        dialogManager.showLoading()
        dispatch({ type: 'ALREADY', already: false })
        await realmStore.deleteAllForFnb()
        await dataManager.syncAllDatas()
        dispatch({ type: 'ALREADY', already: true })
        dialogManager.hiddenLoading()
      }
    });
    // dialogManager.showLoading()
    // dispatch({ type: 'ALREADY', already: false })
    // await realmStore.deleteAllForFnb()
    // await dataManager.syncAllDatas()
    // dispatch({ type: 'ALREADY', already: true })
    // dialogManager.hiddenLoading()
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
                title={I18n.t('thu_ngan')}
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


