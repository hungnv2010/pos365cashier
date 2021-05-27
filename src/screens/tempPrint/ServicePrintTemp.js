import tempDefault from "./tempDefault";
import { dateToString, currencyToString, nonAccentVietnamese } from '../../common/Utils'
import { getFileDuLieuString } from "../../data/fileStore/FileStorage";
import { Constant } from "../../common/Constant";

const PaymentDataDefault = {
    "AccountId": null, "ActiveDate": "2021-05-13T07:00:54.8100002Z", "AmountReceive": 0, "AmountReceived": 30000, "Code": "", "Description": "", "Discount": 0, "DiscountRatio": 0, "DiscountToView": 0, "DiscountValue": 0, "ExcessCash": 0, "ExcessCashType": 0, "Id": 0, "MoreAttributes": "{\"PaymentMethods\":[{\"AccountId\":null,\"Value\":30000}],\"OldDebt\":0,\"NewDebt\":0}", "NumberOfGuests": 0, "OfflineId": "cd6afe0a-3f7c-4132-9acf-35d26f4ed2d6", "OldDebt": 0, "OrderDetails": [{
        "AttributesName": "", "BasePrice": 30000, "BlockOfTimeToUseService": 0, "BonusPoint": 0, "BonusPointForAssistant": 0, "BonusPointForAssistant2": 0, "BonusPointForAssistant3": 0, "CategoryId": 0, "Checkin": "2021-05-13T07:02:22.986Z", "Checkout": "", "Code": "HH-1640", "Code2": "", "Code3": "", "Code4": "", "Coefficient": 0, "CompositeItemProducts": [Array], "ConversionValue": 5, "CostPriceOrderStock": 0, "Description": ` -Bia 333 x1 = 10,000;
-Cua Hoàng Đế x1 = 1,150,000;
-chim to  x1 = 30,000;
`, "DiscountRatio": 0, "Hidden": false, "IsCheckPriceServer": true, "IsLargeUnit": false, "IsPercentageOfTotalOrder": false, "IsPriceForBlock": false, "IsPromotion": false, "IsSerialNumberTracking": false, "IsTimer": false, "LabelPrinted": 0, "LargeUnit": "thùng", "LargeUnitCode": "", "Name": "Cà phê sữa", "OnHand": 0, "OnlinePrice": 0, "OrderQuickNotes": "", "Price": 30000, "PriceConfig": "{\"Block\":0.0,\"CalcPriceToTime\":\"\",\"DontPrintLabel\":false,\"OpenTopping\":false,\"Printer3\":\"KitchenC\",\"Printer4\":\"KitchenD\",\"Printer5\":\"BartenderA\",\"SecondPrinter\":\"KitchenB\",\"TimeFrom\":\"\",\"TimeFrom2\":\"\",\"TimeTo\":\"\",\"TimeTo2\":\"\",\"TimeValue\":0.0,\"TimeValue2\":0.0,\"Type\":\"percent\",\"Type2\":\"percent\",\"Value\":0.0}", "PriceLargeUnit": 500000, "Printer": "KitchenA", "Processed": 0, "ProductId": 10033924, "ProductImages": [Array], "ProductType": 1, "Quantity": 1, "Serveby": 39207, "SplitForSalesOrder": false, "StopTimer": false, "TotalTopping": 0, "Unit": "cốc", "UnitPrice": 30000, "actualCount": 0, "descriptionOff": "", "isShowOtherDescription": false, "isUpdateTimeCheckInOrCheckOut": false, "sumSecondsNormal": 0
    }], "Partner": { "BestDiscount": 0, "Code": "abc10", "Debt": 0, "Gender": 1, "Id": 3651786, "Keyword": "abc10  abc10", "Name": "abc10", "PartnerGroupMembers": [], "Point": 0, "TotalDebt": 0 }, "PartnerId": 3651786, "PaymentCode": "q7140521-0009", "PointToValue": 0, "Pos": "A", "PriceBookId": null, "Printed": false, "PurchaseDate": "Fri May 14 2021 16:33:59 GMT+0700 (+07)", "RoomId": 913029, "RoomName": "b123", "ShippingCost": "0", "ShippingCostForPartner": 0, "SoldById": 0, "Status": 2, "Total": 30000, "TotalPayment": 30000, "VAT": 0, "VATRates": "", "Voucher": 0
}
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
        objTemp = objTemp.replace("{Product_Name}", textUnit(element) + nonAccentVietnamese(element.Name).toUpperCase())
        objTemp = objTemp.replace("{Product_Name_Downline}", "")

        let arrayDes = element.Description.split("\n").filter(item => item.trim() != "");
        if (element.Description != "" && arrayDes.length > 0) {
            let array = objTemp.split("{Product_Topping}\"");
            console.log("array ", array.length);
            let output = ""

            console.log("handerDataPrintTemp arrayDes ", arrayDes)
            arrayDes.forEach((el, index) => {
                if (index == 0) {
                    if (arrayDes.length > 1)
                        output = array[0] + nonAccentVietnamese(el) + "\" ";
                    else
                        output = array[0] + nonAccentVietnamese(el) + "\"" + array[1];
                } else if (index == arrayDes.length - 1) {
                    output += "\nTEXT 10," + (95 + index * 20) + ",\"1\",0,1,1,\"" + nonAccentVietnamese(el) + "\"" + array[1];
                } else {
                    output += "\nTEXT 10," + (95 + index * 20) + ",\"1\",0,1,1,\"" + nonAccentVietnamese(el) + "\"";
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
                    TEXT 10,20,"${textSize}",0,1,1,"${nonAccentVietnamese(vendorSession.CurrentRetailer.Name).toUpperCase()}"
                    TEXT 0,45,"${textSize}",0,1,1,"------------------------------"
                    TEXT 10,70,"${textSize}",0,1,1,"${nonAccentVietnamese(element.Name).toUpperCase()}"
                    TEXT 10,95,"${textSize}",0,1,1,""
                    BARCODE 10,110,"128",60,1,0,2,2,"${element.Code}"
                    TEXT 10,${heightTextPrice},"${textSize}",0,1,1,"${currencyToString(element.Price)} ${textUnit(element)}"
                    PRINT 1,1
                    CLS
                    END`
    });
    console.log("handerDataPrintTempProduct tempList ", tempList)
    return tempList;
}