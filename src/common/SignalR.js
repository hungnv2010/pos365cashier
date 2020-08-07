import signalr from 'react-native-signalr';
import store from "../store/configureStore";

const TYPE_NOTIFY = 'notify';
const TYPE_SALE_HUB = 'SaleHub';
import { Subject } from 'rxjs';
import realmStore from '../data/realm/RealmStore'
import { decodeBase64 } from './Base64'
import I18n from '../common/language/i18n'
import dialogManager from '../components/dialog/DialogManager';
import NetInfo from "@react-native-community/netinfo";
import dataManager from '../data/DataManager';

var statusInternet = { currentStatus: false, previousStatus: false };
let version = 0

class SignalRManager {

    constructor() {
        this.isStartSignalR = false;
        // this.isStartHub = false;
    }

    init(data, forceUpdate = false) {
        this.data = data;
        this.info = {
            SessionId: data.SessionId,
            rId: data.RID,
            bId: data.BID
        }

        this.subject = new Subject()
        this.subject.map(serverEvent => {
            // alert('xxxx')
            return serverEvent
        })
            // .distinct(serverEvent => serverEvent.Version)
            .subscribe(serverEvent => this.onReceiveServerEvent(serverEvent))
        const connectionHub = signalr.hubConnection("https://signalr.pos365.vn/signalr", {
            headers: {
                "User-Agent": "vn.pos365.cashierspos365",
                "Cookie": "ss-id=" + this.info.SessionId,
            },
            qs: {
                'rid': this.info.rId, 'bid': this.info.bId
            }
        })

        connectionHub.logging = true
        this.proxy = connectionHub.createHubProxy("saleHub")
        this.proxy.on("Update", (serverEvent) => { this.subject.next(serverEvent) })

        const hub = (status = "") => {
            // if (this.isStartHub == false) {
            //     this.isStartHub = true
            connectionHub.start()
                .done(() => {
                    // alert(status + 'Now connected, connection ID=' + connectionHub.id);
                    this.isStartSignalR = true
                    // this.isStartHub = false
                    if (dialogManager)
                        dialogManager.hiddenLoading();
                })
                .fail(() => {
                    console.log("Failed");
                    this.isStartSignalR = false
                    // this.isStartHub = false
                    if (dialogManager)
                        dialogManager.hiddenLoading()
                })
            // }
        }

        if (forceUpdate == true) {
            hub(1);
        }

        connectionHub.connectionSlow(() => {
            console.log('We are currently experiencing difficulties with the connection.')
            this.init(this.data, true)
        });

        connectionHub.error((error) => {
            const errorMessage = error.message;
            let detailedError = '';
            if (error.source && error.source._response) {
                detailedError = error.source._response;
            }
            if (detailedError === 'An SSL error has occurred and a secure connection to the server cannot be made.') {
                console.log('When using react-native-signalr on ios with http remember to enable http in App Transport Security https://github.com/olofd/react-native-signalr/issues/14')
            }
            // alert('SignalR error: ' + errorMessage, detailedError)
            NetInfo.fetch().then(state => {
                console.log("Connection type", state.type);
                console.log("Is connected?", state.isConnected);
                if (state.isConnected == true) {
                    this.getAllData();
                }
            });
            setTimeout(() => {
                // dialogManager.showLoading()
                // hub(2);
                this.init(this.data, true)
            }, 5000);
        });

        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            statusInternet = { currentStatus: state.isConnected, previousStatus: statusInternet.currentStatus }
            if (statusInternet.currentStatus == true && statusInternet.previousStatus == false) {
                this.getAllData();
                this.init(this.data, true)
            }
        });

        // Unsubscribe
        // unsubscribe();
    }

    async getAllData() {
        dialogManager.showLoading()
        await dataManager.syncAllDatas()
            .then(() => {
            })
            .catch((e) => {
                console.log('syncAllDatas err', e);
            })
        dialogManager.hiddenLoading()
    }

    sendMessageOrder = (message) => {
        console.log('sendMessageOrder message ', message);
        try {
            // this.initSignalR();
            if (this.isStartSignalR) {
                this.proxy.invoke("notify", message)
                    .done((response) => {
                        console.log('sendMessageOrder response ', response);
                        // this.alert = I18n.t('gui_tin_nhan_thanh_cong');
                        dialogManager.showPopupOneButton(I18n.t('gui_tin_nhan_thanh_cong'), I18n.t('thong_bao'))
                    })
                    .fail(() => {
                        // this.alert = I18n.t('gui_tin_nhan_that_bai');
                        dialogManager.showPopupOneButton(I18n.t('gui_tin_nhan_that_bai'), I18n.t('thong_bao'))
                        console.warn('Something went wrong when calling server, it might not be up and running?')
                    });
            } else {
                console.log("settimeout");
                // Alert.alert("Opps!", "Cannot connect to server")
                dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
            }
        } catch (e) {
            // alert("sendMessageOrder error " + JSON.stringify(e));
            // this.init(this.data);
        }
    }

    async onReceiveServerEvent(serverEvent) {
        if (serverEvent.Version == version) return
        // alert("onReceiveServerEvent" , serverEvent);
        version = serverEvent.Version
        if (serverEvent && serverEvent.Compress) {
            serverEvent.JsonContent = decodeBase64(serverEvent.JsonContent || "")
            serverEvent.Compress = false
        }
        await realmStore.insertServerEvent(serverEvent)
    }

    sendMessage = (message, type = TYPE_SALE_HUB) => {
        if (this.isStartSignalR) {
            this.proxy.invoke(type, message)
                .done((response) => {
                    console.log('', response);
                })
                .fail(() => {
                    console.warn('Something went wrong when calling server, it might not be up and running?')
                });
        } else {
            console.log("settimeout");
            Alert.alert("Opps!", "Cannot connect to server")

        }
    }

}

const signalRManager = new SignalRManager()

export default signalRManager;