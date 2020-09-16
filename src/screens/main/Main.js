import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, AppState } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import Order from './order/Order';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import signalRManager from '../../common/SignalR';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import store from '../../store/configureStore';
import { useDispatch } from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import signalr from 'react-native-signalr';
import { Subject } from 'rxjs';
import { decodeBase64 } from '../../common/Base64';
import realmStore from '../../data/realm/RealmStore';

export default (props) => {

  const dispatch = useDispatch();

  useEffect(() => {

    AppState.addEventListener('change', handleChangeState);

    const getData = async () => {
      let data = await getFileDuLieuString(Constant.HISTORY_ORDER, true);
      if (data) {
        console.log("HISTORY_ORDER === ", data);
        data = JSON.parse(data);
        dispatch({ type: 'HISTORY_ORDER', historyOrder: data })
      }
    }
    getData()

    const getVendorSession = async () => {
      let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      console.log('getVendorSession data ====', JSON.parse(data));
      data = JSON.parse(data);
      if (data) {
        console.log('this.info data.BID ', data.BID);
        let state = store.getState();
        signalRManager.init({ ...data, SessionId: state.Common.info.SessionId }, true)
      }
      let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
      if (!branch && data.Branchs.length > 0) {
        setFileLuuDuLieu(Constant.CURRENT_BRANCH, JSON.stringify(data.Branchs[0]));
      }
    }
    getVendorSession()


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

    return () => {
      AppState.removeEventListener('change', handleChangeState);
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

  return (
    <View style={{ flex: 1 }}>
      <MainToolBar
        navigation={props.navigation}
        title={I18n.t('phong_ban')}
        rightIcon="refresh"
        clickRightIcon={clickRightIcon}
      />
      <Order {...props}></Order>
    </View>
  );
};
