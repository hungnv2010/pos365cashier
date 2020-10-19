import { HTTPService } from "./services/HttpService";
import { ApiPath } from "./services/ApiPath";
import realmStore, { SchemaName } from "./realm/RealmStore"
import { Observable, map } from 'rxjs';

class DataManager {
    constructor() {
        this.dataChoosing = [];
        this.listTopping = [];
    }

    syncServerEvent = async () => {
        let res = await new HTTPService().setPath(ApiPath.SERVER_EVENT).GET()
        console.log("syncSE", res);

        if (res && res.length > 0)
            realmStore.insertServerEvents(res).subscribe((res, serverEvent) => console.log("syncServerEvent", res, serverEvent))
    }

    syncProduct = async () => {
        let res = await new HTTPService().setPath(ApiPath.SYNC_PRODUCTS).GET()
        console.log("syncProduct", res);

        if (res && res.Data && res.Data.length > 0)
            await realmStore.insertProducts(res.Data)
    }

    syncPromotion = async () => {
        let params = { Includes: ['Product', 'Promotion'] }
        let res = await new HTTPService().setPath(ApiPath.PROMOTION).GET(params)
        console.log('syncPromotion', res);
        if (res && res.results.length > 0) {
            realmStore.insertPromotion(res.results)
        }
    }

    syncTopping = async () => {
        let results = await new HTTPService().setPath(ApiPath.SYNC_EXTRAEXT).GET()
        console.log('syncTopping', results);
        if (results && results.length > 0) {
            realmStore.insertTopping(results)
        }
    }

    syncData = async (apiPath, schemaName) => {
        let res = await new HTTPService().setPath(apiPath).GET()
        console.log("syncData sync", apiPath, res);
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

    syncAllDatas = async () => {
        await this.syncProduct(),
            await this.syncTopping(),
            await this.syncServerEvent(),
            await this.syncRooms(),
            await this.syncPartner(),
            await this.syncCategories(),
            await this.syncPromotion()
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