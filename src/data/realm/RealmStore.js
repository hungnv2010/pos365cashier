const Realm = require('realm');
import { Observable } from 'rxjs';
import { RealmBase } from './RealmBase';
import { change_alias } from '../../common/Utils';

class RealmStore extends RealmBase {

    constructor() {
        return super();

    }

    removeAllListener() {
        realm.removeAllListeners()
    }

    //override
    insertDatas(schema, datas) {
        console.log("insertDatas datas.length ", datas.length);
        return super.insertDatas(databaseOption, schema, datas);
    }

    // insertData(scheme, data) {
    //     console.log("insertData ", datas);
    //     return super.insertData(databaseOption, scheme, data)
    // }

    insertServerEventForRetail = async (newSE) => {
        console.log('insertServerEventForRetail', newSE);
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            realm.create(SchemaName.SERVER_EVENT, newSE, true)
            resolve(newSE)
        }))
    }

    deleteAll = async () => {
        let newSchemaName = { ...SchemaName }
        delete newSchemaName.QR_CODE
        await this.deleteSchema(newSchemaName)
    }

    deleteAllForFnb = async () => {
        let newSchemaName = { ...SchemaName }
        delete newSchemaName.ORDERS_OFFLINE
        delete newSchemaName.QR_CODE
        await this.deleteSchema(newSchemaName)
    }

    deleteAllForRetail = async (islogin = true) => {
        let newSchemaName = { ...SchemaName }
        if (islogin) delete newSchemaName.SERVER_EVENT
        delete newSchemaName.ORDERS_OFFLINE
        delete newSchemaName.QR_CODE
        await this.deleteSchema(newSchemaName)
        // realm.write(() => {
        //     for (const schema in newSchemaName) {
        //         realm.delete(realm.objects(newSchemaName[schema]))
        //     }
        //     return Promise.resolve()
        // })
    }

    deleteRoom = async () => {
        console.log("deleteRoom ");
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let room = realm.objects(SchemaName.ROOM)
            realm.delete(room)
            resolve()
        }))
    }

    deleteSchema = async (listSchema) => {
        let realm = await Realm.open(databaseOption)
        realm.write(() => {
            for (const item in listSchema) {
                let schema = realm.objects(listSchema[item])
                realm.delete(schema)
            }
            Promise.resolve()
        })
    }

    deletePartner = async () => {
        console.log("deletePartnerItem ");
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let partner = realm.objects(SchemaName.CUSTOMER)
            realm.delete(partner)
            resolve()
        }))
    }
    deleteCategory = async () =>{
        console.log("deleteProduct ");
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let category = realm.objects(SchemaName.CATEGORIES)
            realm.delete(category)
            resolve()
        }))
    }
    deleteProduct = async () => {
        console.log("deleteProduct ");
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let product = realm.objects(SchemaName.PRODUCT)
            realm.delete(product)
            resolve()
        }))

    }
    deleteTopping = async () => {
        console.log("deleteTopping ");
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let topping = realm.objects(SchemaName.TOPPING)
            realm.delete(topping)
            resolve()
        }))
    }

    deleteCommodity = async (item) => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let serverEvent = realm.objectForPrimaryKey(SchemaName.SERVER_EVENT, item.RowKey)
            console.log('deleteCommodity serverEvent', serverEvent);
            realm.delete(serverEvent)
            resolve()
        }))
    }

    deleteQRCode = async (id) => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let qrCode = realm.objectForPrimaryKey(SchemaName.QR_CODE, id)
            console.log('deleteQRCode qrCode', qrCode);
            realm.delete(qrCode)
            resolve()
        }))
    }

    //server event
    insertServerEvent = async (newServerEvent, FromServer = false) => {
        console.log("insertServerEvent ==== ", newServerEvent);
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let serverEvent = realm.objectForPrimaryKey(SchemaName.SERVER_EVENT, newServerEvent.RowKey)
            if (serverEvent && serverEvent.Version > newServerEvent.Version) {
                resolve({ result: false, serverEvent: serverEvent })
            } else {
                newServerEvent.FromServer = FromServer
                realm.create(SchemaName.SERVER_EVENT, newServerEvent, true)
                resolve({ result: true, serverEvent: newServerEvent })
            }
        })
        )
    }

    insertServerEvents(newServerEvents) {
        return Observable.create(async (observer) => {
            let realm = await Realm.open(databaseOption)

            realm.write(() => {
                newServerEvents.map(newServerEvent => {
                    let serverEvent = realm.objectForPrimaryKey(SchemaName.SERVER_EVENT, newServerEvent.RowKey)
                    if (serverEvent && serverEvent.Version > newServerEvent.Version) {
                        observer.next({ result: false, serverEvent: serverEvent })
                    } else {
                        realm.create(SchemaName.SERVER_EVENT, newServerEvent, true)
                        observer.next({ result: true, serverEvent: newServerEvent })
                    }
                })
                observer.complete()
            })
        })
    }

    insertPromotion = async (newPromotion) => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            newPromotion.map(newPromo => {
                newPromo.Product = JSON.stringify(newPromo.Product)
                newPromo.Promotion = JSON.stringify(newPromo.Promotion)
                realm.create(SchemaName.PROMOTION, newPromo, true)
            })
            resolve(newPromotion)
        }))
    }

    queryServerEvents = async () => {
        return this.queryAll(databaseOption, SchemaName.SERVER_EVENT)
    }

    //Room
    insertRooms(newRooms) {
        return this.insertDatas(databaseOption, SchemaName.ROOM, newRooms)
    }

    queryRooms() {
        return this.queryAll(databaseOption, SchemaName.ROOM)
    }

    //RoomGroup
    insertRoomGroups(newRoomGroups) {
        return this.insertDatas(databaseOption, SchemaName.ROOM_GROUP, newRoomGroups)
    }

    queryRoomGroups() {
        return this.queryAll(databaseOption, SchemaName.ROOM_GROUP)
    }

    queryCustomer() {
        return this.queryAll(databaseOption, SchemaName.CUSTOMER)
    }

    async deleteRow(table, value) {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            let row = realm.objectForPrimaryKey(table, value);
            console.log("deleteRow row ", row);
            realm.delete(row)
            resolve()
        }))
    }

    //Product
    async insertProducts(newProducts) {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            newProducts.map(product => {
                product.ProductId = product.Id
                product.BasePrice = product.Price;
                product.UnitPrice = product.Price;
                product.NameLatin = change_alias(product.Name)
                product.ProductImages = JSON.stringify(product.ProductImages);
                realm.create(SchemaName.PRODUCT, product, true);
            })
            resolve(newProducts)
        })
        )
    }

    queryProducts() {
        return this.queryAll(databaseOption, SchemaName.PRODUCT)
    }

    //Categories
    insertCategories(newCategories) {
        return this.insertDatas(SchemaName.CATEGORIES, newCategories)
    }

    queryCategories() {
        return this.queryAll(databaseOption, SchemaName.CATEGORIES)
    }

    //Topping
    insertTopping(newTopping) {
        return this.insertDatas(SchemaName.TOPPING, newTopping)
    }

    queryTopping() {
        return this.queryAll(databaseOption, SchemaName.TOPPING)
    }

    querryPromotion() {
        return this.queryAll(databaseOption, SchemaName.PROMOTION)
    }

    queryPricebook() {
        return this.queryAll(databaseOption, SchemaName.PRICE_BOOK)
    }

    //OrdersOffline
    insertOrdersOffline(newOrdersOffline) {
        console.log("insertOrdersOffline newOrdersOffline ", newOrdersOffline);
        return this.insertDatas(SchemaName.ORDERS_OFFLINE, newOrdersOffline)
    }

    queryOrdersOffline = async () => {
        return this.queryAll(databaseOption, SchemaName.ORDERS_OFFLINE)
    }

    //QRCode
    insertQRCode(newQRCode) {
        console.log("insertQRCode newQRCode ", newQRCode);
        return this.insertDatas(SchemaName.QR_CODE, newQRCode)
    }

    queryQRCode = async () => {
        return this.queryAll(databaseOption, SchemaName.QR_CODE)
    }

}

//define schema
export const SchemaName = {
    SERVER_EVENT: "ServerEventSchema",
    ROOM: "Room",
    ROOM_GROUP: "RoomGroup",
    PRODUCT: "Product",
    CATEGORIES: "Categories",
    TOPPING: "Topping",
    CUSTOMER: "Customer",
    PROMOTION: "Promotion",
    ORDERS_OFFLINE: "OrdersOffline",
    QR_CODE: "QRCode",
    PRICE_BOOK: "PriceBook",
}


const PriceBook = {
    name: SchemaName.PRICE_BOOK,
    primaryKey: "Id",
    properties: {
        Id: 'int',
        Name: { type: 'string', default: '' },
        IsActive: { type: 'bool', default: false },
        StartDate: { type: 'string', default: '' },
        EndDate: { type: 'string', default: '' },
    }
}

const QRCode = {
    name: SchemaName.QR_CODE,
    primaryKey: "Id",
    properties: {
        Id: { type: 'int', default: 0 },
        Status: { type: 'bool', default: false },
        JsonContent: { type: 'string', default: '' },
        HostName: { type: 'string', default: '' },
        Messenger: { type: 'string', default: '' },
        Code: { type: 'string', default: '' },
        QRCode: { type: 'string', default: '' },
        BranchId: { type: 'int', default: 0 },
    }
}

const OrdersOffline = {
    name: SchemaName.ORDERS_OFFLINE,
    primaryKey: "Id",
    properties: {
        Id: 'string',
        Orders: 'string',
        ExcessCash: { type: 'int', default: 0 },
        DontSetTime: { type: 'int', default: 0 },
        HostName: { type: 'string', default: '' },
        BranchId: { type: 'int', default: 0 },
        SyncCount: { type: 'int', default: 0 },
    }
}

const CustomerSchema = {
    name: SchemaName.CUSTOMER,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Code: 'string',
        Name: 'string',
        Phone: { type: 'string', default: '' },
        Address: { type: 'string', default: '' },
        Point: { type: 'int', default: 0 },
        Gender: { type: 'int', default: 0 },
        Debt: { type: 'double', default: 0 },
        TotalDebt: { type: 'double', default: 0 },
        // PartnerGroupMembers: { type: 'string', default: '' },
        // LeadOwnerId: { type: 'int', default: 0 },
        Description: { type: 'string', default: '' },
        Dob: { type: 'string', default: '' },
        // BestDiscount: { type: 'double', default: 0 },
    }
}

const ServerEventSchema = {
    name: SchemaName.SERVER_EVENT,
    primaryKey: 'RowKey',
    properties: {
        RoomId: 'int',
        Position: 'string',
        Version: 'int',
        JsonContent: "string",
        Compress: 'bool',
        PartitionKey: 'string',
        RowKey: 'string',
        Timestamp: { type: 'string', default: '' },
        ETag: 'string',
        FromServer: { type: 'bool', default: false }
    }
}

const RoomSchema = {
    name: SchemaName.ROOM,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Name: 'string',
        Position: 'int',
        Description: { type: 'string', default: "" },
        RoomGroupId: { type: 'int', default: 0 },
        Printer: { type: 'string', default: "" },
        ProductId: { type: 'int', default: 0 },
    }
}

const RoomGroupSchema = {
    name: SchemaName.ROOM_GROUP,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Name: 'string'
    }
}

const ProductSchema = {
    name: SchemaName.PRODUCT,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Code: 'string',
        Name: 'string',
        NameLatin: { type: 'string', default: '' },
        AttributesName: { type: 'string', default: '' },
        Price: 'double',
        PriceLargeUnit: 'double',
        OnHand: 'double',
        ProductImages: 'string',
        IsSerialNumberTracking: 'bool',
        IsPercentageOfTotalOrder: 'bool',
        ConversionValue: 'double',
        SplitForSalesOrder: 'bool',
        Printer: { type: 'string', default: '' },
        ProductType: 'int',
        Coefficient: { type: 'double', default: 0.0 },
        BonusPoint: 'double',
        BonusPointForAssistant: 'double',
        BonusPointForAssistant2: 'double',
        BonusPointForAssistant3: 'double',
        PriceConfig: { type: 'string', default: "{}" },
        BlockOfTimeToUseService: 'double',
        IsPriceForBlock: 'bool',
        CategoryId: { type: 'int', default: 0 },
        ProductId: { type: 'int', default: 0 },
        Code2: { type: 'string', default: '' },
        Code3: { type: 'string', default: '' },
        Code4: { type: 'string', default: '' },
        OnlinePrice: { type: 'double', default: 0.0 },
        Unit: { type: 'string', default: '' },
        LargeUnit: { type: 'string', default: '' },
        IsTimer: { type: 'bool', default: false },
        OrderQuickNotes: { type: 'string', default: '' },
        BasePrice: { type: 'double', default: 0.0 },
        Description: { type: 'string', default: '' },
        IsLargeUnit: { type: 'bool', default: false },
        UnitPrice: { type: 'double', default: 0.0 },
        DiscountRatio: { type: 'double', default: 0.0 },
        Checkin: { type: 'string', default: '' },
        Processed: { type: 'double', default: 0.0 },
        labelPrinted: { type: 'double', default: 0.0 },
        Serveby: { type: 'double', default: 0.0 },
        Checkout: { type: 'string', default: '' },
        Topping: { type: 'string', default: "" },
        TotalTopping: { type: 'double', default: 0.0 },
        Discount: { type: 'double', default: 0.0 },
        StopTimer: { type: 'bool', default: false },
        Hidden: { type: 'bool', default: false },
        IsCheckPriceServer: { type: 'bool', default: true },
    }
}

const CategoriesSchema = {
    name: SchemaName.CATEGORIES,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        Name: 'string',
        ParentId: { type: 'int', default: 0 },
    },

}

const ToppingsSchema = {
    name: SchemaName.TOPPING,
    primaryKey: 'Id',
    properties: {
        Id: 'int',
        ExtraId: 'int',
        Quantity: 'int',
        Price: 'double',
        ExtraGroup: { type: 'string', default: '' },
        Name: 'string',
        Code: 'string'
    },

}

const PromotionSchema = {
    name: SchemaName.PROMOTION,
    primaryKey: "Id",
    properties: {
        Id: 'int',
        ProductId: 'int',
        QuantityCondition: 'int',
        IsLargeUnit: "bool",
        ProductPromotionId: "int",
        ProductPromotionIsLargeUnit: "bool",
        QuantityPromotion: "int",
        PricePromotion: "double",
        BeginDate: "string",
        EndDate: "string",
        RetailerId: 'int',
        CreatedDate: "string",
        CreatedBy: "int",
        Product: { type: "string", default: '{}' },
        Promotion: { type: "string", default: '{}' }
    }
}

const databaseOption = {
    path: 'Pos365Boss.realm',
    schema: [ServerEventSchema, RoomSchema, RoomGroupSchema, ProductSchema, CategoriesSchema, ToppingsSchema, CustomerSchema, PromotionSchema, OrdersOffline, QRCode, PriceBook],
    schemaVersion: 41
}

const realm = new Realm(databaseOption);

const realmStore = new RealmStore();

export default realmStore;