import React, { PureComponent, useRef } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import I18n from '../../common/language/i18n';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import GDrive from "react-native-google-drive-api-wrapper";
import NetInfo from "@react-native-community/netinfo";
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService } from "../../data/services/HttpService";

export default (props) => {
  const camera = useRef()
  const upLoadPhoto = async (source) => {
    let state = await NetInfo.fetch()
    if (state.isConnected == true && state.isInternetReachable == true) {
      dialogManager.showLoading()
      await new HTTPService().setPath(`api/google/tocken`).GET().then(res => {
        if (res != null) {
          token.current = res.Tocken
          console.log("Token", res.Tocken);
        }
      })
      GDrive.setAccessToken(token.current)
      GDrive.init()

      GDrive.files.createFileMultipart(
        source.base64,
        "'image/jpg'", {
        parents: ["0B0kuvBxLBrKiflFvTW5EUkRkZEg1UEZpSXZaVGIwTjFFeGlJSV9vTG5kbm9NUW5sQ2tiSGc"],
        name: source.fileName
      },
        true)
        .then(
          (response) => response.json()
        ).then((res) => {
          // result data
          console.log(res.id);
          let url = "https://docs.google.com/uc?id=" + `${res.id}` + "&export=view"
          let item = {
            ImageURL: url,
            IsDefault: true,
            ThumbnailUrl: url
          }
          let image = []
          // if (productOl.ProductImages) {
          //     image = JSON.parse(JSON.stringify(productOl.ProductImages))
          // }
          image = [...image, item]
          //setProductOl({ ...productOl, ProductImages: image })
          //setImageUrl(url)
          console.log(image);
          dialogManager.hiddenLoading()

        })
      //setOnShowModal(false)
    } else {
      dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
        dialogManager.destroy();
      }, null, null, I18n.t('dong'))
    }
  }
  const captureImage = async () => {
    //setOnShowModal(false)
    let options = {
      mediaType: 'photo',
      cameraType: 'front',
      includeBase64: true,
      saveToPhotos: true
    };
    await launchCamera(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log(
          'User tapped custom button: ',
          response.customButton
        );
        alert(response.customButton);
      } else {
        let source = response;
        console.log("sourc", source);
        upLoadPhoto(source)
        //setOnShowModal(false)
      }
    });
    dialogManager.hiddenLoading()

  }

  const chooseImage = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      includeBase64: true,
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log(
          'User tapped custom button: ',
          response.customButton
        );
        alert(response.customButton);
      } else {
        let source = response;
        console.log("sourc", source);
        upLoadPhoto(source)
        //setOnShowModal(false)
      }
      dialogManager.hiddenLoading()
    });
  }
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' }}>
      <Text style={{ padding: 10, fontWeight: 'bold', color: colors.colorchinh }}>{I18n.t('chon_anh')}</Text>
      <View style={{ flexDirection: 'column', backgroundColor: '#fff', marginBottom: 20 }}>
        <TouchableOpacity style={styles.styleBtn} onPress={() => { setIsTakePhoto(true), captureImage(), console.log("click capture"); }}>
          {/* <Icon name={isTakePhoto == true ? 'radiobox-marked' : 'radiobox-blank'} size={20} /> */}
          <Text style={{ marginLeft: 10 }}>{I18n.t('chup_moi')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.styleBtn} onPress={() => { setIsTakePhoto(false), chooseImage() }}>
          {/* <Icon name={isTakePhoto == false ? 'radiobox-marked' : 'radiobox-blank'} size={20} /> */}
          <Text style={{ marginLeft: 10 }}>{I18n.t('chon_tu_thu_vien')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )


}
const styles = StyleSheet.create({
});