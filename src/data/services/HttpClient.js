import { decodeBase64 } from "../../common/Base64";
import { jsonToObject } from "../../common/Converter";
import I18n from "../../common/language/i18n";
import dialogManager from "../../components/dialog/DialogManager";
import store from "../../store/configureStore";

const URL_RELEASE = "";
const URL_DEBUG = "https://oke.pos365.vn";
const URL_DEBUG2 = "https://kt365cafe.pos365.vn";

const URL = URL_DEBUG2;

export const Get = async (
    baseUrl,
    apiPath,
    param = {},
    header = {},
    showServicePopup = true
) => {
    let jsonParam = {
        ...param
    }
    let params = jsonParam ? convertJsonToPrameter(jsonParam) : "";
    let path = baseUrl + "/" + apiPath + params;
    let headers = getHeaders(header)
    console.log('path ', path)
    console.log('headers ', headers)
    console.log('jsonParam', jsonParam)

    return fetch(path, {
        method: "GET",
        headers: headers
    }).then(res => extractData(res, showServicePopup))
        .catch(error => {
            console.log("Get error: ", error);
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
            })
        });
};

export const Post = async (
    baseUrl, apiPath,
    body = {},
    header = {},
    showServicePopup = true) => {

    header["Content-Type"] = "application/json";
    let jsonBody = {
        ...body
    }
    let path = baseUrl + "/" + apiPath;
    let headers = getHeaders(header);
    console.log('path', path)
    console.log('headers', headers)
    console.log('jsonBody', jsonBody)

    return fetch(path, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(jsonBody)
    }).then(res => extractData(res, showServicePopup))
        .catch(error => {
            console.log("Post error: ", error);
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
            })
        })
        ;
};

export const Put = async (
    baseUrl, apiPath,
    body = {},
    header = {},
) => {
    header["Content-Type"] = "application/json";
    let jsonBody = {
        ...body
    }
    let headers = getHeaders(header);
    let path = baseUrl + "/" + apiPath;
    if (!headers || (headers && Object.keys(headers).length == 0)) {
        headers = getHeaders()
    }
    console.log('path', path)
    console.log('headers', headers)
    console.log('jsonBody', jsonBody)

    return fetch(path, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(jsonBody)
    }).then(extractData)
        .catch(error => {
            console.log("Put error: ", error);
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
            })
        });
};

export const Delete = async (
    baseUrl,
    apiPath,
    param = {},
    header = {}
) => {

    let jsonParam = {
        ...param
    }
    let headers = getHeaders(header);
    let params = jsonParam ? convertJsonToPrameter(jsonParam) : "";
    let path = baseUrl + "/" + apiPath + params;
    if (!headers || (headers && Object.keys(headers).length == 0)) {
        headers = getHeaders()
    }
    console.log('path', path)
    console.log('headers', headers)
    console.log('jsonParam', jsonParam)

    return fetch(path, {
        method: "DELETE",
        headers: headers,
        // body: JSON.stringify(jsonBody)
    }).then(extractData/*res => {//console.log('Delete: ', res);extractData(res)}*/)
        .catch(error => {
            console.log("Delete error: ", error);
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
            })
        })
        ;
};

/**
 *
 * @param {*} path
 * @param {*} service_code
 * @param {*} obj
 * @param {*} headers
 * @param {*} showLoading (default true / true: show loading, false: không show loading)
 */
export const serviceBuilderGetMethod = (
    path,
    obj = null,
    headers = {},
    showLoading = true,
    showServicePopup = true
) => {
    let param = {};
    param = {
        ...createParamsAccountDefault(),
        ...(obj ? obj : {})
    };
    headers = {
        ...createParamDefault(false),
        ...(headers ? headers : {})
    };
    let dialog = null;
    if (showLoading) {
        dialog = dialogManager;
        dialog.showLoading();
    }

    console.log("serviceBuilderGetMethod param ", param);
    console.log("serviceBuilderGetMethod headers ", headers);

    return Get(URL, path, param, getHeaders(headers), showServicePopup).then(
        res => {
            console.log('Get() - res', res);
            if (showLoading && dialog) {
                dialog.hiddenLoading();
            }
            return res;
        }
    );
};

export const serviceBuilderDeleteMethod = (
    path,
    obj = null,
    headers = {},
    showLoading = true
) => {
    let param = {};

    param = {
        ...createParamsAccountDefault(),
        ...(obj ? obj : {}),
    };
    headers = {
        ...createParamDefault(false),
        ...(headers ? headers : {}),
    };

    let dialog = null;
    if (showLoading) {
        dialog = dialogManager;
        dialog.showLoading();
    }

    return Delete(
        URL,
        path,
        param,
        getHeaders(headers),

    ).then(res => {
        if (showLoading && dialog) {
            dialog.hiddenLoading();
        }
        return res;
    });
};

export const serviceBuilderPutMethod = (
    path,
    obj = null,
    headers = {},
    showLoading = true
) => {
    let param = {};

    param = {
        ...createParamsAccountDefault(),
        ...(obj ? obj : {}),
    };
    headers = {
        ...createParamDefault(false),
        ...(headers ? headers : {}),
    };

    let dialog = null;
    if (showLoading) {
        dialog = dialogManager;
        dialog.showLoading();
    }
    return Put(URL, path, param, getPostHeaders(headers)).then(
        res => {
            if (showLoading && dialog) {
                dialog.hiddenLoading();
            }
            return res;
        }
    );
};

export const serviceBuilderPostMethod = (
    path,
    obj = null,
    headers = {},
    showLoading = true,
    showServicePopup = true,
    allowDefault = true
) => {
    console.log('serviceBuilderPostMethod() - showServicePopup: ', showServicePopup);
    let param = {
        ...createParamsAccountDefault(),
        ...(obj ? obj : {})
    };

    let dialog = null;
    if (showLoading) {
        dialog = dialogManager;
        dialog.showLoading();
    }
    let header = {
        ...createParamDefault(false),
        ...(headers ? headers : {}),
    }
    return Post(
        URL,
        path,
        param,
        getPostHeaders(header),
        showServicePopup
    ).then(res => {
        if (showLoading && dialog) {
            dialog.hiddenLoading();
        }
        return res;
    });
};

export const createParamDefault = () => {
    let state = store.getState();
    console.log("createParamDefault state ", state);

    let result = {};

    result = {
        ngonngu: I18n.locale,
    };

    return result;
};

export const createParamsAccountDefault = () => {
    let state = store.getState();

    let result = {

    };

    return result;
};

const extractData = async (response, showServicePopup = true, exitApp = false) => {
    console.log('extractData response: ', response);

    if (response.status == 200) {
        let data = response.json();
        let kq = await data;
        return kq
    } else {
        console.log("extractData error");
        /**
         * Xử lý mã lỗi
         */
        dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
            dialogManager.destroy();
            if (exitApp) {
                // RNExitApp.exitApp()
            }
        }, null, null, I18n.t('dong'))
        return {
            status: response.status
        };
    }
};

const convertJsonToPrameter = jsonData => {
    return (
        "?" +
        Object.keys(jsonData)
            .map(function (k) {
                return encodeURIComponent(k) + "=" + encodeURIComponent(jsonData[k]);
            })
            .join("&")
    );
};

export const getHeaders = (jsonHeader = null, type = '') => {
    let headers = {
        "Accept-Language": I18n.locale,
        Accept: "application/json",
        // "Content-Type": "application/json"
    };
    if (jsonHeader) {
        Object.keys(jsonHeader).forEach(function (key) {
            headers[key] = jsonHeader[key];
        });
    }
    console.log("==========getHeaders type: ", type);
    console.log("==========getHeaders: ", headers);
    return headers;
};

const getPostHeaders = (jsonHeader = null) => {
    let headers = {
        "Accept-Language": I18n.locale,
        Accept: "application/json",
        "Content-Type": "application/json"
    };
    if (jsonHeader) {
        Object.keys(jsonHeader).forEach(function (key) {
            headers[key] = jsonHeader[key];
        });
    }
    return headers;
};
