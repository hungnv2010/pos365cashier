export const jsonToObject = json => {
    const obj = JSON.parse(json);
    return obj;
};

export function credit_card_format(value) {
    var v = value.replace(/\s+/gi, "").replace(/[^0-9*]/gi, "");
    var matches = v.match(/\d{4,16}/g);
    var match = (matches && matches[0]) || "";
    var parts = [];

    for (i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
        return parts.join(" ");
    } else {
        return value;
    }
}

export function credit_card_raw_format(value = '') {

    // var matches = value.match(/\d{4,16}/g);
    // var match = (matches && matches[0]) || "";
    var parts = [];

    // for (i = 0, len = value.length; i < len; i += 4) {
    for (i = 0, len = 16; i < len; i += 4) {
        parts.push(value.substring(i, i + 4));
    }

    if (parts.length) {
        return parts.join(" ");
    } else {
        return value;
    }
}

