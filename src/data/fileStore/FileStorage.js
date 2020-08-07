import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { ecryption, decryption } from '../../common/pcrypto/pcrypto';

export const encrypto = (plaintext) => {

    var encrypted = ecryption(plaintext)
    return encrypted
}

export const decrypto = (plaintext) => {
    var dencrypted = decryption(plaintext)
    return dencrypted
}

export const getFileDuLieuJson = async (key, isKeyEncry = true, pathOther = false, filePath = false) => {
    var path = RNFS.DocumentDirectoryPath + '/' + key;
    if (pathOther) {
        path = RNFS.DocumentDirectoryPath + '/logshistory' + '/' + key;
    }
    if (!filePath) {
        path = path + '.txt'
    }

    try {
        const value = await RNFS.readFile(path, 'utf8')

        if (value) {
            let giaima = value;
            if (isKeyEncry) {
                giaima = decrypto(value)
            }
            return JSON.parse(giaima)
        }
    } catch (error) {

    }
    return undefined
}

export const getFileDuLieuString = async (key, isKeyEncry = true, pathOther = false, filePath = false) => {
    var path = RNFS.DocumentDirectoryPath + '/' + key;
    if (pathOther) {
        path = RNFS.DocumentDirectoryPath + '/logshistory' + '/' + key;
    }
    if (!filePath) {
        path = path + '.txt'
    }
    try {
        const value = await RNFS.readFile(path, 'utf8')
        if (value) {
            let giaima = value
            if (isKeyEncry) {
                giaima = decrypto(value)
            }

            return giaima
        }
    } catch (error) {

    }
    return undefined
}

export const setFileLuuDuLieu = (key, data, isKeyEncry = true, pathOther = false, filePath = false) => {
    var path = RNFS.DocumentDirectoryPath + '/' + key;
    if (pathOther) {
        path = RNFS.DocumentDirectoryPath + '/logshistory' + '/' + key;
    }
    if (!filePath) {
        path = path + '.txt'
    }
    let datamahoa = data;
    if (isKeyEncry) {
        datamahoa = encrypto(data)
    }
    RNFS.writeFile(path, datamahoa.toString(), 'utf8')
        .then((success) => {
        })
        .catch((err) => {
        });
}

export const deleteFile = (key, pathOther = false, filePath = false) => {
    var path = RNFS.DocumentDirectoryPath + '/' + key;
    if (pathOther) {
        path = RNFS.DocumentDirectoryPath + '/logshistory' + '/' + key;
    }
    if (!filePath) {
        path = path + '.txt'
    }
    RNFS.unlink(path)
        .then((success) => {
            console.log("deleteFile success: ", success);
        })
        .catch((err) => {
            console.log("deleteFile err: ", err);
        });
}

export const createFileLogs = async () => {
    var path = RNFS.DocumentDirectoryPath + '/logshistory';
    RNFS.mkdir(path)
        .then((result) => {
            console.log('createFileLogs result', result)
        })
        .catch((err) => {
            console.warn('createFileLogs err', err)
        })
}


export const readAllFile = async (pathOther = false) => {
    console.log("====readAllFile===");
    var path = RNFS.DocumentDirectoryPath;
    if (pathOther) {
        path = RNFS.DocumentDirectoryPath + '/logshistory'
    }
    try {
        const value = await RNFS.readDir(path)
        console.log('readAllFile GOT RESULT', value);
        if (value) {
            return value
        }
    } catch (error) {

    }
    return undefined
}

