import base64 from 'base-64';
import utf8 from 'utf8'

export const decodeBase64 = (text) => {
    const bytes = base64.decode(text);
    const kieuUtf8 = utf8.decode(bytes);
    
    return kieuUtf8;
}

export const encodeBase64 = (text = '') => {
    result = ''
    if (text){
        text = utf8.encode(text)
        result = base64.encode(text)
    }
    
    return result;
}