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
// let version = 0
export var kiler = false;
export var signalRInfo = "";
export let isError = false;

class SignalRManager {

    constructor() {
        this.isStartSignalR = false;
        this.connectionHub = null
        this.cacheMessage = ""
    }

    killSignalR() {
        this.isStartSignalR = false;
        if (this.connectionHub != null) {
            this.connectionHub.stop();
        }
    }

    init(data) {

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
        this.subjectSend
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

        this.startSignalR();

        this.connectionHub.connectionSlow(() => {
            console.warn('We are currently experiencing difficulties with the connection.')
            // this.reconnect()
            isError = true
        });

        this.connectionHub.error((error) => {
            isError = true
            console.warn("connectionHub error ", error);
        });


    }

    reconnect(syncDown = true) {
        console.log('reconnect');
        this.killSignalR()
        this.startSignalR()
        if (syncDown) {
            this.getAllData()
        } else {
            this.syncFromLocal()
        }
    }

    async syncFromLocal() {
        let allServerEvent = await realmStore.queryServerEvents()
        allServerEvent = JSON.parse(JSON.stringify(allServerEvent))
        for (const sv in allServerEvent) {
            let serverEvent = allServerEvent[sv]
            let jsonContentObj = JSON.parse(serverEvent.JsonContent)
            jsonContentObj.OrderDetails.forEach(product => {
                delete product.ProductImages
                if (isNaN(product.Quantity)) {
                    product.Quantity = 0;
                }
            });
            serverEvent.JsonContent = JSON.stringify(jsonContentObj)
            this.sendMessageServerEventNow(serverEvent)
        }
    }

    startSignalR() {
        this.connectionHub.start()
            .done(() => {
                // alert('Now connected, connection ID=' + this.connectionHub.id);
                this.isStartSignalR = true;
                isError = false
                console.log('this.isStartSignalR', this.isStartSignalR);
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
        store.dispatch({ type: 'ALREADY', already: false })
        NetInfo.fetch().then(async state => {
            if (state.isConnected == true && state.isInternetReachable == true) {
                await realmStore.deleteAllForFnb()
            }
        });
        await dataManager.syncAllDatas()
        store.dispatch({ type: 'ALREADY', already: true })
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