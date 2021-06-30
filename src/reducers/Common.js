import AsyncStorage from "@react-native-community/async-storage"
// import { persistReducer } from 'redux-persist';
import { AppState } from 'react-native'

const initState = {
	info: {
		defaultLanguage: false,
		lang: 'vi',
		pushId: '',
		SessionId: '',
		Logo: '',
		CurrentName: '',
		CurrentRetailerName: '',
		currentAccount: "",
		notificationCount: 0
	},
	currentBranch: "",
	deviceType: "",
	orientaition: "",
	already: false,
	appState: AppState.currentState,
	historyOrder: [],
	printerObject: {},

	isFNB: null,

	listPrint: "",
	printProvisional: "",
	printReturnProduct: "",
	syncRetail: false,
	allPer:{},
	orderScreen:{},
}

const commonReducer = (state = initState, action = {}) => {
	console.log("commonReducer", action);

	switch (action.type) {
		case 'SAVE_DEVICES_INFO':
			let info = {
				...state.info,
				...action.data
			}
			return { ...state, info: info }

		case "SAVE_STATE_LOGIN":
			return {
				...state,
				isLogin: action.isLogin
			}
		case "SEND_MESSENGER":
			return {
				...state,
				message: action.message
			}
		case "SAVE_NOTIFICATION_COUNT":
			return {
				...state,
				notificationCount: action.notificationCount
			}
		case "SAVE_SWITCH_SCREEN":
			let switchScreen = {
				screen: action.switchScreen,
				Id: action.Id
			}
			return {
				...state,
				switchScreen: switchScreen
			}
		case "CURRENT_BRANCH_ID":
			return {
				...state,
				currentBranch: action.currentBranch
			}
		case "TAB_INDEX":
			return {
				...state,
				tabIndex: action.tabIndex
			}
		case "TYPE_DEVICE":
			return {
				...state,
				deviceType: action.deviceType
			}
		case "ORIENTAITION":
			return {
				...state,
				orientaition: action.orientaition
			}
		case "APP_STATE":
			return {
				...state,
				appState: action.appState
			}
		case "ALREADY":
			return {
				...state,
				already: action.already
			}
		case "SYNCRETAIL":
			return {
				...state,
				syncRetail: action.syncRetail
			}

		case "IS_FNB":
			return {
				...state,
				isFNB: action.isFNB
			}
		case "PRINT_OBJECT":
			return {
				...state,
				printerObject: action.printerObject
			}
		case "LIST_PRINT":
			return {
				...state,
				listPrint: action.listPrint
			}
		case "PRINT_PROVISIONAL":
			return {
				...state,
				printProvisional: action.printProvisional
			}
		case "PRINT_RETURN_PRODUCT":
			return {
				...state,
				printReturnProduct: action.printReturnProduct
			}
		case "PERMISSION":
			return{
				...state,
				allPer: action.allPer
			}
		case "SETTING_ORDER_SCREEN":
			return{
				...state,
				orderScreen: action.orderScreen
			}
		default:
			return state
	}
}


// const persistConfig = {
// 	key: 'auth',
// 	storage: AsyncStorage,
// 	whitelist: []
// };

// const Common = persistReducer(persistConfig, commonReducer)
const Common = commonReducer;


export default Common;