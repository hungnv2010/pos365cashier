import { schemaVersion } from 'realm';
const Realm = require('realm');

export class RealmBase {

    constructor() { }

    async queryAll(databaseOption, schema) {
        let realm = await Realm.open(databaseOption)
        return realm.objects(schema)
    }

    insertNewData = async (databaseOption, schema, data) => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            realm.create(schema, data)
            resolve(data)
        })
        )
    }

    insertData = async (databaseOption, schema, data) => {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            realm.create(schema, data, true)
            resolve(data)
        })
        )
    }

    async insertDatas(databaseOption, schema, datas) {
        let realm = await Realm.open(databaseOption)
        return new Promise((resolve) => realm.write(() => {
            datas.map(data => {
                console.log("insertDatas", data)
                realm.create(schema, data, true)
            })
            resolve(datas)
        })
        )
    }
}