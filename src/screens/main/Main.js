import React, { useEffect, useState, useRef, createRef } from 'react';
import { View } from 'react-native';
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

export default (props) => {

  const [already, setAlready] = useState(false)

  useEffect(() => {
    const getVendorSession = async () => {
      let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      console.log('getVendorSession data ====', JSON.parse(data));
      if (data) {
        data = JSON.parse(data);
        console.log('this.info data.BID ', data.BID);
        let state = store.getState();
        signalRManager.init({ ...data, SessionId: state.Common.info.SessionId }, true)
      }
    }
    getVendorSession()


    const syncAllDatas = async () => {
      dialogManager.showLoading()
      await dataManager.syncAllDatas()
        .then(() => {
          setAlready(true)
        })
        .catch((e) => {
          setAlready(true)
          console.log(e);
        })
      dialogManager.hiddenLoading()
    }
    syncAllDatas()

  }, [])


  const clickRightIcon = async () => {
    dialogManager.showLoading()
    await dataManager.syncAllDatas()
      .then(() => {
        setAlready(true)
      })
      .catch((e) => {
        setAlready(true)
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
      <Order {...props} already={already}></Order>
    </View>
  );
};
