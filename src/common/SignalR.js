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
import { useRef } from 'react';
import { randomUUID } from './Utils';

var statusInternet = { currentStatus: false, previousStatus: false };
// let version = 0
export var kiler = false;
export var signalRInfo = "";

class SignalRManager {

    constructor() {
        this.isStartSignalR = false;
        this.connectionHub = null
        this.cacheMessage = ""
    }

    killSignalR() {
        if (this.connectionHub != null) {
            this.connectionHub.stop();
        }
    }

    init(data, forceUpdate = false) {

        this.data = data;
        this.info = {
            SessionId: data.SessionId,
            rId: data.RID,
            bId: data.BID
        }
        signalRInfo = this.info;
        this.subjectReceive = new Subject()
        console.log(" subjectReceive === ", this.subjectReceive);

        this.subjectReceive
            // .distinct(serverEvent => serverEvent.Version)
            .subscribe(serverEvent => this.onReceiveServerEvent(serverEvent))

        this.subjectSend = new Subject()
        this.subjectSend.debounceTime(300)
            .subscribe(serverEvent => this.sendMessageServerEventNow(serverEvent))

        this.connectionHub = signalr.hubConnection("https://signalr.pos365.vn/signalr", {
            headers: {
                "User-Agent": "vn.pos365.cashierspos365",
                "Cookie": "ss-id=" + this.info.SessionId,
            },
            qs: {
                'rid': this.info.rId, 'bid': this.info.bId
            }
        })

        this.connectionHub.logging = true
        this.proxy = this.connectionHub.createHubProxy("saleHub")
        this.proxy.on("Update", (serverEvent) => { this.subjectReceive.next(serverEvent) })

        if (forceUpdate == true) {
            this.startSignalR();
        }

        this.connectionHub.connectionSlow(() => {
            console.warn('We are currently experiencing difficulties with the connection.')
            this.init(this.data, true)
        });

        this.connectionHub.error((error) => {
            NetInfo.fetch().then(state => {
                if (state.isConnected == true && state.isInternetReachable == true) {
                    this.getAllData();
                    this.init(this.data, true)
                }
            });
            console.warn("connectionHub error ", error);
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

    startSignalR() {
        this.connectionHub.start()
            .done(() => {
                // alert('Now connected, connection ID=' + this.connectionHub.id);
                this.isStartSignalR = true;
                if (dialogManager)
                    dialogManager.hiddenLoading();
            })
            .fail(() => {
                this.isStartSignalR = false;
                if (dialogManager)
                    dialogManager.hiddenLoading()
            })
    }

    async getAllData() {

        dialogManager.showLoading()
        await dataManager.syncAllDatas()
            .then(() => {
                // store.dispatch({ type: 'ALREADY', already: true })
            })
            .catch((e) => {
                // store.dispatch({ type: 'ALREADY', already: true })
                console.log('syncAllDatas err', e);
            })
        dialogManager.hiddenLoading()
    }

    sendMessageOrder = (message) => {
        console.log('sendMessageOrder message ', message);
        try {
            if (this.isStartSignalR) {
                this.proxy.invoke("notify", message)
                    .done((response) => {
                        console.log('sendMessageOrder response ', response);
                        dialogManager.showPopupOneButton(I18n.t('gui_tin_nhan_thanh_cong'), I18n.t('thong_bao'))
                    })
                    .fail(() => {
                        dialogManager.showPopupOneButton(I18n.t('gui_tin_nhan_that_bai'), I18n.t('thong_bao'))
                        console.warn('Something went wrong when calling server, it might not be up and running?')
                    });
            } else {
                console.log("settimeout");
                dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
            }
        } catch (e) {
            console.warn("sendMessageOrder error " + JSON.stringify(e));
        }
    }

    sendMessageServerEvent = (serverEvent, isNow = false) => {
        console.log('sendMessageServerEvent serverEvent isNow ');
        if (this.cacheMessage == JSON.stringify(serverEvent)) return;
        if (isNow) {
            console.log('sendMessageServerEvent serverEvent isNow true');
            this.sendMessageServerEventNow(serverEvent)
        }
        else {
            console.log('sendMessageServerEvent serverEvent isNow false');
            this.subjectSend.next(serverEvent)
        }
    }

    sendMessageServerEventNow = (serverEvent) => {
        console.log('sendMessageServerEventNow serverEvent ');
        delete serverEvent.Timestamp
        this.sendMessage(serverEvent)
    }

    async onReceiveServerEvent(serverEvent) {
        console.log("onReceiveServerEvent ", serverEvent);
        // if (serverEvent.Version == version) return
        // version = serverEvent.Version
        if (serverEvent && serverEvent.Compress) {
            serverEvent.JsonContent = decodeBase64(serverEvent.JsonContent || "")
            serverEvent.Compress = false
        }
        await realmStore.insertServerEvent(serverEvent, true)
    }

    sendMessage = (message, type = 'SynchronizationOrder') => {
        if (this.isStartSignalR) {
            this.proxy.invoke(type, message)
                .done((response) => {
                    console.log('sendMessage done', response)
                })
                .fail(() => {
                    console.warn('sendMessage fail')
                });
        } else {
            console.log("settimeout");
            console.log("Opps!", "Cannot connect to server")

        }
    }

}

const signalRManager = new SignalRManager()

export default signalRManager;