import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text, ActivityIndicator } from 'react-native';
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

export default (props) => {


  const viewPrintRef = useRef();
  const dispatch = useDispatch();

  const { listPrint, isFNB } = useSelector(state => {
    return state.Common
  })

  // useSelector(state => {
  //   console.log("useSelector Main state ", state);

  //   if (state.Common.listPrint != "") {
  //     viewPrintRef.current.printKitchenRef(state.Common.listPrint)
  //     dispatch({ type: 'LIST_PRINT', listPrint: "" })
  //   }

  // });
  // dispatch({ type: 'LIST_PRINT', listPrint: data })
  // const listPrint = useSelector(state => {
  //   console.log("useSelector Main listPrint ", state);
  //   return state.Common.listPrint;
  // });

  useEffect(() => {
    if (listPrint != "") {
      viewPrintRef.current.printKitchenRef(state.Common.listPrint)
      dispatch({ type: 'LIST_PRINT', listPrint: "" })
    }
  }, [listPrint])

  useEffect(() => {
    // const getVendorSession = async () => {
    //   let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
    //   console.log('getVendorSession data ====', JSON.parse(data));
    //   data = JSON.parse(data);
    //   if (data) {
    //     if (data.CurrentRetailer && (data.CurrentRetailer.FieldId == 3 || data.CurrentRetailer.FieldId == 11)) {
    //       let state = store.getState()
    //       signalRManager.init({ ...data, SessionId: state.Common.info.SessionId }, true)
    //       dispatch({ type: 'IS_FNB', isFNB: true })
    //     } else {
    //       dispatch({ type: 'IS_FNB', isFNB: false })
    //     }

    //   }
    // }
    const getCurrentBranch = async () => {
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
          if (data.CurrentRetailer && (data.CurrentRetailer.FieldId == 3 || data.CurrentRetailer.FieldId == 11)) {
            let state = store.getState()
            signalRManager.init({ ...data, SessionId: state.Common.info.SessionId }, true)
            dispatch({ type: 'IS_FNB', isFNB: true })
          } else {
            dispatch({ type: 'IS_FNB', isFNB: false })
            //     }
          }
        }
      }
    }
    getCurrentBranch()
  }, [])

  useEffect(() => {

    AppState.addEventListener('change', handleChangeState);

    const getDataNewOrders = async () => {
      let newOrders = await dataManager.initComfirmOrder()
      console.log('getDataNewOrders', newOrders);

      if (newOrders != null)
        viewPrintRef.current.printKitchenRef(newOrders)

    }

    // const scan = setInterval(() => {
    //   getDataNewOrders()
    // }, 15000);

    return () => {
      AppState.removeEventListener('change', handleChangeState);
      // clearInterval(scan)
    }
  }, [])

  useEffect(() => {
    const syncDatas = async () => {
      dispatch({ type: 'ALREADY', already: null })
      await realmStore.deleteAll()

      if (isFNB === null) {
        return
      } else if (isFNB === true) {
        await syncForFNB()
      } else {
        await syncForRetail()
      }
    }
    syncDatas()
  }, [isFNB])

  const syncForFNB = async () => {
    await dataManager.syncAllDatas()
      .then(() => {
        dispatch({ type: 'ALREADY', already: true })
      })
      .catch((e) => {
        dispatch({ type: 'ALREADY', already: true })
        console.log(e);
      })
  }

  const syncForRetail = async () => {
    await dataManager.syncAllDatasForRetail()
      .then(() => {
        dispatch({ type: 'ALREADY', already: true })
      })
      .catch((e) => {
        dispatch({ type: 'ALREADY', already: true })
        console.log(e);
      })
  }


  const handleChangeState = (newState) => {
    if (newState === "active") {

    }
  }

  const clickRightIcon = async () => {
    dialogManager.showLoading()
    dispatch({ type: 'ALREADY', already: null })
    await dataManager.syncAllDatas()
      .then(() => {
        dispatch({ type: 'ALREADY', already: true })
      })
      .catch((e) => {
        dispatch({ type: 'ALREADY', already: true })
        console.log(e);
      })
    dialogManager.hiddenLoading()
  }


  return (
    <View style={{ flex: 1 }}>
      <ViewPrint
        ref={viewPrintRef}
      />
      {
        isFNB === null ?
          null
          :
          isFNB === true ?
            <>
              <MainToolBar
                navigation={props.navigation}
                title={I18n.t('phong_ban')}
                rightIcon="refresh"
                clickRightIcon={clickRightIcon}
              />
              <Order {...props} />
            </>
            :
            <MainRetail
              {...props}
              syncForRetail={() => {
                dialogManager.showLoading()
                dispatch({ type: 'ALREADY', already: null })
                syncForRetail()
                dialogManager.hiddenLoading()
              }} />

      }
    </View>
  );
};


