
import I18n from '../../common/language/i18n';
import dialogManager from '../../components/dialog/DialogManager';
import store from "../../store/configureStore";
import { ApiPath } from './ApiPath';
import { Constant } from '../../common/Constant';
import { setFileLuuDuLieu } from '../fileStore/FileStorage';
import { navigate } from '../../navigator/NavigationService';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';

export var URL = { link: "https://oke.pos365.vn/" };

export var index401 = 0;

// var showMessage = true;

export class HTTPService {

    _api = URL.link;
    _path = ''

    HTTP_OK = 200 | 204;

    showMessage = true;

    constructor() {

    }

    setAPI(api) {
        this._api = api;
    }

    setLinkFileTinh(path) {
        this._path = path;
        return this
    }

    setPath(path, isShowMessage = true) {
        this._path = this._api + path;
        this.showMessage = isShowMessage;
        return this
    }

    setReplaceId(key, id) {
        this._path = this._path.replace(key, id)
        return this
    }

    GET(jsonParam, headers = getHeaders()) {
        let params = jsonParam ? convertJsonToPrameter(jsonParam) : ''
        this._path = this._path + params
        console.log('GET:', this._path, JSON.stringify(headers));
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: this._path,
                headers: headers,
                withCredentials: true,
            }).then((response) => { this.extractData(response, resolve) }).catch((e) => {
                console.log("GET err ", e);
                this.handleError(e, reject);
            })
        })

    }

    POST(jsonParam, headers = getHeaders()) {
        headers['Content-Type'] = 'application/json'
        console.log('POST:', this._path, headers, jsonParam);
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: this._path,
                headers: headers,
                withCredentials: true,
                data: JSON.stringify(jsonParam),
                timeout: 30000,
                timeoutErrorMessage: "TIMEOUT"
            }).then((response) => { this.extractData(response, resolve) })
                .catch((e) => {
                    console.log("POST err ", e);
                    this.handleError(e, reject);
                })
        })
    }

    PUT(jsonParam, headers = getHeaders()) {
        headers['Content-Type'] = 'application/json'
        return new Promise((resolve, reject) => {
            axios({
                method: 'put',
                url: this._path,
                headers: headers,
                withCredentials: true,
                data: JSON.stringify(jsonParam)
            }).then((response) => { this.extractData(response, resolve) })
                .catch((e) => {
                    console.log("PUT err ", e);
                    this.handleError(e, reject);
                })
        })
    }

    DELETE(jsonParam, headers = getHeaders()) {
        let params = convertJsonToPrameter(jsonParam)
        return new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: this._path + params,
                headers: headers,
                withCredentials: true,
            }).then((response) => { this.extractData(response, resolve) }).catch((e) => {
                console.log("DELETE err ", e);
                this.handleError(e, reject);
            })
        })
    }

    handleError(e, reject) {
        // console.log("handleError error.response.status === ", JSON.stringify(e.response.status))
        // console.log("handleError Responses === ", JSON.stringify(e))
        // console.log("handleError Responses === ", e.response.data.ResponseStatus.Message)
        if (e.response && e.response.status && e.response.status == 401) {
            if (!(e.response.config.url.includes(ApiPath.VENDOR_SESSION) || e.response.config.url.includes(ApiPath.LOGIN))) {
                index401++;
                console.log("index401 ", index401);

                // if (index401 > 10) {
                setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
                navigate('Login', {}, true);
                index401 = 0
                // } else
                dialogManager.showPopupOneButton(I18n.t('het_phien_lam_viec'), I18n.t('thong_bao'), () => {
                    dialogManager.destroy();
                }, null, null, I18n.t('dong'))
            } else {
                reject("")
            }
            // } else if (e.response && e.response.status && e.response.status == 403) {
            //     dialogManager.showPopupOneButton(I18n.t('tai_khoan_khong_co_quyen_su_dung_chuc_nang_nay'), I18n.t('thong_bao'), () => {
            //         dialogManager.destroy();
            //     }, null, null, I18n.t('dong'))
            //     dialogManager.hiddenLoading()
        }
        else {
            if (e && e.response && e.response.data) {
                let mes = e.response.data.ResponseStatus && e.response.data.ResponseStatus.Message ? e.response.data.ResponseStatus.Message.replace(/<strong>/g, "").replace(/<\/strong>/g, "") : "";
                if (mes != "Conflict") this.error(mes);
                reject(mes)
            } else {
                if (!(e && e.config && e.config.timeoutErrorMessage && e.config.timeoutErrorMessage == "TIMEOUT"))
                    this.error();
                reject(e)
            }
        }
    }

    extractData(response, resolve) {
        console.log("extractData Responses === ", response)
        if (response.status == 200) {
            resolve(response.data)
        }
        else {
            if (response.status == 401) {
                if (!(response.config.url.includes(ApiPath.VENDOR_SESSION) || response.config.url.includes(ApiPath.LOGIN))) {
                    index401++;
                    if (index401 >= 10) {
                        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                        setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
                        navigate('Login', {}, true);
                        index401 = 0
                    } else
                        dialogManager.showPopupOneButton(I18n.t('het_phien_lam_viec'), I18n.t('thong_bao'), () => {
                            dialogManager.destroy();
                        }, null, null, I18n.t('dong'))
                }
            } else if (response.status == 204) {
                resolve({ status: 204 })
            } else if (response.status == 400) {
                resolve(response.data)
            }
            else {
                this.error();
            }
            return null;
        }

    }

    error(mes = "") {
        if (this.showMessage == true) {
            NetInfo.fetch().then(state => {
                if (state.isConnected == true && state.isInternetReachable == true) {
                    if (mes != '')
                        dialogManager.showPopupOneButton(mes, I18n.t('thong_bao'), () => {
                            dialogManager.destroy();
                        }, null, null, I18n.t('dong'))
                    else
                        dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
                            dialogManager.destroy();
                        }, null, null, I18n.t('dong'))
                } else {
                    dialogManager.showPopupOneButton(I18n.t('loi_ket_noi_mang'), I18n.t('thong_bao'), () => {
                        dialogManager.destroy();
                    }, null, null, I18n.t('dong'))
                }
            });

        } else {
            console.log('http err');
        }
    }
}

export function convertJsonToPrameter(jsonData) {
    let state = store.getState();
    console.log("convertJsonToPrameter state ", state);
    return '?' + new URLSearchParams(jsonData).toString();
}

export function getHeaders(jsonHeader = null, isLogin = false) {
    let state = store.getState();
    let headers = {
        // 'Accept-Language': I18n.locale,
        'Accept': 'application/json',
        // 'Content-Type': 'application/json',
    }
    if (state.Common.info && state.Common.info.SessionId && state.Common.info.SessionId != "" && isLogin == false)
        headers["COOKIE"] = "ss-id=" + state.Common.info.SessionId;

    if (jsonHeader) {
        Object.keys(jsonHeader).forEach(function (key) {
            headers[key] = jsonHeader[key];
        })
    }

    return headers;
}