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
const { Print } = NativeModules;

export default (props) => {

  let scan = null
  const viewPrintRef = useRef();
  const dispatch = useDispatch();
  const { listPrint, isFNB } = useSelector(state => {
    return state.Common
  })


  useEffect(() => {
    if (listPrint != "") {
      viewPrintRef.current.printKitchenRef(listPrint)
      dispatch({ type: 'LIST_PRINT', listPrint: "" })
    }
  }, [listPrint])

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
      await realmStore.deleteAllForFnb()
      if (isFNB === true) {
        const getDataNewOrders = async () => {
          let newOrders = await dataManager.initComfirmOrder()
          console.log('getDataNewOrders', newOrders);

          if (newOrders != null)
            viewPrintRef.current.printKitchenRef(newOrders)

        }

        scan = setInterval(() => {
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
      if (scan) clearInterval(scan)
    }
  }, [isFNB])


  const handleChangeState = (newState) => {
    if (newState === "active") {

    }
  }

  const clickRightIcon = async () => {
    dialogManager.showLoading()
    dispatch({ type: 'ALREADY', already: false })
    await realmStore.deleteAll()
    await dataManager.syncAllDatas()
    dispatch({ type: 'ALREADY', already: true })
    dialogManager.hiddenLoading()
  }

  const clickSyncForRetail = async () => {
    dialogManager.showLoading()
    dispatch({ type: 'ALREADY', already: false })
    await realmStore.deleteAllForRetail()
    await dataManager.syncAllDatasForRetail()
    dispatch({ type: 'ALREADY', already: true })
    dialogManager.hiddenLoading()
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
                rightIcon="refresh"
                clickRightIcon={() => clickRightIcon()}
              />
              <Order {...props} />
            </>
            :
            <MainRetail
              {...props}
              syncForRetail={clickSyncForRetail} />

      }
    </View>
  );
};


