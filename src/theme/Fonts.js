import { Dimensions, PixelRatio, Platform } from "react-native";
import { DefaultTheme } from 'react-native-paper'
const scale = Dimensions.get("window").width / 375;

const pixelRatio = PixelRatio.get();
const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;


// function normalize(size) {
//   return Math.round(scale * size);
// }


// const scale = Dimensions.get("window").width / 320;

// const normalize = (size) =>  {
//   const newSize = size * scale 
//   if (Platform.OS === 'ios') {
//     return Math.round(PixelRatio.roundToNearestPixel(newSize))
//   } else {
//     return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1
//   }
// }

// const normalize = (size) => {
//   if (pixelRatio === 1) {
//     //mdpi Android devices
//   } else if (pixelRatio === 1.5) {
//     //hdpi Android devices
//   } else if (pixelRatio === 2) {
//     //xhdpi Android devices
//     // iPhone 4, 4S
//     // iPhone 5, 5C, 5S
//     // iPhone 6, 7, 8
//     // iPhone XR
//   } else if (pixelRatio === 3) {
//     // iPhone 6 Plus, 7 Plus, 8 Plus
//     // iPhone X, XS, XS Max
//     // Pixel, Pixel 2
//     // xxhdpi Android devices
//   } else if (pixelRatio === 3.5) {
//     // xxxhdpi Android devices
//     // Nexus 6
//     // Pixel XL, Pixel 2 XL

//   }

// }

const normalize = size => {
  if (pixelRatio === 2) {
    // iphone 5s and older Androids
    if (Platform.OS == 'android' && deviceWidth < 360) {
      return size * 0.95;
    }
    if (Platform.OS == 'ios' && deviceWidth < 360) {
      return size * 0.95;
    }
    // iphone 5
    if (deviceHeight < 667) {
      return size;
      // iphone 6-6s
    } else if (deviceHeight >= 667 && deviceHeight <= 735) {
      return size * 1.15;
    }
    // older phablets
    return size * 1.25;
  }
  if (pixelRatio === 3) {
    // catch Android font scaling on small machines
    // where pixel ratio / font scale ratio => 3:3
    if (deviceWidth <= 360) {
      return size;
    }
    // Catch other weird android width sizings
    if (deviceHeight < 667) {
      return size * 1.15;
      // catch in-between size Androids and scale font up
      // a tad but not too much
    }
    if (deviceHeight >= 667 && deviceHeight <= 735) {
      return size * 1.2;
    }
    // catch larger devices
    // ie iphone 6s plus / 7 plus / mi note 等等
    return size * 1.2;
  }
  if (pixelRatio === 3.5) {
    // catch Android font scaling on small machines
    // where pixel ratio / font scale ratio => 3:3
    if (deviceWidth <= 360) {
      return size;
      // Catch other smaller android height sizings
    }
    if (deviceHeight < 667) {
      return size * 1.2;
      // catch in-between size Androids and scale font up
      // a tad but not too much
    }
    if (deviceHeight >= 667 && deviceHeight <= 735) {
      return size * 1.2;
    }
    // catch larger phablet devices
    return size * 1.25;
  }
  // if older device ie pixelRatio !== 2 || 3 || 3.5
  return size;
};





const type = {
  base: "Avenir-Book",
  bold: "Avenir-Black",
  emphasis: "HelveticaNeue-Italic",


};

const size = {
  cosieunho: normalize(8),
  // cosieunhohon: normalize(10),
  conho: normalize(12),
  // conhohon: normalize(13),
  // covuanho: normalize(14),
  // covuanhohon: normalize(15),
  covua: normalize(16),
  // covuahon: normalize(18),
  colon: normalize(20),
  cosieulon: normalize(24),

  // cosieunho: normalize(8),
  // cosieunhohon: normalize(10),
  // conho: normalize(12),
  // conhohon: normalize(13),
  // covuanho: normalize(14),
  // covuanhohon: normalize(15),
  // covua: normalize(16),
  // covuahon: normalize(18),
  // colon: normalize(20),
  // colonhon: normalize(24),
  // main size
  mainSize: normalize(13),
  mainButtonSize: normalize(14),
  mainLabelBox: normalize(12),
  mainFunc: normalize(Platform.OS == 'ios' ? 13 : 12.5),
  mainFuncNew: normalize(Platform.OS == 'ios' ? 13 : 12.5),
  mainTitle: normalize(16),
};

const style = {
  regular: DefaultTheme.fonts.regular,
  medium: DefaultTheme.fonts.medium,
  light: DefaultTheme.fonts.light,
  thin: DefaultTheme.fonts.thin,

  // main style
  main: DefaultTheme.fonts.regular,

  mainButton: DefaultTheme.fonts.medium
};

export default {
  type,
  size,
  style
};