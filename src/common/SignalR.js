import signalr from 'react-native-signalr';
import store from "../store/configureStore";
const TYPE_NOTIFY = 'notify';
const TYPE_SALE_HUB = 'SaleHub';
import { Subject } from 'rxjs';
import realmStore from '../data/realm/RealmStore'
import { decodeBase64, encodeBase64 } from './Base64'
import I18n from '../common/language/i18n'
import dialogManager from '../components/dialog/DialogManager';
import NetInfo from "@react-native-community/netinfo";
import { HTTPService } from '../data/services/HttpService';
import { ApiPath } from '../data/services/ApiPath';

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

    reconnect() {
        console.log('reconnect');
        this.killSignalR()
        this.startSignalR(this.syncData.bind(this))
    }

    async syncData() {
        dialogManager.showLoading()
        let svFromSv = await new HTTPService().setPath(ApiPath.SERVER_EVENT, false).GET()
        //let listDifferentFromSv = []
        if (svFromSv && svFromSv.length > 0) {
            await realmStore.insertServerEvents(svFromSv).subscribe((res) => {
                if (!res.result) {
                    let serverEvent = JSON.parse(JSON.stringify(res.serverEvent))
                    serverEvent.isSend = true
                    realmStore.insertServerEvent(serverEvent)
                }
            })
        }
        // console.log('listDifferentFromSv', listDifferentFromSv);
        // if (listDifferentFromSv.length > 0) {
        //     // listDifferentFromSv.forEach(item => { item.isSend = true })
        //     // await realmStore.insertServerEvents(listDifferentFromSv).subscribe(res => { })
        //     for (let index = 0; index < listDifferentFromSv.length; index++) {
        //         let serverEvent = listDifferentFromSv[index]
        //         signalRManager.sendMessageServerEventNow(serverEvent)
        //     }
        // }
        dialogManager.hiddenLoading()
    }


    startSignalR(callback = () => { }) {
        this.connectionHub.start()
            .done(() => {
                // alert('Now connected, connection ID=' + this.connectionHub.id);
                this.isStartSignalR = true;
                isError = false
                callback()
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

    sendMessageServerEventNow = (serverEvent, callback = () => { }) => {
        console.log('sendMessageServerEventNow serverEvent ');
        delete serverEvent.Timestamp
        try {
            serverEvent.JsonContent = encodeBase64(serverEvent.JsonContent)
            serverEvent.Compress = true
        } catch (error) {
            serverEvent.Compress = false
        }
        this.sendMessage(serverEvent, callback)
    }

    async onReceiveServerEvent(serverEvent) {
        console.log("onReceiveServerEvent ");
        // if (serverEvent.Version == version) return
        // version = serverEvent.Version
        if (serverEvent && serverEvent.Compress) {
            serverEvent.JsonContent = decodeBase64(serverEvent.JsonContent || "")
            serverEvent.Compress = false
        }
        await realmStore.insertServerEvent(serverEvent, true)
    }

    sendMessage = (message, callback = () => { }, type = 'SynchronizationOrder') => {
        if (this.isStartSignalR) {
            this.proxy.invoke(type, message)
                .done((response) => {
                    console.log('sendMessage done', response)
                    callback()
                })
                .fail((error) => {
                    console.warn('sendMessage fail ', error)
                    // dialogManager.showPopupOneButton(I18n.t("khong_the_ket_noi_den_may_chu_don_hang_cua_quy_khach_duoc_luu_vao_offline"))
                });
        } else {
            console.log("settimeout");
            console.log("Opps!", "Cannot connect to server")

        }
    }

}

const signalRManager = new SignalRManager()

export default signalRManager;