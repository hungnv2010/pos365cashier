import { HTTPService } from "./services/HttpService";
import { ApiPath } from "./services/ApiPath";
import realmStore, { SchemaName } from "./realm/RealmStore"
import { getFileDuLieuString, setFileLuuDuLieu } from "../data/fileStore/FileStorage";
import { Subject } from 'rxjs';
import moment from "moment";
import signalRManager from "../common/SignalR";
import { momentToDateUTC, groupBy } from "../common/Utils";
import { Constant } from "../common/Constant";
class DataManager {
    constructor() {
        this.subjectUpdateServerEvent = new Subject()
        this.subjectUpdateServerEvent.debounceTime(300)
            .map(serverEvent => {
                return serverEvent
            })
            .subscribe(async (serverEvent) => {
                console.log("subjectUpdateServerEvent serverEvent ", serverEvent);

                await realmStore.insertServerEvent(serverEvent)
                signalRManager.sendMessageServerEvent(serverEvent)
            })
        this.initComfirmOrder()
    }

    initComfirmOrder = () => {
        const scan = setInterval(async () => {
            try {
                let intNewOrder = await new HTTPService().setPath(ApiPath.WAIT_FOR_COMFIRMATION).GET()
                if (intNewOrder && intNewOrder > 0) {
                    // let serverEvent = await realmStore.queryServerEvents()
                    // serverEvent = JSON.parse(JSON.stringify(serverEvent))
                    let newOrders = await new HTTPService().setPath(ApiPath.WAIT_FOR_COMFIRMATION_ALL).GET()

                    this.printCook(newOrders)

                    newOrders.forEach(async (elm, idx) => {
                        let serverEvent = await realmStore.queryServerEvents()
                        serverEvent = serverEvent.filtered(`RowKey == '${elm.RoomId}_${elm.Position}'`)
                        serverEvent = JSON.parse(JSON.stringify(serverEvent))[0]
                        this.mergeServerEvents(serverEvent, elm)
                    })
                    // this.printCook(newOrders)
                    // let newServerEvents = this.mergeServerEvents(serverEvent, newOrders)
                    // console.log('newServerEvents', newServerEvents);
                    // this.updateServerEvent(newServerEvents)
                }
            } catch (error) {
                console.log('initComfirmOrder error', error);
            }
        }, 15000);
    }

    printCook = (newOrders) => {
        let listResult = []
        let secondPrinter = []
        let print3 = []
        let print4 = []
        let print5 = []
        newOrders.forEach((elm, idx) => {
            if (!elm.Printer || elm.Printer == '') {
                elm.Printer = Constant.PRINT_KITCHEN_BARTENDER_DEFAULT
            }
            if (elm.SecondPrinter && elm.SecondPrinter != '') {
                secondPrinter.push({ ...elm, Printer: elm.SecondPrinter })
            }
            if (elm.Printer3 && elm.Printer3 != '') {
                print3.push({ ...elm, Printer: elm.Printer3 })
            }
            if (elm.Printer4 && elm.Printer4 != '') {
                print4.push({ ...elm, Printer: elm.Printer4 })
            }
            if (elm.Printer5 && elm.Printer5 != '') {
                print5.push({ ...elm, Printer: elm.Printer5 })
            }
        })
        listResult = [...newOrders, ...secondPrinter, ...print3, ...print4, ...print5]
        let listResultGroupBy = groupBy(listResult, "Printer")
        for (const property in listResultGroupBy) {
            listResultGroupBy[property] = groupBy(listResultGroupBy[property], "RoomName")
        }
        console.log('printCook listResultGroupBy', listResultGroupBy);
    }

    mergeServerEvents = async (serverEvent, orderItem) => {
        if (!serverEvent.JsonContent) return
        let exist = false;
        let jsonContentObject = JSON.parse(serverEvent.JsonContent)
        jsonContentObject.OrderDetails.forEach(elm => {
            if (elm.ProductId == orderItem.ProductId) {
                exist = true
                elm.Quantity += 1
                elm.Processed = elm.Quantity
            }
        })
        if (!exist) {
            let product = await realmStore.queryProducts()
            product.filtered(`Id == '${orderItem.ProductId}'`)
            console.log('mergeServerEvents', JSON.parse(JSON.stringify(product)));
            jsonContentObject.OrderDetails.push(JSON.parse(JSON.stringify(product)))
        }
        serverEvent.JsonContent = JSON.stringify(jsonContentObject)
        serverEvent.Version += 1
        console.log('mergeServerEvents', serverEvent, orderItem);
        this.updateServerEvent(serverEvent)
    }

    //get information (From FileStore)
    selectVendorSession = async () => {
        return await JSON.parse(getFileDuLieuString(Constant.VENDOR_SESSION, true));
    }

    isRestaurant = async () => {
        let vendorSession = await this.selectVendorSession()
        return vendorSession.CurrentRetailer && (vendorSession.CurrentRetailer.FieldId == 3 || vendorSession.CurrentRetailer.FieldId == 11)
    }

    //Synchoronous
    syncServerEvent = async () => {
        let res = await new HTTPService().setPath(ApiPath.SERVER_EVENT).GET()

        if (res && res.length > 0)
            realmStore.insertServerEvents(res).subscribe((res, serverEvent) => { })
    }

    syncProduct = async () => {
        let res = await new HTTPService().setPath(ApiPath.SYNC_PRODUCTS).GET()

        if (res && res.Data && res.Data.length > 0)
            await realmStore.insertProducts(res.Data)
    }

    syncPromotion = async () => {
        let params = { Includes: ['Product', 'Promotion'] }
        let res = await new HTTPService().setPath(ApiPath.PROMOTION).GET(params)
        if (res && res.results.length > 0) {
            realmStore.insertPromotion(res.results)
        }
    }

    syncTopping = async () => {
        let results = await new HTTPService().setPath(ApiPath.SYNC_EXTRAEXT).GET()
        if (results && results.length > 0) {
            realmStore.insertTopping(results)
        }
    }

    syncData = async (apiPath, schemaName) => {
        let res = await new HTTPService().setPath(apiPath).GET()
        if (res && res.Data && res.Data.length > 0)
            await realmStore.insertDatas(schemaName, res.Data)
    }

    syncRoomsReInsert = async () => {
        console.log("syncAllDatas");
        await this.syncData(ApiPath.SYNC_ROOMS, SchemaName.ROOM),
            await this.syncData(ApiPath.SYNC_ROOM_GROUPS, SchemaName.ROOM_GROUP)
    }

    syncRooms = async () => {
        console.log("syncAllDatas");
        await this.syncData(ApiPath.SYNC_ROOMS, SchemaName.ROOM),
            await this.syncData(ApiPath.SYNC_ROOM_GROUPS, SchemaName.ROOM_GROUP)
    }


    syncCategories = async () => {
        await this.syncData(ApiPath.SYNC_CATEGORIES, SchemaName.CATEGORIES)
    }

    syncPartner = async () => {
        await this.syncData(ApiPath.SYNC_PARTNERS, SchemaName.CUSTOMER)
    }

    syncOrdersOffline = async (value) => {
        console.log("syncOrdersOffline value ", value);
        if (value) {
            realmStore.insertOrdersOffline(value)
        }
    }

    syncAllDatas = async () => {
        await this.syncProduct(),
        await this.syncTopping(),
        await this.syncServerEvent(),
        await this.syncRooms(),
        await this.syncPartner(),
        await this.syncCategories(),
        await this.syncPromotion()
    }

    //calculator and send ServerEvent
    updateServerEvent = (serverEvent) => {
        this.subjectUpdateServerEvent.next(serverEvent)
    }

    calculatateServerEvent = (serverEvent, newOrderDetail) => {
        if (!serverEvent.JsonContent) return
        let jsonContentObject = JSON.parse(serverEvent.JsonContent)
        jsonContentObject.OrderDetails = newOrderDetail
        let totalProducts = this.totalProducts(newOrderDetail)
        let totalWithVAT = totalProducts + jsonContentObject.VAT
        jsonContentObject.Total = totalWithVAT
        jsonContentObject.AmountReceived = totalWithVAT
        if (jsonContentObject.ActiveDate)
            jsonContentObject.ActiveDate = momentToDateUTC(moment())
        else if (!jsonContentObject.OrderDetails || jsonContentObject.OrderDetails.length == 0)
            jsonContentObject.ActiveDate = ""

        serverEvent.JsonContent = JSON.stringify(jsonContentObject)

    }

    calculatateJsonContent = (JsonContent) => {
        let totalProducts = this.totalProducts(JsonContent.OrderDetails)
        let totalWithVAT = totalProducts + JsonContent.VAT  
        JsonContent.Total = totalWithVAT
        JsonContent.AmountReceived = totalWithVAT
        if (JsonContent.ActiveDate)
            JsonContent.ActiveDate = momentToDateUTC(moment())
        else if (!JsonContent.OrderDetails || JsonContent.OrderDetails.length == 0)
            JsonContent.ActiveDate = ""
    }
    
    paymentSetServerEvent = (serverEvent, newJsonContent) => {
        if (!serverEvent.JsonContent) return
        serverEvent.JsonContent = JSON.stringify(newJsonContent)
        serverEvent.Version += 10

    }

    totalProducts = (products) => {
        return products.reduce((total, product) => total + product.Price * product.Quantity, 0)
    }
    sentNotification = (Title, Body) => {
        let params = {
            Title: Title,
            Body: Body,
        }
        let sent = new HTTPService().setPath(ApiPath.SENT).POST(params)
        console.log("sentNotification sent ", sent);
        if (sent) {

        }
    }
}

const dataManager = new DataManager();
export default dataManager;