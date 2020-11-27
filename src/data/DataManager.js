import { HTTPService } from "./services/HttpService";
import { ApiPath } from "./services/ApiPath";
import realmStore, { SchemaName } from "./realm/RealmStore"
import { getFileDuLieuString, setFileLuuDuLieu } from "../data/fileStore/FileStorage";
import { Subject } from 'rxjs';
import moment from "moment";
import signalRManager from "../common/SignalR";
import { momentToDateUTC, momentToStringDateLocal, groupBy, randomUUID } from "../common/Utils";
import { Constant } from "../common/Constant";
class DataManager {
    constructor() {
        this.subjectUpdateServerEvent = new Subject()
        this.subjectUpdateServerEvent.debounceTime(300)
            .map(serverEvent => {
                return serverEvent
            })
            .subscribe(async (serverEvent) => {
                await realmStore.insertServerEvent(serverEvent)
                signalRManager.sendMessageServerEvent(serverEvent)
            })
    }

    initComfirmOrder = async () => {
        try {
            let intNewOrder = await new HTTPService().setPath(ApiPath.WAIT_FOR_COMFIRMATION).GET()
            let changeTableComfirm = await new HTTPService().setPath(ApiPath.CHANGE_TABLE_COMFIRM).GET()
            if (intNewOrder == 0 && changeTableComfirm.length == 0) {
                return Promise.resolve([])
            } else {
                if (intNewOrder > 0) {
                    let newOrders = await new HTTPService().setPath(ApiPath.WAIT_FOR_COMFIRMATION_ALL).GET()
                    let listRoom = []
                    let listOrders = []
                    console.log('newOrders', newOrders);

                    for (const newOrder of newOrders) {
                        let exist = false
                        let rowKey = `${newOrder.RoomId}_${newOrder.Position}`;
                        let products = await realmStore.queryProducts()
                        let productItem = products.filtered(`Id == '${newOrder.ProductId}'`)
                        productItem = JSON.parse(JSON.stringify(productItem))[0];
                        productItem = { ...productItem, ...newOrder, Processed: newOrder.Quantity }
                        console.log('productItem', productItem);
                        listOrders.push({ ...productItem })
                        for (const item of listRoom) {
                            if (item.rowKey == rowKey) {
                                exist = true
                                item.products.push({ ...productItem })
                            }
                        }
                        if (!exist) {
                            listRoom.push({ rowKey, products: [{ ...productItem }], RoomId: newOrder.RoomId, Position: newOrder.Position })
                        }
                    }


                    for (const item of listRoom) {
                        let serverEvent = await realmStore.queryServerEvents()
                        let serverEventByRowKey = serverEvent.filtered(`RowKey == '${item.rowKey}'`)
                        console.log('serverEventByRowKey', serverEventByRowKey, JSON.stringify(serverEventByRowKey));
                        serverEventByRowKey = JSON.stringify(serverEventByRowKey) != '{}' ? JSON.parse(JSON.stringify(serverEventByRowKey))[0]
                            : await this.createSeverEvent(item.RoomId, item.Position)
                        serverEventByRowKey.JsonContent = serverEventByRowKey.JsonContent ? JSON.parse(serverEventByRowKey.JsonContent)
                            : this.createJsonContent(item.RoomId, item.Position, moment(), item.products)
                        if (serverEventByRowKey.JsonContent.OrderDetails && serverEventByRowKey.JsonContent.OrderDetails.length > 0) {
                            item.products.forEach(elm => {
                                if ((elm.SplitForSalesOrder || (elm.ProductType == 2 && elm.IsTimer))) {
                                    serverEventByRowKey.JsonContent.OrderDetails.unshift({ ...elm })
                                } else {
                                    serverEventByRowKey.JsonContent.OrderDetails.forEach(order => {
                                        if (order.Id == elm.Id) {
                                            order.Quantity += elm.Quantity
                                            order.Processed = order.Quantity
                                        }
                                    })
                                }
                            })
                        } else {
                            serverEventByRowKey.JsonContent.OrderDetails = [...item.products]
                        }
                        serverEventByRowKey.Version += 1
                        this.calculatateJsonContent(serverEventByRowKey.JsonContent)
                        console.log('serverEventByRowKey.JsonContent', serverEventByRowKey.JsonContent);
                        serverEventByRowKey.JsonContent = JSON.stringify(serverEventByRowKey.JsonContent)
                        this.updateServerEventNow(serverEventByRowKey, true)
                    }
                    return Promise.resolve(this.getDataPrintCook(listOrders))
                }

                if (changeTableComfirm.length > 0) {
                    changeTableComfirm.forEach(item => {
                        const { FromRoomId, FromPos, ToRoomId, ToPos } = item
                        this.changeTable(FromRoomId, FromPos, ToRoomId, ToPos)
                    })
                    return Promise.resolve([])
                }
            }

        } catch (error) {
            console.log('initComfirmOrder error', error);
            return Promise.resolve([])
        }
    }


    getDataPrintCook = (newOrders) => {
        let listResult = []
        let secondPrinter = []
        let print3 = []
        let print4 = []
        let print5 = []
        newOrders.forEach((elm, idx) => {
            if (!elm.Printer || elm.Printer == '') {
                elm.Printer = Constant.PRINT_KITCHEN_DEFAULT
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
        console.log('printCook listResultGroupBy', JSON.stringify(listResultGroupBy));
        return listResultGroupBy;
    }

    //get information (From FileStore)
    selectVendorSession = async () => {
        return JSON.parse(await getFileDuLieuString(Constant.VENDOR_SESSION, true));
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
        if (value) {
            realmStore.insertOrdersOffline(value)
        }
    }

    syncQRCode = async (value) => {
        console.log("syncQRCode value ", value);
        if (value) {
            realmStore.insertQRCode(value)
        }
    }

    syncPriceBook = async () => {
        let res = await new HTTPService().setPath(ApiPath.SYNC_PRICE_BOOK).GET()
        if (res.results && res.results.length > 0) {
            res.results.unshift({Name: "Giá niêm yết", Id: 0})
            await realmStore.insertDatas(SchemaName.PRICE_BOOK, res.results)
        }    
    }

    syncAllDatas = async () => {
        await this.syncProduct(),
            await this.syncTopping(),
            await this.syncServerEvent(),
            await this.syncRooms(),
            await this.syncPartner(),
            await this.syncCategories(),
            await this.syncPromotion(),
            await this.syncPriceBook()
    }

    syncAllDatasForRetail = async () => {
        await this.syncProduct(),
            // await this.syncTopping(),
            // await this.syncServerEvent(),
            await this.syncRooms(),
            await this.syncPartner(),
            await this.syncCategories(),
            await this.syncPromotion(),
            await this.syncPriceBook()
    }


    //calculator and send ServerEvent
    updateServerEvent = (serverEvent) => {
        this.subjectUpdateServerEvent.next(serverEvent)
    }

    updateServerEventNow = async (serverEvent, FromServer = false) => {
        await realmStore.insertServerEvent(serverEvent, FromServer)
        signalRManager.sendMessageServerEvent(serverEvent)
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
        let totalWithVAT = totalProducts + (JsonContent.VAT ? JsonContent.VAT : 0)
        JsonContent.Total = totalWithVAT
        JsonContent.AmountReceived = totalWithVAT
        if (!JsonContent.ActiveDate || JsonContent.ActiveDate == "")
            JsonContent.ActiveDate = moment()
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

    changeTable = async (oldRoomId, oldPosition, newRoomId, newPosition) => {
        console.log("changeTable ", oldRoomId, oldPosition, newRoomId, newPosition);
        let serverEvents = await realmStore.queryServerEvents()

        let oldServerEvent = serverEvents.filtered(`RowKey == '${oldRoomId}_${oldPosition}'`)
        let newServerEvent = serverEvents.filtered(`RowKey == '${newRoomId}_${newPosition}'`)

        oldServerEvent = (JSON.stringify(oldServerEvent) != '{}') ? JSON.parse(JSON.stringify(oldServerEvent))[0]
            : await this.createSeverEvent(oldRoomId, oldPosition)
        oldServerEvent.JsonContent = oldServerEvent.JsonContent ? JSON.parse(oldServerEvent.JsonContent) : {}
        if (!oldServerEvent.JsonContent.OrderDetails) oldServerEvent.JsonContent.OrderDetails = []

        newServerEvent = (JSON.stringify(newServerEvent) != '{}') ? JSON.parse(JSON.stringify(newServerEvent))[0]
            : await this.createSeverEvent(newRoomId, newPosition)
        if (!newServerEvent.JsonContent) {
            newServerEvent.JsonContent =
                this.createJsonContent(newRoomId, newPosition, momentToDateUTC(moment()), oldServerEvent.JsonContent.OrderDetails)
        } else {
            newServerEvent.JsonContent = JSON.parse(newServerEvent.JsonContent)
            let OrderDetails = newServerEvent.JsonContent.OrderDetails ?
                [...newServerEvent.JsonContent.OrderDetails, ...oldServerEvent.JsonContent.OrderDetails]
                : oldServerEvent.JsonContent.OrderDetails
            newServerEvent.JsonContent.OrderDetails = [...OrderDetails]
        }

        oldServerEvent.Version += 1
        oldServerEvent.JsonContent = JSON.stringify(this.removeJsonContent(oldServerEvent.JsonContent))
        newServerEvent.Version += 1
        this.calculatateJsonContent(newServerEvent.JsonContent)
        newServerEvent.JsonContent = JSON.stringify(newServerEvent.JsonContent)
        await this.updateServerEventNow(oldServerEvent, true)
        await this.updateServerEventNow(newServerEvent, true)

    }

    createSeverEvent = async (RoomId, Position) => {
        let vendorSession = await this.selectVendorSession()
        let PartitionKey = `${vendorSession.CurrentBranchId}_${vendorSession.CurrentUser.RetailerId}`
        let RowKey = `${RoomId}_${Position}`
        return {
            Version: 1,
            RoomId: RoomId,
            Position: Position,
            PartitionKey: PartitionKey,
            RowKey: RowKey,
            Timestamp: moment().format("YYYY-MM-DD'T'HH:mm:ssZ"),
            ETag: `W/\"datetime'${momentToStringDateLocal(moment())}'\"`
        }
    }

    createJsonContent = (RoomId, Position, ActiveDate, OrderDetails = []) => {
        return {
            OfflineId: randomUUID(),
            RoomId: RoomId,
            Pos: Position,
            OrderDetails: OrderDetails,
            ActiveDate: ActiveDate
        }
    }

    removeJsonContent = (JsonContent) => {
        return {
            OfflineId: JsonContent.OfflineId, Pos: JsonContent.Pos, RoomName: JsonContent.RoomName, OrderDetails: [],
            Status: 2, NumberOfGuests: 1, SoldById: JsonContent.SoldById
        }
    }

}

const dataManager = new DataManager();
export default dataManager;

