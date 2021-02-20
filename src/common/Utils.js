import I18n from "./language/i18n";
import moment from "moment";
import { Text, View } from 'react-native';
import React from 'react'

export const DATE_FORMAT = "YYYY-MM-DD'T'HH:mm:ss.SSFFFFF'Z'";

//Convert number, currency format
export const currencyToString = (value, decimal = false) => {
  if (value == 0 && value == '0') return 0;
  if (!value || (value && value == "")) {
    value = "0";
  }
  // value = value | 0;
  value = value.toString()
  let decimalValue = 0;
  if (!decimal) {
    value = parseInt(value)
  } else {
    if (value.indexOf(".") > -1) {
      // alert(value)
      let arr = value.split('.')
      value = arr[0].replace(/\"/g, "")
      decimalValue = arr[1].replace(/\"/g, "")
    }
  }

  value = value.toString();
  let money = parseInt(value.replace(/\D/g, ""), 10);
  let currentMoney = I18n.toNumber(money, { delimiter: ",", precision: 0 });
  let output = (value < 0) ? `-${currentMoney.toString()}` : `${currentMoney.toString()}`
  output = (decimal && decimalValue > 0) ? `${output}.${decimalValue}` : output;
  return output;
};

export const dateToStringFormatUTC = (
  date,
  inputFormat = "YYYY-MM-DD[T]HH:mm:ss.SS[Z]",
  outputFormat = "HH:mm DD/MM/YYYY"
) => {
  var momentdate = moment.utc(date, inputFormat)

  var dateITC = moment(momentdate).local();
  var dateTimezone = dateITC.format(outputFormat);

  return dateTimezone;
};

//Convert Time (Date is String type, moment is Moment type)
export const dateToDate = (date, inputFormat = "YYYY-MM-DD HH:mm:ss", outputFormat = "DD/MM/YYYY") => {
  let dateOutput = "";
  try {
    dateOutput = moment(date, inputFormat).format(outputFormat);
    if (dateOutput == "Invalid date") {
      dateOutput = "";
    }
  } catch (e) {
    dateOutput = "";
  }
  return dateOutput;
};

export const momentToStringDateLocal = (
  momentInput,
  outputFormat = "YYYY-MM-DD[T]HH:mm:ss.SS[Z]"
) => {
  let dateTimeUtc = moment.utc(momentInput).format(outputFormat)
  return dateTimeUtc
}

export const dateUTCToDate = (date, inputFormat = "EEE MMM dd HH:mm:ss zzz yyyy", outputFormat = "HH:mm DD/MM/YYYY") => {
  let momentUTC = moment.utc(date, inputFormat)
  let momentITC = moment(momentUTC).local();
  let dateITC = momentITC.format(outputFormat);
  return dateITC;
};

export const dateUTCToMoment = (date, inputFormat = "yyyy-MM-dd'T'HH:mm:ss.SSFFFFF'Z'") => {
  let momentUTC = moment.utc(date, inputFormat)
  let momentITC = moment(momentUTC).local();
  return momentITC;
}

export const momentToDateUTC = (momentInput, outputFormat = "YYYY-MM-DDTHH:mm:ss.SS") => {
  let dateUTC = moment.utc(momentInput).format(outputFormat)
  return dateUTC
}

export const momentToDate = (momentInput, outputFormat = "YYYY-MM-DD[T]HH:mm:ss.SS[Z]") => {
  let dateUTC = moment(momentInput).format(outputFormat)
  return dateUTC
}

export const getTimeFromNow = (roomMoment) => {
  let date = new Date()
  let timeFromNow = date.getTime() - ((roomMoment instanceof moment )? roomMoment.valueOf() : moment(roomMoment).valueOf())
  if (timeFromNow < 0) timeFromNow = 0
  
  return displayTimeSeconds(timeFromNow /1000)
}

export const displayTimeSeconds = (seconds) => {
  let [day, hour, minute] = [0, 0, 0]
  let secondsClone = seconds

  day = Math.floor(secondsClone / (60 * 60 * 24))
  secondsClone -= day * 24 * 60 * 60
  hour = Math.floor(secondsClone / ( 60 * 60))
  secondsClone -= hour * 60 * 60
  minute = Math.ceil(secondsClone / 60)

  let getDay = day > 0 ? `${day} ${I18n.t('ngay')} ` : '';
  let getHour = +hour > 0 ? `${hour} ${I18n.t('gio')} ` : '';
  let getMinute = +minute > 0 ? `${minute} ${I18n.t('phut')}` : '';
  return `${getDay}${getHour}${getMinute}`
}

export const getDifferenceSeconds = (startTime, endDate) => {
  let differenceTime = endDate.getTime() - moment(startTime).valueOf()
  return Math.ceil(differenceTime / 1000)
}

export const dateToString = (date, formatOutput = "DD/MM/YYYY") => {
  let momentdate = "";
  try {
    momentdate = moment(date, "YYYY-MM-DD HH:mm:ss").local().format(formatOutput);
    if (momentdate == "Invalid date") {
      momentdate = date;
    }
  } catch (e) {
    momentdate = date;
  }
  return momentdate;
};

//convert string, character
export const change_alias = (alias) => {
  var str = alias;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
}

export const randomUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const groupBy = (array, key) => {
  // Return the end result
  return array.reduce((result, currentValue) => {
    // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result;
  }, {}); // empty object is the initial value for result object
};

export const mergeTwoArray = (newArray, oldArray) => {
  let array = []
  newArray.forEach(elm => {
    if (elm.SplitForSalesOrder || (elm.ProductType == 2 && elm.IsTimer)) {
      array.unshift({ ...elm })
    } else {
      let pos = oldArray.map(item => item.Id).indexOf(elm.Id);
      if (pos >= 0) {
        oldArray[pos].Quantity += elm.Quantity
      } else {
        array.unshift({ ...elm })
      }
    }
  });
  return [...array, ...oldArray]
}
export const text_highlight = (text, input,IsActive) => {
  return (
    <View style={{flexDirection:'row'}}numberOfLines={2} ellipsizeMode='tail'>{
      text.split(" ").map((word, i) => (
        <Text key={i} >
          <Text style={[input != null && input.length != 0 ? word.toLowerCase().indexOf(input.toLowerCase()) != -1 ? { backgroundColor: 'red' } : { backgroundColor: null } : { backgroundColor: null },{textTransform: "uppercase",color:IsActive ? 'white' : 'black',textAlign: "center", textAlignVertical: "center",}]} >{word} </Text>
        </Text>
      ))
    }
    </View>)
};
