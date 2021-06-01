import tempDefault from "./tempDefault";
import { dateToString, currencyToString, nonAccentVietnamese } from '../../common/Utils'
import { getFileDuLieuString } from "../../data/fileStore/FileStorage";
import { Constant } from "../../common/Constant";

const PaymentDataDefault = {
    "AccountId": null, "ActiveDate": "2021-05-27T03:02:46.907Z", "AmountReceive": 0, "AmountReceived": 55000, "CardNumber": null, "ChannelId": null, "Code": "", "Description": "", "Discount": 0, "DiscountRatio": 0, "DiscountToView": 0, "DiscountValue": 0, "ExcessCash": 0, "ExcessCashType": 0, "Id": 0, "MoreAttributes": "", "NumberOfGuests": 0, "OfflineId": "13afc2d2-660b-4487-ab33-b79f1535bb10", "OldDebt": 0, "OrderDetails": [{
        "AttributesName": "", "BasePrice": 40000, "BlockOfTimeToUseService": 6, "BonusPoint": 0, "BonusPointForAssistant": 0, "BonusPointForAssistant2": 0, "BonusPointForAssistant3": 0, "CategoryId": 0, "Checkin": "", "Checkout": "", "Code": "HH-0001", "Code2": "", "Code3": "", "Code4": "", "Coefficient": 1, "ConversionValue": 1, "Description": `-Thạch nha đam x1 = 10,000;
-Trân châu đen x1 = 5,000;
`, "Discount": null, "DiscountRatio": null, "Hidden": false, "Id": 17568254, "IsCheckPriceServer": true, "IsLargeUnit": false, "IsPercentageOfTotalOrder": false, "IsPriceForBlock": false, "IsSerialNumberTracking": false, "IsTimer": false, "LargeUnit": "", "Name": "Trà sữa hồng trà", "NameLatin": "tra sua hong tra", "OnHand": 0, "OnlinePrice": 0, "OrderQuickNotes": "", "Price": 55000, "PriceConfig": "{\"Type\":\"percent\",\"Type2\":\"percent\",\"DontPrintLabel\":false,\"OpenTopping\":false}", "PriceLargeUnit": 40000, "Printer": "KitchenA", "Processed": 0, "ProductId": 17568254, "ProductType": 1, "Quantity": 1, "Serveby": 0, "SplitForSalesOrder": false, "StopTimer": false, "Topping": "[{\"ExtraId\":17568257,\"QuantityExtra\":1,\"Price\":10000,\"Quantity\":1},{\"ExtraId\":17568255,\"QuantityExtra\":1,\"Price\":5000,\"Quantity\":1}]", "TotalTopping": 15000, "Unit": "", "UnitPrice": 40000, "index": 0, "labelPrinted": 0
    }], "Partner": null, "PartnerId": null, "PaymentCode": "q7140521-0009", "PointToValue": 0, "Pos": "A", "PriceBookId": null, "Printed": false, "PurchaseDate": "", "RoomId": 1328441, "RoomName": "B.5", "ShippingCost": "0", "ShippingCostForPartner": 0, "SoldById": 0, "Status": 2, "SyncStatus": 0, "Topping": "", "Total": 55000, "TotalPayment": 0, "VAT": 0, "VATRates": "", "Voucher": 0, "VoucherCode": null, "VoucherId": null, "initializingTotalPayment": false, "tmpDeliveryBy": null, "tmpDeliveryById": null, "tmpLadingCode": "", "tmpShippingCost": 0
};

const ProductDefault = [{ "AttributesName": "", "BasePrice": 30000, "BlockOfTimeToUseService": 0, "BonusPoint": 0, "BonusPointForAssistant": 0, "BonusPointForAssistant2": 0, "BonusPointForAssistant3": 0, "CategoryId": 0, "Checkin": "2021-05-13T07:02:22.986Z", "Checkout": "", "Code": "HH-1640", "Code2": "", "Code3": "", "Code4": "", "Coefficient": 0, "CompositeItemProducts": [Array], "ConversionValue": 5, "CostPriceOrderStock": 0, "Description": "", "DiscountRatio": 0, "Hidden": false, "IsCheckPriceServer": true, "IsLargeUnit": false, "IsPercentageOfTotalOrder": false, "IsPriceForBlock": false, "IsPromotion": false, "IsSerialNumberTracking": false, "IsTimer": false, "LabelPrinted": 0, "LargeUnit": "thùng", "LargeUnitCode": "", "Name": "Cà phê sữa", "OnHand": 0, "OnlinePrice": 0, "OrderQuickNotes": "", "Price": 30000, "PriceConfig": "{\"Block\":0.0,\"CalcPriceToTime\":\"\",\"DontPrintLabel\":false,\"OpenTopping\":false,\"Printer3\":\"KitchenC\",\"Printer4\":\"KitchenD\",\"Printer5\":\"BartenderA\",\"SecondPrinter\":\"KitchenB\",\"TimeFrom\":\"\",\"TimeFrom2\":\"\",\"TimeTo\":\"\",\"TimeTo2\":\"\",\"TimeValue\":0.0,\"TimeValue2\":0.0,\"Type\":\"percent\",\"Type2\":\"percent\",\"Value\":0.0}", "PriceLargeUnit": 500000, "Printer": "KitchenA", "Processed": 0, "ProductId": 10033924, "ProductImages": [Array], "ProductType": 1, "Quantity": 1, "Serveby": 39207, "SplitForSalesOrder": false, "StopTimer": false, "TotalTopping": 0, "Unit": "cốc", "UnitPrice": 30000, "actualCount": 0, "descriptionOff": "", "isShowOtherDescription": false, "isUpdateTimeCheckInOrCheckOut": false, "sumSecondsNormal": 0 }];

const textUnit = (element) => {
    let text = ""
    if (element.IsLargeUnit) {
        if (element.LargeUnit && element.LargeUnit != "") {
            text = element.LargeUnit
        }
    } else {
        if (element.Unit && element.Unit != "") {
            text = element.Unit
        }
    }
    console.log("text = ", text);
    text = nonAccentVietnamese(text)
    console.log("text == ", text);
    return text != "" ? "[" + text.toUpperCase() + "]" : "";
}
export const handerDataPrintTemp = async (data = PaymentDataDefault, size = "40x30") => {
    console.log("handerDataPrintTemp data ", data);
    let sizeArray = size.split("x")
    let width = sizeArray.length > 0 ? sizeArray[0] : 40
    let height = sizeArray.length > 1 ? sizeArray[1] : 30
    let PaymentData = PaymentDataDefault;
    if (JSON.stringify(data) != "") {
        PaymentData = data;
    }
    let TempList = ""

    let TempDefault = await getFileDuLieuString(Constant.TEMP_DEFAULT, true)
    console.log("handerDataPrintTemp TempDefault ", TempDefault, typeof (TempDefault));

    if (TempDefault == undefined || TempDefault == "") {
        TempDefault = tempDefault
    }

    let vendorSession = JSON.parse(await getFileDuLieuString(Constant.VENDOR_SESSION, true));
    PaymentData.OrderDetails.forEach((element, index) => {
        let objTemp = TempDefault;
        if (vendorSession) {
            objTemp = objTemp.replace("{Ten_Cua_Hang}", nonAccentVietnamese(vendorSession.CurrentRetailer.Name).toUpperCase())
        }
        objTemp = objTemp.replace("{Product_Name}", textUnit(element) + nonAccentVietnamese(element.Name.length > 21 ? element.Name.substring(0, 20) : element.Name).toUpperCase())
        objTemp = objTemp.replace("{Product_Name_Downline}", element.Name.length > 21 ? nonAccentVietnamese(element.Name.substring(20, element.Name.length)).toUpperCase() : "")

        let arrayDes = element.Description.split("\n").filter(item => item.trim() != "");
        if (element.Description != "" && arrayDes.length > 0) {
            let array = objTemp.split("{Product_Topping}\"");
            console.log("array ", array.length);
            let output = ""
            console.log("handerDataPrintTemp arrayDes ", arrayDes)
            let coordinatesTopping = 30;
            if (array.length > 0) {
                let str = array[0].substring(array[0].length - 18, array[0].length - 12)
                let arrStr = str.split(".")
                if (arrStr.length > 0 && parseInt(arrStr[0]) > 0){
                    console.log("get coordinatesTopping ", parseInt(arrStr[0]))
                    coordinatesTopping = parseInt(arrStr[0]);
                }
            }
            arrayDes.forEach((el, index) => {
                if (index == 0) {
                    if (arrayDes.length > 1)
                        output = array[0] + nonAccentVietnamese(el) + "\" ";
                    else
                        output = array[0] + nonAccentVietnamese(el) + "\"" + array[1];
                } else if (index == arrayDes.length - 1) {
                    output += `\nTEXT ${coordinatesTopping},` + (95 + index * 20) + ",\"1\",0,1,1,\"" + nonAccentVietnamese(el) + "\"" + array[1];
                } else {
                    output += `\nTEXT ${coordinatesTopping},` + (95 + index * 20) + ",\"1\",0,1,1,\"" + nonAccentVietnamese(el) + "\"";
                }
            });
            console.log("handerDataPrintTemp output ", output)
            objTemp = output;
            console.log("handerDataPrintTemp objTemp=== ", objTemp)
        } else {
            objTemp = objTemp.replace("{Product_Topping}", " ")
        }

        // objTemp = objTemp.replace("{Product_Topping}", (element.Description != null && element.Description != "") ? nonAccentVietnamese(element.Description.split("\n")[1]) : " ")
        // objTemp = objTemp.replace("{Product_Topping}", handerDescription(element.Description))

        objTemp = objTemp.replace("{Product_Price}", currencyToString(element.Price))
        objTemp = objTemp.replace("{Table_Infor}", nonAccentVietnamese(PaymentData.RoomName).toUpperCase() + "." + (PaymentData.PaymentCode && PaymentData.PaymentCode != "" ? PaymentData.PaymentCode.split("-")[1] : ""))
        objTemp = objTemp.replace("{Number_Invoice}", (index + 1) + "/" + PaymentData.OrderDetails.length)
        objTemp = objTemp.replace("{Height_FOOTER_35}", 60 + 5 * 30)
        objTemp = objTemp.replace("{Height_FOOTER_60}", 35 + 5 * 30)
        objTemp = objTemp.replace("{Current_time}", dateToString(new Date(), "HH:mm DD/MM"))
        objTemp = objTemp.replace(/{Text_Size}/g, height > 30 ? 3 : 2)
        console.log("handerDataPrintTemp objTemp ", objTemp)
        TempList += (index == 0 ? "" : "|||") + objTemp;
    });
    console.log("handerDataPrintTemp TempList ", TempList)
    return TempList;
}

export const handerDataPrintTempProduct = async (data = ProductDefault, size = "40x30") => {
    console.log("handerDataPrintTempProduct data ", data);
    let sizeArray = size.split("x")
    let width = sizeArray.length > 0 ? sizeArray[0] : 40
    let height = sizeArray.length > 1 ? sizeArray[1] : 30
    let textSize = (width > 40) ? 3 : 2
    let heightTextPrice = 5 * height + 50
    let vendorSession = JSON.parse(await getFileDuLieuString(Constant.VENDOR_SESSION, true));
    let tempList = "";
    data.forEach((element, index) => {
        tempList += (index == 0 ? "" : "|||") + `SIZE ${width} mm, ${height} mm
                    COUNTRY 061
                    CLS
                    TEXT 20,20,"${textSize}",0,1,1,"${nonAccentVietnamese(vendorSession.CurrentRetailer.Name).toUpperCase()}"
                    TEXT 0,45,"${textSize}",0,1,1,"------------------------------"
                    TEXT 20,70,"${textSize}",0,1,1,"${nonAccentVietnamese(element.Name).toUpperCase()}"
                    TEXT 20,95,"${textSize}",0,1,1,""
                    BARCODE 20,110,"128",60,1,0,2,2,"${element.Code ? element.Code : ""}"
                    TEXT 20,${heightTextPrice},"${textSize}",0,1,1,"${currencyToString(element.Price)} ${textUnit(element)}"
                    PRINT 1,1
                    CLS
                    END`
    });
    console.log("handerDataPrintTempProduct tempList ", tempList)
    return tempList;
}