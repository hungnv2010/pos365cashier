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

        if (res.length > 0)
            realmStore.insertServerEvents(res).subscribe((res, serverEvent) => console.log("syncServerEvent", res, serverEvent))
    }

    syncProduct = async () => {
        let res = await new HTTPService().setPath(ApiPath.SYNC_PRODUCTS).GET()
        console.log("syncProduct", res);

        if (res.Data && res.Data.length > 0)
            await realmStore.insertProducts(res.Data)
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
        console.log("sync", apiPath, res);
        if (res.Data && res.Data.length > 0)
            await realmStore.insertDatas(schemaName, res.Data)
    }

    syncRooms = async () => {
        console.log("syncAllDatas");
        await this.syncServerEvent(),
            await this.syncData(ApiPath.SYNC_ROOMS, SchemaName.ROOM),
            await this.syncData(ApiPath.SYNC_ROOM_GROUPS, SchemaName.ROOM_GROUP)
    }

    syncForFirstTime = async () => {
        await this.syncProduct(),
            await this.syncTopping(),
            await this.syncData(ApiPath.SYNC_CATEGORIES, SchemaName.CATEGORIES)
    }

    syncAllDatas = async () => {
        await this.syncForFirstTime(),
            await this.syncRooms()
    }
}

const dataManager = new DataManager();
export default dataManager;