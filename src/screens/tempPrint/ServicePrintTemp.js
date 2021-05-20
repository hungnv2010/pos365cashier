import tempDefault from "./tempDefault";
import { dateToString, currencyToString, change_alias } from '../../common/Utils'
import { getFileDuLieuString } from "../../data/fileStore/FileStorage";
import { Constant } from "../../common/Constant";

const PaymentDataDefault = { "AccountId": null, "ActiveDate": "2021-05-13T07:00:54.8100002Z", "AmountReceive": 0, "AmountReceived": 30000, "Code": "", "Description": "", "Discount": 0, "DiscountRatio": 0, "DiscountToView": 0, "DiscountValue": 0, "ExcessCash": 0, "ExcessCashType": 0, "Id": 0, "MoreAttributes": "{\"PaymentMethods\":[{\"AccountId\":null,\"Value\":30000}],\"OldDebt\":0,\"NewDebt\":0}", "NumberOfGuests": 0, "OfflineId": "cd6afe0a-3f7c-4132-9acf-35d26f4ed2d6", "OldDebt": 0, "OrderDetails": [{ "AttributesName": "", "BasePrice": 30000, "BlockOfTimeToUseService": 0, "BonusPoint": 0, "BonusPointForAssistant": 0, "BonusPointForAssistant2": 0, "BonusPointForAssistant3": 0, "CategoryId": 0, "Checkin": "2021-05-13T07:02:22.986Z", "Checkout": "", "Code": "HH-1640", "Code2": "", "Code3": "", "Code4": "", "Coefficient": 0, "CompositeItemProducts": [Array], "ConversionValue": 5, "CostPriceOrderStock": 0, "Description": "", "DiscountRatio": 0, "Hidden": false, "IsCheckPriceServer": true, "IsLargeUnit": false, "IsPercentageOfTotalOrder": false, "IsPriceForBlock": false, "IsPromotion": false, "IsSerialNumberTracking": false, "IsTimer": false, "LabelPrinted": 0, "LargeUnit": "thùng", "LargeUnitCode": "", "Name": "Cà phê sữa", "OnHand": 0, "OnlinePrice": 0, "OrderQuickNotes": "", "Price": 30000, "PriceConfig": "{\"Block\":0.0,\"CalcPriceToTime\":\"\",\"DontPrintLabel\":false,\"OpenTopping\":false,\"Printer3\":\"KitchenC\",\"Printer4\":\"KitchenD\",\"Printer5\":\"BartenderA\",\"SecondPrinter\":\"KitchenB\",\"TimeFrom\":\"\",\"TimeFrom2\":\"\",\"TimeTo\":\"\",\"TimeTo2\":\"\",\"TimeValue\":0.0,\"TimeValue2\":0.0,\"Type\":\"percent\",\"Type2\":\"percent\",\"Value\":0.0}", "PriceLargeUnit": 500000, "Printer": "KitchenA", "Processed": 0, "ProductId": 10033924, "ProductImages": [Array], "ProductType": 1, "Quantity": 1, "Serveby": 39207, "SplitForSalesOrder": false, "StopTimer": false, "TotalTopping": 0, "Unit": "cốc", "UnitPrice": 30000, "actualCount": 0, "descriptionOff": "", "isShowOtherDescription": false, "isUpdateTimeCheckInOrCheckOut": false, "sumSecondsNormal": 0 }, { "AttributesName": "", "BasePrice": 0, "BlockOfTimeToUseService": 10, "BonusPoint": 5, "BonusPointForAssistant": 0, "BonusPointForAssistant2": 0, "BonusPointForAssistant3": 0, "CategoryId": 0, "Checkin": "", "Checkout": "", "Code": "HH-2522", "Code2": "", "Code3": "", "Code4": "", "Coefficient": 1, "CompositeItemProducts": [Array], "ConversionValue": 1, "CostPriceOrderStock": 0, "Description": "", "DiscountRatio": 0, "Hidden": false, "IsCheckPriceServer": true, "IsLargeUnit": false, "IsPercentageOfTotalOrder": false, "IsPriceForBlock": false, "IsPromotion": false, "IsSerialNumberTracking": false, "IsTimer": false, "LabelPrinted": 0, "LargeUnit": "", "LargeUnitCode": "", "Name": "giờ hát", "OnHand": 0, "OnlinePrice": 0, "OrderQuickNotes": "", "Price": 0, "PriceConfig": "{\"Type\":\"vnd\",\"Type2\":\"percent\",\"DontPrintLabel\":false,\"OpenTopping\":true,\"TimeFrom\":\"2021-05-11T14:00:00.000Z\",\"TimeTo\":\"2021-05-11T16:30:00.000Z\",\"TimeValue\":100000,\"Block\":30,\"Value\":600000}", "PriceLargeUnit": 0, "Printer": "KitchenA", "Processed": 0, "ProductId": 16998861, "ProductImages": [Array], "ProductType": 1, "Quantity": 1, "Serveby": 0, "SplitForSalesOrder": true, "StopTimer": false, "TotalTopping": 0, "Unit": "", "UnitPrice": 0, "actualCount": 0, "descriptionOff": "", "isShowOtherDescription": false, "isUpdateTimeCheckInOrCheckOut": false, "sumSecondsNormal": 0 }], "Partner": { "BestDiscount": 0, "Code": "abc10", "Debt": 0, "Gender": 1, "Id": 3651786, "Keyword": "abc10  abc10", "Name": "abc10", "PartnerGroupMembers": [], "Point": 0, "TotalDebt": 0 }, "PartnerId": 3651786, "PaymentCode": "q7140521-0009", "PointToValue": 0, "Pos": "A", "PriceBookId": null, "Printed": false, "PurchaseDate": "Fri May 14 2021 16:33:59 GMT+0700 (+07)", "RoomId": 913029, "RoomName": "b1123", "ShippingCost": "0", "ShippingCostForPartner": 0, "SoldById": 0, "Status": 2, "Total": 30000, "TotalPayment": 30000, "VAT": 0, "VATRates": "", "Voucher": 0 }
export const handerDataPrintTemp = async (data) => {
    console.log("handerDataPrintTemp data ", data);
    let PaymentData = PaymentDataDefault;
    if (JSON.stringify(data) != "") {
        PaymentData = data;
    }
    let TempList = ""
    let vendorSession = JSON.parse(await getFileDuLieuString(Constant.VENDOR_SESSION, true));
    PaymentData.OrderDetails.forEach((element, index) => {
        let objTemp = tempDefault;
        if (vendorSession) {
            objTemp = objTemp.replace("{Ten_Cua_Hang}", change_alias(vendorSession.CurrentRetailer.Name).toUpperCase())
        }
        objTemp = objTemp.replace("{Product_Name}", "[" + change_alias(element.IsLargeUnit ? (element.LargeUnit ? element.LargeUnit : "") : (element.Unit ? element.Unit : "")).toUpperCase() + "]" + change_alias(element.Name).toUpperCase())
        objTemp = objTemp.replace("{Product_Name_Downline}", "")
        objTemp = objTemp.replace("{Product_Topping}", (element.Description != null && element.Description != "") ? change_alias(element.Description) : " ")
        objTemp = objTemp.replace("{Product_Price}", currencyToString(element.Price))
        objTemp = objTemp.replace("{Table_Infor}", change_alias(PaymentData.RoomName).toUpperCase() + "." + (PaymentData.PaymentCode && PaymentData.PaymentCode != "" ? PaymentData.PaymentCode.split("-")[1] : ""))
        objTemp = objTemp.replace("{Number_Invoice}", (index + 1) + "/" + PaymentData.OrderDetails.length)
        objTemp = objTemp.replace("{Height_FOOTER_35}", 60 + 5 * 30)
        objTemp = objTemp.replace("{Height_FOOTER_60}", 35 + 5 * 30)
        objTemp = objTemp.replace("{Current_time}", dateToString(new Date(), "HH:mm DD/MM"))
        objTemp = objTemp.replace(/{Text_Size}/g, 2)
        console.log("handerDataPrintTemp objTemp ", objTemp)

        TempList += (index == 0 ? "" : "|||") + objTemp;

        // if (index == 0)
        // TempList.push(objTemp);

    });
    console.log("handerDataPrintTemp TempList ", TempList)
    return TempList;
}