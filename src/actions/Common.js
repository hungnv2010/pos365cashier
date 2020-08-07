import React, { Component, Platform } from 'react';
import {
  setFileLuuDuLieu, getFileDuLieuString
} from "../data/fileStore/FileStorage";
import { Constant } from "../common/Constant";
import DeviceInfo from 'react-native-device-info';


export const saveDeviceInfoToStore = data => dispatch => {
  saveDeviceInfoToFile(data);
  return dispatch({
    type: "SAVE_DEVICES_INFO",
    data: data
  });
};

// Status Login
export const updateStatusLogin = (isLogin) => {
  return {
    type: "SAVE_STATE_LOGIN",
    isLogin
  }
}

// Show message
export const sendMessage = (message) => {
  return {
    type: "SEND_MESSENGER",
    message
  }
}

export const saveNotificationCount = (listNotification) => {
  let notificationCount = listNotification.filter(notification => !notification.seen).length;
  return {
    type: "SAVE_NOTIFICATION_COUNT",
    notificationCount
  }
};

export const saveNotification = (listNotification) => {
  setFileLuuDuLieu(Constant.KEY_SAVE_NOTIFICATION, JSON.stringify(listNotification), true);
  let notificationCount = listNotification.filter(notification => !notification.seen).length;
  return {
    type: "SAVE_NOTIFICATION_COUNT",
    notificationCount
  }
};



export const saveCurrentBranch = (currentBranch) => {
  return {
    type: "CURRENT_BRANCH_ID",
    currentBranch
  }
};

export const setTabIndex = (tabIndex) => {
  return {
    type: "TAB_INDEX",
    tabIndex
  }
};

export const saveSwitchScreen = (switchScreen, Id) => {
  console.log("saveSwitchScreen", switchScreen);
  return {
    type: "SAVE_SWITCH_SCREEN",
    switchScreen,
    Id
  }
}

export const saveDeviceInfoToFile = data => {
  setFileLuuDuLieu(Constant.KEY_SAVE_DEVICE_INFO, JSON.stringify(data), false);
};

export function isIphoneXorAbove() {
  // console.log("deviceID",DeviceInfo.getDeviceId());
  let isDeviceshasFaceID = ["iPhone10,3", "iPhone10,6", "iPhone11,2", "iPhone11,4", "iPhone11,6", "iPhone11,8"];
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    isDeviceshasFaceID.includes(DeviceInfo.getDeviceId())
  );
}


