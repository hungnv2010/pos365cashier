import { enc, DES, mode, pad, MD5, SHA256, AES } from 'crypto-js'

const hex2bin = (hex) => {
    var ret = []
    var i = 0
    var l

    hex += ''

    for (l = hex.length; i < l; i += 2) {
        var c = parseInt(hex.substr(i, 1), 16)
        var k = parseInt(hex.substr(i + 1, 1), 16)

        if (isNaN(c) || isNaN(k)) return false
        ret.push((c << 4) | k)
    }

    return String.fromCharCode.apply(String, ret)
}

const decimalToHexString = (number) => {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

const toUTF8Array = (str) => {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        else {
            i++;
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

const fromUTF8Array = (data) => {
    var str = '',
        i;

    for (i = 0; i < data.length; i++) {
        var value = data[i];

        if (value < 0x80) {
            str += String.fromCharCode(value);
        } else if (value > 0xBF && value < 0xE0) {
            str += String.fromCharCode((value & 0x1F) << 6 | data[i + 1] & 0x3F);
            i += 1;
        } else if (value > 0xDF && value < 0xF0) {
            str += String.fromCharCode((value & 0x0F) << 12 | (data[i + 1] & 0x3F) << 6 | data[i + 2] & 0x3F);
            i += 2;
        } else {
            var charCode = ((value & 0x07) << 18 | (data[i + 1] & 0x3F) << 12 | (data[i + 2] & 0x3F) << 6 | data[i + 3] & 0x3F) - 0x010000;

            str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00);
            i += 3;
        }
    }

    return str;
}

const binToArrayHex = (x) => {
    let value = [];
    for (let i = 0; i < x.length; i++) {

        let b = x[i].charCodeAt();
        let signByteCode = ((b >= 128) ? (b - 256) : b);

        if (signByteCode < 0) {
            value.push('-');
            signByteCode = -signByteCode;
        }
        if (signByteCode < 16) {
            value.push('0');
        }

        value.push(decimalToHexString(signByteCode).toUpperCase());
    }

    return value;
}

export const descEncrypt = (plaintext) => {

    let privateKey = 'a1e3c21919adeeab';
    let binPrivateKey = enc.Hex.parse(privateKey);

    let encrypted = DES.encrypt(
        enc.Utf8.parse(plaintext)
        , binPrivateKey
        , { mode: mode.ECB, padding: pad.Pkcs7 });

    let result = encrypted.ciphertext.toString(enc.Hex);
    let arrayBin = hex2bin(result);

    let arrayHex = binToArrayHex(arrayBin);

    return fromUTF8Array(toUTF8Array(arrayHex.join('')))
}

export const ecryption = (plaintext) => {
    
    let privateKey = 'a1e3c21919adeeab';
    // let privateKey = ThongTinKhachHang.saveFileKey;
    var ciphertext = DES.encrypt(plaintext.toString(enc.Utf8), privateKey,
        { mode: mode.ECB, padding: pad.Pkcs7 });
    return ciphertext
}

export const decryption = (mahoa) => {
    let privateKey = 'a1e3c21919adeeab';
    // let privateKey = ThongTinKhachHang.saveFileKey;
    let dencrypted = DES.decrypt(mahoa.toString(), privateKey,
        { mode: mode.ECB, padding: pad.Pkcs7 });
    var plaintext = dencrypted.toString(enc.Utf8);
    return plaintext
}


export const genPassword = (username, password) => {
    let hash = 'Empty';
    if (
        // username && username != ''
        // && 
        password && password != '') {
        hash = MD5(password + username).toString(enc.Hex).toUpperCase();
    }
    return hash;
}

export const genPasswordSha256 = (username, password) => {
    let hash = 'Empty';
    if (password && password != '') {
        hash = SHA256(password + username).toString(enc.Hex).toUpperCase();
    }
    return hash;
}

export const genMD5 = (text) => {
    let hash = 'Empty';
    if (text && text != '') {
        hash = MD5(text).toString();
    }
    return hash;
}

// export const descSession = () => {

// }

// export const genSessionId = () => {
//     let seed = getSeed();
//     String(key) = seed + '';
//     return UngDungPVcomBank.mUngDungPVcomBank.mThuVienNenHeThong.pingcomNativeBamMD5Xau(key)
// }