import { HTTPService } from "./services/HttpService";
import { ApiPath } from "./services/ApiPath";
import realmStore, { SchemaName } from "./realm/RealmStore"
import { getFileDuLieuString, setFileLuuDuLieu } from "../data/fileStore/FileStorage";
import { Subject } from 'rxjs';
import moment from "moment";
import signalRManager from "../common/SignalR";
import { momentToDateUTC, momentToStringDateLocal, momentToDate, groupBy, randomUUID, getTimeFromNow, getDifferenceSeconds, dateToDate, mergeTwoArray } from "../common/Utils";
import { Constant } from "../common/Constant";
import I18n from '../common/language/i18n';
import productManager from './objectManager/ProductManager';
// import { object } from "underscore";
import _, { map, object } from 'underscore';
import dialogManager from "../components/dialog/DialogManager";
class DataManager {
    constructor() {
        this.subjectUpdateServerEvent = new Subject()
        this.subjectUpdateServerEvent.debounceTime(300)
            .subscribe(async (serverEvent) => {
                await realmStore.insertServerEvent(serverEvent)
                signalRManager.sendMessageServerEvent(serverEvent)
                // this.updateServerEventNow(serverEvent, true)
            })
    }

    async checkStockControlWhenSelling(OrderDetails = []) {
        let status = false;
        let vendorSession = await this.selectVendorSession()
        if (vendorSession && vendorSession.Settings.StockControlWhenSelling == true) {
            let listProduct = await realmStore.queryProducts();
            if (OrderDetails.length > 0) {
                OrderDetails.forEach(element => {
                    let product = listProduct.filtered(`Id == ${element.ProductId}`)
                    if (JSON.stringify(product) != '{}') {
                        product = product[0]
                        if (product.OnHand <= 0) {
                            dialogManager.showPopupOneButton(element.Name + " " + I18n.t("khong_du_ton_kho"))
                            status = true;
                            return status;
                        }
                    }
                });
            }
        }
        console.log("checkStockControlWhenSelling status ", status);
        return status;
    }

    checkEndDate(date) {
        let endDate = new Date(date)
        let currentDate = new Date();
        console.log("currentDate endDate ", currentDate, endDate);
        if (endDate.getTime() > currentDate.getTime()) {
            return true;
        }
        return false;
    }

    async addPromotion(list = []) {
        console.log("addPromotion list ", list);
        let promotion = await realmStore.querryPromotion();
        let promotionTmp = promotion
        let listProduct = await realmStore.queryProducts()
        let listNewOrder = list.filter(element => (element.IsPromotion == undefined || (element.IsPromotion == false)))
        let listOldPromotion = list.filter(element => (element.IsPromotion != undefined && (element.IsPromotion == true)))
        var DataGrouper = (function () {
            var has = function (obj, target) {
                return _.any(obj, function (value) {
                    return _.isEqual(value, target);
                });
            };

            var keys = function (data, names) {
                return _.reduce(data, function (memo, item) {
                    var key = _.pick(item, names);
                    if (!has(memo, key)) {
                        memo.push(key);
                    }
                    return memo;
                }, []);
            };

            var group = function (data, names) {
                var stems = keys(data, names);
                return _.map(stems, function (stem) {
                    return {
                        key: stem,
                        vals: _.map(_.where(data, stem), function (item) {
                            return _.omit(item, names);
                        })
                    };
                });
            };

            group.register = function (name, converter) {
                return group[name] = function (data, names) {
                    return _.map(group(data, names), converter);
                };
            };

            return group;
        }());

        DataGrouper.register("sum", function (item) {
            console.log("register item ", item);
            return _.extend({ ...item.vals[0] }, item.key, {
                Quantity: _.reduce(item.vals, function (memo, node) {
                    return memo + Number(node.Quantity);
                }, 0)
            });
        });
        let listGroupByQuantity = DataGrouper.sum(listNewOrder, ["ProductId", "IsLargeUnit"])
        let listPromotion = [];
        let index = 0;
        listGroupByQuantity.forEach(element => {
            promotionTmp.forEach(async (item) => {
                if (item.QuantityCondition > 0 && (element.IsPromotion == undefined || (element.IsPromotion == false)) && element.ProductId == item.ProductId && this.checkEndDate(item.EndDate) && (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition)) {
                    let promotion = listProduct.filtered(`Id == ${item.ProductPromotionId}`)
                    promotion = promotion[0] != undefined ? JSON.parse(JSON.stringify(promotion[0])) : {};
                    if (JSON.stringify(promotion) == '{}') {
                        promotion = JSON.parse(item.Promotion);
                    }
                    let quantity = Math.floor(element.Quantity / item.QuantityCondition) * item.QuantityPromotion
                    promotion.Quantity = quantity
                    if (listOldPromotion.length > 0) {
                        let oldPromotion = listOldPromotion.filter(el => promotion.Id == el.Id)
                        if (oldPromotion.length == 1) {
                            promotion = oldPromotion[0];
                            promotion.FisrtPromotion = false
                            promotion.Quantity = quantity;
                        }
                    }
                    if (index == 0)
                        promotion.FisrtPromotion = true
                    promotion.Price = item.PricePromotion;
                    promotion.IsLargeUnit = item.ProductPromotionIsLargeUnit;
                    promotion.IsPromotion = true;
                    promotion.ProductId = promotion.Id
                    promotion.Description = element.Quantity + " " + element.Name + ` ${I18n.t('khuyen_mai_')} ` + Math.floor(element.Quantity / item.QuantityCondition) * item.QuantityPromotion;
                    listPromotion.push(promotion)
                    index++;
                }
            });
        });
        console.log("addPromotion listPromotion:: ", listPromotion);
        listNewOrder = listNewOrder.concat(listPromotion);
        console.log("addPromotion listNewOrder::::: ", listNewOrder);
        return listNewOrder;
    }

    initComfirmOrder = async () => {
        try {

            let intNewOrder = await new HTTPService().setPath(ApiPath.WAIT_FOR_COMFIRMATION, false).GET()
            let changeTableComfirm = await new HTTPService().setPath(ApiPath.CHANGE_TABLE_COMFIRM, false).GET()
            if (intNewOrder == 0 && (!changeTableComfirm || changeTableComfirm.length == 0)) {
                return Promise.resolve(null)
            } else {
                if (changeTableComfirm.length > 0) {
                    changeTableComfirm.forEach(item => {
                        const { FromRoomId, FromPos, ToRoomId, ToPos } = item
                        this.changeTable(FromRoomId, FromPos, ToRoomId, ToPos)
                    })
                }
                if (intNewOrder > 0) {
                    let newOrders = await new HTTPService().setPath(ApiPath.WAIT_FOR_COMFIRMATION_ALL, false).GET()
                    listOrdersReturn = []
                    let listRoom = []
                    let listOrders = []
                    console.log('newOrders', newOrders);

                    for (const newOrder of newOrders) {
                        let exist = false
                        let rowKey = `${newOrder.RoomId}_${newOrder.Position}`;
                        let products = await realmStore.queryProducts()
                        let productItem = products.filtered(`Id == '${newOrder.ProductId}'`)
                        productItem = JSON.parse(JSON.stringify(productItem))[0];
                        let Price = (newOrder.IsLargeUnit ? productItem.PriceLargeUnit : productItem.UnitPrice) + newOrder.TotalTopping
                        productItem = { ...productItem, ...newOrder, Price: Price }
                        listOrders.push({ ...productItem })
                        for (const item of listRoom) {
                            if (item.rowKey == rowKey) {
                                exist = true
                                item.products.push({ ...productItem })
                            }
                        }
                        if (!exist) {
                            listRoom.push({ rowKey, products: [{ ...productItem }], RoomId: newOrder.RoomId, Position: newOrder.Position, RoomName: newOrder.RoomName })
                        }
                    }
                    let listOrdersReturn = listOrders.filter(item => item.Quantity < 0)
                    listOrders = listOrders.filter(item => item.Quantity > 0)
                    console.log('listRoomlistRoomlistRoom', listRoom);


                    return Promise.resolve({ newOrders: this.getDataPrintCook(listOrders), listOrdersReturn: this.getDataPrintCook(listOrdersReturn), listRoom: listRoom })
                }
                return Promise.resolve(null)


            }

        } catch (error) {
            console.log('initComfirmOrder error', error);
            return Promise.resolve(null)
        }
    }

    updateFromOrder = async (listRoom) => {
        if (listRoom.length == 0) return
        let tittle = []
        for (let index = 0; index < listRoom.length; index++) {
            let listOrder = listRoom[index]
            tittle.push(listOrder.RoomName)
            await this.updateServerFromOrder(listOrder, index)
        }
        dataManager.sentNotification(tittle.join(", "), I18n.t('gio_khach_vao') + moment().format('HH:mm dd/MM'))
    }

    updateServerFromOrder = async (listOrders, index) => {
        let serverEvent = await realmStore.queryServerEvents()
        let serverEventByRowKey = serverEvent.filtered(`RowKey == '${listOrders.rowKey}'`)
        serverEventByRowKey = JSON.stringify(serverEventByRowKey) != '{}' ? JSON.parse(JSON.stringify(serverEventByRowKey))[0]
            : await this.createSeverEvent(listOrders.RoomId, listOrders.Position)
        console.log('serverEventByRowKey', serverEventByRowKey, JSON.parse(serverEventByRowKey.JsonContent));
        listOrders.products.forEach(element => {
            element.Processed = element.Quantity > 0 ? element.Quantity : 0;
        });
        if (serverEventByRowKey.JsonContent != "{}" && JSON.parse(serverEventByRowKey.JsonContent).OrderDetails.length > 0) {
            serverEventByRowKey.JsonContent = JSON.parse(serverEventByRowKey.JsonContent)
            serverEventByRowKey.JsonContent.OrderDetails = mergeTwoArray(listOrders.products, serverEventByRowKey.JsonContent.OrderDetails, true)
        } else {
            serverEventByRowKey.JsonContent = this.createJsonContent(listOrders.RoomId, listOrders.Position, moment(), listOrders.products, listOrders.RoomName)
        }
        serverEventByRowKey.Version += 1
        this.calculatateJsonContent(serverEventByRowKey.JsonContent)
        serverEventByRowKey.JsonContent.OrderDetails.forEach(item => {
            delete item.ProductImages
        })
        serverEventByRowKey.JsonContent = JSON.stringify(serverEventByRowKey.JsonContent)
        delete serverEventByRowKey.Timestamp
        console.log('updateServerFromOrder', serverEventByRowKey, JSON.parse(serverEventByRowKey.JsonContent));
        await realmStore.insertServerEvent(serverEventByRowKey, true)
        signalRManager.sendMessageServerEvent(serverEventByRowKey)
    }

    getDataPrintCook = (newOrders) => {
        if (newOrders.length == 0)
            return null;

        let listResult = []
        let secondPrinter = []
        let print3 = []
        let print4 = []
        let print5 = []

        newOrders.forEach((elm, idx) => {
            let priceConfig = elm.PriceConfig ? JSON.parse(elm.PriceConfig) : null
            if (!elm.Printer || elm.Printer == '') {
                elm.Printer = Constant.PRINT_KITCHEN_DEFAULT
            }
            if (priceConfig) {
                if (priceConfig.SecondPrinter && priceConfig.SecondPrinter != '') {
                    secondPrinter.push({ ...elm, Printer: priceConfig.SecondPrinter })
                }
                if (priceConfig.Printer3 && priceConfig.Printer3 != '') {
                    print3.push({ ...elm, Printer: priceConfig.Printer3 })
                }
                if (priceConfig.Printer4 && priceConfig.Printer4 != '') {
                    print4.push({ ...elm, Printer: priceConfig.Printer4 })
                }
                if (priceConfig.Printer5 && priceConfig.Printer5 != '') {
                    print5.push({ ...elm, Printer: priceConfig.Printer5 })
                }
            }

        })

        // newOrders.forEach((elm, idx) => {
        //     if (!elm.Printer || elm.Printer == '') {
        //         elm.Printer = Constant.PRINT_KITCHEN_DEFAULT
        //     }
        //     if (elm.SecondPrinter && elm.SecondPrinter != '') {
        //         secondPrinter.push({ ...elm, Printer: elm.SecondPrinter })
        //     }
        //     if (elm.Printer3 && elm.Printer3 != '') {
        //         print3.push({ ...elm, Printer: elm.Printer3 })
        //     }
        //     if (elm.Printer4 && elm.Printer4 != '') {
        //         print4.push({ ...elm, Printer: elm.Printer4 })
        //     }
        //     if (elm.Printer5 && elm.Printer5 != '') {
        //         print5.push({ ...elm, Printer: elm.Printer5 })
        //     }
        // })
        console.log("getDataPrintCook secondPrinter ", secondPrinter);
        console.log("getDataPrintCook print3 ", print3);
        console.log("getDataPrintCook print4 ", print4);
        console.log("getDataPrintCook print5 ", print5);
        listResult = [...newOrders, ...secondPrinter, ...print3, ...print4, ...print5]
        let listResultGroupBy = groupBy(listResult, "Printer")
        for (const property in listResultGroupBy) {
            listResultGroupBy[property] = groupBy(listResultGroupBy[property], "RoomName")
        }
        console.log("getDataPrintCook listResultGroupBy ", listResultGroupBy);

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
        let svFromSv = await new HTTPService().setPath(ApiPath.SERVER_EVENT, false).GET()
        let listDifferentFromSv = []
        if (svFromSv && svFromSv.length > 0) {
            await realmStore.insertServerEvents(svFromSv).subscribe((res) => {
                if (!res.result) {
                    let serverEvent = JSON.parse(JSON.stringify(res.serverEvent))
                    console.log('syncServerEvent', serverEvent);
                    serverEvent.isSend = true
                    realmStore.insertServerEvent(serverEvent)
                }
            })
        }
        // console.log('listDifferentFromSv', listDifferentFromSv);
        if (listDifferentFromSv.length > 0) {
            // listDifferentFromSv.forEach(item => { item.isSend = true })
            // await realmStore.insertServerEvents(listDifferentFromSv).subscribe(res => {
            //     console.log('listDifferentFromSv_insertServerEvents', res);
            // })
            for (let index = 0; index < listDifferentFromSv.length; index++) {
                let serverEvent = listDifferentFromSv[index]
                signalRManager.sendMessageServerEventNow(serverEvent)
            }
        }
    }

    syncProduct = async () => {
        let res = await new HTTPService().setPath(ApiPath.SYNC_PRODUCTS, false).GET()

        if (res && res.Data && res.Data.length > 0)
            await realmStore.insertProducts(res.Data)
    }
    syncAllProduct = async () => {
        let res = await new HTTPService().setPath(ApiPath.PRODUCT, false).GET()

        if (res && res.Data && res.Data.length > 0)
            await realmStore.insertProducts(res.Data)
    }

    syncPromotion = async () => {
        let params = { Includes: ['Product', 'Promotion'] }
        let res = await new HTTPService().setPath(ApiPath.PROMOTION, false).GET(params)
        if (res && res.results && res.results.length > 0) {
            realmStore.insertPromotion(res.results)
        }
    }

    syncTopping = async () => {
        let results = await new HTTPService().setPath(ApiPath.SYNC_EXTRAEXT, false).GET()
        if (results && results.length > 0) {
            realmStore.insertTopping(results)
        }
    }

    syncData = async (apiPath, schemaName) => {
        let res = await new HTTPService().setPath(apiPath, false).GET()
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
        let res = await new HTTPService().setPath(ApiPath.SYNC_PRICE_BOOK, false).GET()
        if (res && res.results && res.results.length > 0) {
            await realmStore.insertDatas(SchemaName.PRICE_BOOK, res.results)
        }
    }

    syncAllDatas = async () => {
        await this.syncProduct(),
            await this.syncTopping(),
            // await this.syncServerEvent(),
            await this.syncRooms(),
            await this.syncPartner(),
            await this.syncCategories()
        let vendorSession = await this.selectVendorSession()
        if (vendorSession && vendorSession.CurrentUser && vendorSession.CurrentUser.IsAdmin) {
            console.log();
            await this.syncPromotion(),
                await this.syncPriceBook()

        }
    }

    syncAllDatasForRetail = async () => {
        await this.syncProduct(),
            // await this.syncTopping(),
            // await this.syncServerEvent(),
            // await this.syncRooms(),
            await this.syncPartner(),
            await this.syncCategories()
        let vendorSession = await this.selectVendorSession()
        if (vendorSession && vendorSession.CurrentUser && vendorSession.CurrentUser.IsAdmin) {
            console.log();
            await this.syncPromotion(),
                await this.syncPriceBook()

        }
    }


    //calculator and send ServerEvent
    updateServerEvent = (serverEvent, jsonContent) => {
        let cloneJsoncontent = null
        if (typeof jsonContent === "string") {
            cloneJsoncontent = JSON.parse(jsonContent)
        }
        else {
            cloneJsoncontent = jsonContent
        }
        cloneJsoncontent.OrderDetails.forEach(product => {
            delete product.ProductImages
            if (isNaN(product.Quantity)) {
                product.Quantity = 0;
            }
        });
        serverEvent.JsonContent = JSON.stringify(cloneJsoncontent)
        this.subjectUpdateServerEvent.next(serverEvent)
    }

    updateServerEventNow = async (serverEvent, FromServer = false, isFNB = true) => {
        let cloneJsoncontent = {};
        if (typeof serverEvent.JsonContent === "string") {
            cloneJsoncontent = JSON.parse(serverEvent.JsonContent)
        } else {
            cloneJsoncontent = serverEvent.JsonContent
        }
        cloneJsoncontent.OrderDetails.forEach(product => {
            delete product.ProductImages
            if (isNaN(product.Quantity)) {
                product.Quantity = 0;
            }
        });
        serverEvent.JsonContent = JSON.stringify(cloneJsoncontent)
        await realmStore.insertServerEvent(serverEvent, FromServer)
        if (isFNB) {
            signalRManager.sendMessageServerEvent(serverEvent, FromServer)
        }
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
        let totalProductsWithout = this.totalProducts(JsonContent.OrderDetails.filter(item => !item.IsPercentageOfTotalOrder))
        JsonContent.OrderDetails.forEach(item => {
            if (item.IsPercentageOfTotalOrder) item.Price = item.BasePrice * totalProductsWithout / 100
        })
        let totalProducts = this.totalProducts(JsonContent.OrderDetails)

        let discount = 0
        if (JsonContent.DiscountValue) {
            discount = JsonContent.DiscountValue
        }
        if (JsonContent.DiscountRatio) {
            discount = totalProducts * JsonContent.DiscountRatio / 100
        }
        let totalVat = (totalProducts - discount) * JsonContent.VATRates / 100
        let totalWithVAT = totalProducts + totalVat
        discount = totalWithVAT - discount > 0 ? discount : totalWithVAT
        JsonContent.VAT = totalVat
        JsonContent.Total = totalWithVAT - discount
        JsonContent.AmountReceived = JsonContent.Total
        JsonContent.Discount = discount
        JsonContent.DiscountValue = discount
        if (!JsonContent.ActiveDate || JsonContent.ActiveDate == "")
            JsonContent.ActiveDate = moment()
        else if (!JsonContent.OrderDetails || JsonContent.OrderDetails.length == 0)
            JsonContent.ActiveDate = ""
    }

    calculateProductTime = (listProduct) => {
        let reload = listProduct.filter(product => product.IsTimer && !product.StopTimer).length > 0
        if (reload) {
            listProduct.forEach(product => {
                if (product.IsTimer && !product.StopTimer) {
                    let momentNow = moment().utc()
                    product.Checkout = momentToDate(momentNow)
                    productManager.getProductTimePrice(product)
                }
            })
        }

        return reload
    }

    paymentSetServerEvent = (serverEvent, newJsonContent, updateNow = false) => {
        if (!serverEvent.JsonContent) return
        // serverEvent.JsonContent = JSON.stringify(newJsonContent)
        if (updateNow)
            serverEvent.Version += 10
        else
            serverEvent.Version += 1
    }

    totalProducts = (products) => {
        console.log('totalProducts', products);
        return products.reduce((total, product) => total + (product.Price * product.Quantity), 0)
    }

    totalDiscountProducts = (products) => {
        let totalDiscount = 0
        products.forEach(product => {
            let discount = product.Discount > 0 ? product.Discount : 0
            // totalDiscount = product.Percent ? (product.Price * discount / 100) * product.Quantity : discount * product.Quantity
            totalDiscount += discount * product.Quantity
        })
        return totalDiscount
    }

    sentNotification = (Title, Body) => {
        let params = {
            Title: Title,
            Body: Body,
        }
        new HTTPService().setPath(ApiPath.SENT, false).POST(params).then(sent => {
            console.log("sentNotification sent ", sent);
            if (sent) {

            }
        })
    }

    deleteRow(table, value) {
        realmStore.deleteRow(table, value)
    }

    changeTable = async (oldRoomId, oldPosition, newRoomId, newPosition) => {
        console.log("changeTable ", oldRoomId, oldPosition, newRoomId, newPosition);
        let serverEvents = await realmStore.queryServerEvents()

        let oldServerEvent = serverEvents.filtered(`RowKey == '${oldRoomId}_${oldPosition}'`)
        let newServerEvent = serverEvents.filtered(`RowKey == '${newRoomId}_${newPosition}'`)

        oldServerEvent = (JSON.stringify(oldServerEvent) != '{}') ? JSON.parse(JSON.stringify(oldServerEvent))[0]
            : await this.createSeverEvent(oldRoomId, oldPosition)
        oldServerEvent.JsonContent = oldServerEvent.JsonContent ? JSON.parse(oldServerEvent.JsonContent) : this.createJsonContent(oldRoomId, oldPosition, moment())
        if (!oldServerEvent.JsonContent.OrderDetails) oldServerEvent.JsonContent.OrderDetails = []

        newServerEvent = (JSON.stringify(newServerEvent) != '{}') ? JSON.parse(JSON.stringify(newServerEvent))[0]
            : await this.createSeverEvent(newRoomId, newPosition)
        newServerEvent.JsonContent = newServerEvent.JsonContent ? JSON.parse(newServerEvent.JsonContent) : this.createJsonContent(newRoomId, newPosition, moment())
        if (!newServerEvent.JsonContent.OrderDetails) newServerEvent.JsonContent.OrderDetails = []
        let OrderDetails = newServerEvent.JsonContent.OrderDetails ? mergeTwoArray(newServerEvent.JsonContent.OrderDetails, oldServerEvent.JsonContent.OrderDetails) : oldServerEvent.JsonContent.OrderDetails
        newServerEvent.JsonContent.OrderDetails = [...OrderDetails]
        newServerEvent.JsonContent.Partner = oldServerEvent.JsonContent.Partner ? oldServerEvent.JsonContent.Partner : null
        newServerEvent.JsonContent.PartnerId = oldServerEvent.JsonContent.PartnerId ? oldServerEvent.JsonContent.PartnerId : null
        newServerEvent.JsonContent.PriceBookId = oldServerEvent.JsonContent.PriceBookId ? oldServerEvent.JsonContent.PriceBookId : null
        newServerEvent.JsonContent.PriceBook = oldServerEvent.JsonContent.PriceBook ? oldServerEvent.JsonContent.PriceBook : null
        newServerEvent.JsonContent.ActiveDate = oldServerEvent.JsonContent.ActiveDate ? oldServerEvent.JsonContent.ActiveDate : ""

        oldServerEvent.Version += 1
        oldServerEvent.JsonContent = this.createJsonContent(oldRoomId, oldPosition, moment())
        newServerEvent.Version += 1
        this.calculatateJsonContent(newServerEvent.JsonContent)
        await this.updateServerEventNow(oldServerEvent, true)
        await this.updateServerEventNow(newServerEvent, true)

    }

    splitTable = async (OldRoomId, OldPosition, NewRoomId, NewPosition, ListOldSplit, ListNewSplit) => {
        console.log("splitTable ", OldRoomId, OldPosition, NewRoomId, NewPosition, ListOldSplit, ListNewSplit);
        let serverEvents = await realmStore.queryServerEvents()

        let oldServerEvent = serverEvents.filtered(`RowKey == '${OldRoomId}_${OldPosition}'`)
        let newServerEvent = serverEvents.filtered(`RowKey == '${NewRoomId}_${NewPosition}'`)

        oldServerEvent = (JSON.stringify(oldServerEvent) != '{}') ? JSON.parse(JSON.stringify(oldServerEvent))[0]
            : await this.createSeverEvent(OldRoomId, OldPosition)
        oldServerEvent.JsonContent = oldServerEvent.JsonContent ? JSON.parse(oldServerEvent.JsonContent) : this.createJsonContent(OldRoomId, oldPosition, moment())
        if (!oldServerEvent.JsonContent.OrderDetails) oldServerEvent.JsonContent.OrderDetails = []

        newServerEvent = (JSON.stringify(newServerEvent) != '{}') ? JSON.parse(JSON.stringify(newServerEvent))[0]
            : await this.createSeverEvent(NewRoomId, NewPosition)
        newServerEvent.JsonContent = newServerEvent.JsonContent ? JSON.parse(newServerEvent.JsonContent) : this.createJsonContent(NewRoomId, NewPosition, moment())
        if (!newServerEvent.JsonContent.OrderDetails) newServerEvent.JsonContent.OrderDetails = []
        let OrderDetails = newServerEvent.JsonContent.OrderDetails ? mergeTwoArray(ListNewSplit, newServerEvent.JsonContent.OrderDetails) : ListNewSplit
        newServerEvent.JsonContent.OrderDetails = [...OrderDetails]


        oldServerEvent.Version += 1
        oldServerEvent.JsonContent.OrderDetails = ListOldSplit
        this.calculatateJsonContent(oldServerEvent.JsonContent)

        newServerEvent.Version += 1
        this.calculatateJsonContent(newServerEvent.JsonContent)
        console.log("splitTable oldServerEvent:: ", oldServerEvent)
        console.log("splitTable newServerEvent:: ", newServerEvent)

        await this.updateServerEventNow(oldServerEvent, true)
        await this.updateServerEventNow(newServerEvent, true)
    }

    createSeverEvent = async (RoomId, Position) => {
        let objectJsonContent = this.createJsonContent(RoomId, Position, moment())
        console.log('createSeverEvent', objectJsonContent);
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
            ETag: `W/\"datetime'${momentToStringDateLocal(moment())}'\"`,
            JsonContent: JSON.stringify(objectJsonContent),
            Compress: false,
            // FromServer: false
        }
    }

    createJsonContent = (RoomId, Position, ActiveDate, OrderDetails = [], RoomName = "") => {
        return {
            OfflineId: randomUUID(),
            Status: 2,
            Discount: 0,
            TotalPayment: 0,
            AmountReceive: 0,
            AmountReceived: 0,
            Total: 0,
            OrderDetails: OrderDetails,
            SoldById: 0,
            ExcessCashType: 0,
            ExcessCash: 0,
            RoomId: RoomId,
            RoomName: RoomName,
            Pos: Position,
            NumberOfGuests: 0,
            SyncStatus: 0,
            VATRates: "",
            DiscountValue: 0,
            Voucher: 0,
            DiscountToView: 0,
            VAT: 0,
            Description: "",
            ActiveDate: ActiveDate,
            Partner: null,
            PartnerId: null,
            OldDebt: 0,
            DiscountRatio: 0,
            VoucherCode: null,
            VoucherId: null,
            Id: 0,
            Code: "",
            initializingTotalPayment: false,
            tmpDeliveryById: null,
            AccountId: null,
            ShippingCost: "0",
            ShippingCostForPartner: 0,
            tmpDeliveryBy: null,
            PurchaseDate: "",
            PriceBookId: null,
            Topping: "",
            PointToValue: 0,
            MoreAttributes: "",
            Printed: false,
            ChannelId: null,
            CardNumber: null,
            tmpLadingCode: "",
            tmpShippingCost: 0
        }
    }

    createJsonContentForRetail = (RoomId, RoomName = "") => {
        return {
            OfflineId: randomUUID(),
            Status: 2,
            Discount: 0,
            TotalPayment: 0,
            AmountReceive: 0,
            AmountReceived: 0,
            Total: 0,
            OrderDetails: [],
            SoldById: 0,
            ExcessCashType: 0,
            ExcessCash: 0,
            RoomId: RoomId,
            RoomName: RoomName,
            Pos: "A",
            NumberOfGuests: 0,
            SyncStatus: 0,
            VATRates: "",
            DiscountValue: 0,
            Voucher: 0,
            DiscountToView: 0,
            VAT: 0,
            Description: "",
            ActiveDate: "",
            Partner: null,
            PartnerId: null,
            OldDebt: 0,
            DiscountRatio: 0,
            VoucherCode: null,
            VoucherId: null,
            Id: 0,
            Code: "",
            initializingTotalPayment: false,
            tmpDeliveryById: null,
            AccountId: null,
            ShippingCost: "0",
            ShippingCostForPartner: 0,
            tmpDeliveryBy: null,
            PurchaseDate: "",
            PriceBookId: null,
            Topping: "",
            PointToValue: 0,
            MoreAttributes: "",
            Printed: false,
            ChannelId: null,
            CardNumber: null,
            tmpLadingCode: "",
            tmpShippingCost: 0
        }
    }



    removeJsonContent = (JsonContent) => {
        return {
            OfflineId: JsonContent.OfflineId, Pos: JsonContent.Pos, RoomName: JsonContent.RoomName, OrderDetails: [],
            Status: 2, NumberOfGuests: 1, SoldById: JsonContent.SoldById
        }
    }

    getPaymentStatus = async () => {
        let QRcode = await realmStore.queryQRCode()
        QRcode = JSON.parse(JSON.stringify(QRcode))
        QRcode = Object.values(QRcode)
        if (!QRcode || QRcode.length == 0) {
            return Promise.resolve(null)
        } else {
            let param = {}
            param.OrderIds = QRcode.map(item => item.Id)

            try {
                let result = await new HTTPService().setPath(ApiPath.MULTI_PAYMENT_STATUS, false).POST(param)
                if (result) {
                    console.log("ApiPath.MULTI_PAYMENT_STATUS result ", result);
                    QRcode.forEach(element => {
                        result.forEach(item => {
                            if (item.Status == true && item.OrderId == element.Id) {
                                element.Status = true;
                            }
                        });
                    });
                    console.log("getPaymentStatus QRcode ", QRcode);
                    dataManager.syncQRCode(QRcode);
                    return Promise.resolve(result)
                }
                else return Promise.resolve(null)
            } catch (err) {
                console.log('getPaymentStatus errr', err);
                Promise.resolve(null)
            }
        }

    }

}

const dataManager = new DataManager();
export default dataManager;