import AsyncStorage from "@react-native-community/async-storage"
// import { persistReducer } from 'redux-persist';


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
	numberOrder: 0,
	already: false,
	historyOrder: []
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
		case "NUMBER_ORDER":
			return {
				...state,
				numberOrder: action.numberOrder
			}
		case "ALREADY":
			return {
				...state,
				already: action.already
			}
		case "HISTORY_ORDER":
			return {
				...state,
				historyOrder: action.historyOrder
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