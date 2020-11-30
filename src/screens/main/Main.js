import React, { useEffect, useState, useRef, createRef, useLayoutEffect } from 'react';
import { View, AppState, Text } from 'react-native';
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
import MainRetail from './retail/Main';
import RetailToolBar from '../main/retail/retailToolbar';
import Customer from '../customer/Customer';
import ViewPrint, { TYPE_PRINT } from '../more/ViewPrint';

export default (props) => {

  const [isFNB, setIsFNB] = useState(false)
  const [value, setValue] = useState('');

  const viewPrintRef = useRef();
  const dispatch = useDispatch();

  useSelector(state => {
    console.log("useSelector Main state ", state);

    if(state.Common.listPrint != ""){
      viewPrintRef.current.printKitchenRef(state.Common.listPrint)
      dispatch({ type: 'LIST_PRINT', listPrint: "" })
    }

  });
  // dispatch({ type: 'LIST_PRINT', listPrint: data })
  // const listPrint = useSelector(state => {
  //   console.log("useSelector Main listPrint ", state);
  //   return state.Common.listPrint;
  // });

  useEffect(() => {
    const getVendorSession = async () => {
      dialogManager.showLoading()
      let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      console.log('getVendorSession data ====', JSON.parse(data));
      data = JSON.parse(data);
      if (data) {
        if (data.CurrentRetailer && (data.CurrentRetailer.FieldId == 3 || data.CurrentRetailer.FieldId == 11)) {
          let state = store.getState();
          signalRManager.init({ ...data, SessionId: state.Common.info.SessionId }, true)
          setIsFNB(true)
          dispatch({ type: 'IS_FNB', isFNB: true })
        } else {
          setIsFNB(false)
          dispatch({ type: 'IS_FNB', isFNB: false })
        }

      }
      dialogManager.hiddenLoading()
    }
    getVendorSession()
  }, [])

  useEffect(() => {

    AppState.addEventListener('change', handleChangeState);

    const syncAllDatas = async () => {
      dispatch({ type: 'ALREADY', already: false })

      if (props.params && props.params.index) {
        dialogManager.showLoading()
        await realmStore.deleteAll()
        await dataManager.syncAllDatas()
          .then(() => {
            dispatch({ type: 'ALREADY', already: true })
          })
          .catch((e) => {
            dispatch({ type: 'ALREADY', already: true })
            console.log(e);
          })
        dialogManager.hiddenLoading()
      } else {
        dialogManager.showLoading()
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

    }
    syncAllDatas()

    const getDataNewOrders = async () => {
      let newOrders = await dataManager.initComfirmOrder()
      console.log('getDataNewOrders', newOrders);

      if (newOrders != null)
        viewPrintRef.current.printKitchenRef(newOrders)

    }

    const scan = setInterval(() => {
      getDataNewOrders()
    }, 15000);

    return () => {
      AppState.removeEventListener('change', handleChangeState);
      clearInterval(scan)
    }
  }, [])


  const handleChangeState = (newState) => {
    if (newState === "active") {

    }
  }

  const clickRightIcon = async () => {
    dispatch({ type: 'ALREADY', already: false })
    dialogManager.showLoading()
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

  const outputTextSearch = (text) => {
    console.log('outputTextSearch text', text);
    setValue(text)
  }

  return (
    <View style={{ flex: 1 }}>
      <ViewPrint
        ref={viewPrintRef}
      />
      {
        isFNB ?
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
          <>
            <RetailToolBar
              {...props}
              outputTextSearch={outputTextSearch} />
            <MainRetail
              {...props}
              value={value} />
          </>
      }
    </View>
  );
};


