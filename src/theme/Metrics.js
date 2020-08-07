import {Dimensions, Platform} from 'react-native'
import Colors from './Colors'

const { width, height } = Dimensions.get('window')
// Dimensions.set()

// Used via Metrics.baseMargin
const metrics = {
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalHeight:350,
  marginHorizontal: 10,
  marginVertical: 10,
  section: 25,
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallMargin: 5,
  doubleSection: 50,
  horizontalLineHeight: 1,
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
  navBarHeight: (Platform.OS === 'ios') ? 68 : 54,
  heightToolBar: Platform.OS === 'ios' ? 50 : 60,
  buttonRadius: 4,
  icons: {
    tiny: 15,
    small: 20,
    medium: 30,
    large: 45,
    xl: 50
  },
  images: {
    small: 20,
    medium: 40,
    large: 60,
    logo: 200
  },

  statusbarPaddingTop: Platform.OS === "ios" ? 20 : 0,
  heightHeaderMain: 220,
  // heightToolBar: Platform.OS === 'ios' ? 50 : 60,

  padding: {
    verytiny: 2.5,
    tiny: 5,
    small: 10,
    medium: 15,
    large: 25,
    none: 0,
  },
  margin:{
    verytiny: 2.5,
    tiny: 5,
    small: 10,
    medium: 15,
    large: 25,
    none: 0,
  },

  mainButtonSize: 50,
  mainInputSize: 50,
  mainSelectSize: 50,
  mainVertical: 5,


}

export default metrics
