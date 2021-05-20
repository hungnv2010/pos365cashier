import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { Snackbar } from 'react-native-paper';
import I18n from '../../common/language/i18n'
import moment from "moment";
const { Print } = NativeModules;
const eventSwicthScreen = new NativeEventEmitter(Print);
const imageWhite = "data:image/png;base64,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"
export const TYPE_PRINT = {
    KITCHEN: "KITCHEN",
    RETURN_PRODUCT: "RETURN_PRODUCT"
}

const typeHeader = "HOÁ ĐƠN THANH TOÁN"
const typeHeaderProvisional = "HOÁ ĐƠN TẠM TÍNH"
const code = "HD000000"
const number = "0000"

const CONTENT_FOOTER_POS365 = "Powered by POS365.VN"

class PrintService {

    listWaiting = []

    GenHtml = async (html, JsonContent, Base64Qr = "", checkProvisional = false) => {
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        console.log('GenHtml JsonContent ', JsonContent);
        vendorSession = JSON.parse(vendorSession);
        return new Promise((resolve, reject) => {
            let HTMLBase = html;
            let listHtml = HTMLBase.split("<!--Body Table-->");
            let listTable = ""
            let sum = 0;
            JsonContent.OrderDetails.forEach(el => {
                var description = el.Description && el.Description.trim() != "" ? `<br>${el.Description?.replace(";", "<br>")}` : "";
                let itemTable = listHtml[1];

                let BasePriceCustomAndTopping = (el.IsLargeUnit ? el.PriceLargeUnit : el.UnitPrice) + el.TotalTopping

                itemTable = itemTable.replace("{Ten_Hang_Hoa}", "" + el.Name)
                itemTable = itemTable.replace("{Ghi_Chu_Hang_Hoa}", description)
                itemTable = itemTable.replace("{So_Luong}", Math.round(el.Quantity * 1000) / 1000)
                itemTable = itemTable.replace("{Thanh_Tien_Hang_Hoa}", currencyToString(this.getPrice(el)))
                // itemTable = itemTable.replace("{Thanh_Tien_Hang_Hoa}", currencyToString(BasePriceCustomAndTopping * el.Quantity))
                itemTable = itemTable.replace("{Don_Gia}", currencyToString(el.Price))
                itemTable = itemTable.replace("{Don_Gia_Goc_Hien_Thi_Check}", BasePriceCustomAndTopping > el.Price ? "style='display: block'" : "style='display: none'")
                itemTable = itemTable.replace("{Don_Gia_Goc_Hien_Thi}", currencyToString(BasePriceCustomAndTopping))
                sum += this.getPrice(el);
                // sum += BasePriceCustomAndTopping * el.Quantity
                listTable += itemTable;
            });
            HTMLBase = listHtml[0] + listTable + listHtml[2];
            if (vendorSession.CurrentRetailer) {
                let img = vendorSession.CurrentRetailer.Logo && vendorSession.CurrentRetailer.Logo != "" ? vendorSession.CurrentRetailer.Logo : "";
                console.log("vendorSession img ", img);
                if (img != "") {
                    HTMLBase = HTMLBase.replace("{Logo_Full}", img)
                    HTMLBase = HTMLBase.replace("{Logo_Full_Check}", `style="visibility: 'unset'"`)
                    console.log("vendorSession check 1 ");
                } else {
                    console.log("vendorSession check 2 ");
                    // HTMLBase = HTMLBase.replace("{Logo_Full_Check}", `style="visibility: 'unset'"`)
                    // HTMLBase = HTMLBase.replace("{Logo_Full}", imageWhite)
                    HTMLBase = HTMLBase.replace("{Logo_Full_Check}", `style="visibility: collapse;"`)
                }
                let CurrentBranch = vendorSession.Branchs.filter(item => item.Id == vendorSession.CurrentBranchId)
                console.log("CurrentBranch ", CurrentBranch);
                if (CurrentBranch.length == 1) {
                    CurrentBranch = CurrentBranch[0]
                }
                HTMLBase = HTMLBase.replace("{Ten_Cua_Hang}", CurrentBranch.Name)
                HTMLBase = HTMLBase.replace("{Dia_Chi_Cua_Hang}", vendorSession.CurrentRetailer.Address ? vendorSession.CurrentRetailer.Address : "")
                HTMLBase = HTMLBase.replace("{Dien_Thoai_Cua_Hang}", vendorSession.CurrentRetailer.Phone)
                HTMLBase = HTMLBase.replace("{Loai_Hoa_Don}", !checkProvisional ? typeHeader : typeHeaderProvisional)
                HTMLBase = HTMLBase.replace("{Ma_Chung_Tu}", number + ": " + (JsonContent.PaymentCode ? JsonContent.PaymentCode : code))
                HTMLBase = HTMLBase.replace("{Ngay_Tao_Karaoke}", dateToDate(new Date()))
                HTMLBase = HTMLBase.replace("{Ngay}/{Thang}/{Nam}-{Gio}:{Phut}-Vao", JsonContent.ActiveDate ? dateToDate(JsonContent.ActiveDate, DATE_FORMAT, "DD/MM/YYYY - HH:mm") : (JsonContent.CreatedDate ? dateToDate(JsonContent.CreatedDate, DATE_FORMAT, "DD/MM/YYYY - HH:mm") : dateToDate(new Date(), DATE_FORMAT, "DD/MM/YYYY - HH:mm")))
                HTMLBase = HTMLBase.replace("{Ngay}/{Thang}/{Nam}-{Gio}:{Phut}-Ra", (JsonContent.PurchaseDate && JsonContent.PurchaseDate != "") ? moment(JsonContent.PurchaseDate).format("DD/MM/YYYY - HH:mm") : dateToDate(new Date(), DATE_FORMAT, "DD/MM/YYYY - HH:mm"))
                HTMLBase = HTMLBase.replace("{Ten_Phong_Ban}", JsonContent.RoomName + "[" + JsonContent.Pos + "]")
                HTMLBase = HTMLBase.replace("{Ten_Khach_Hang}", JsonContent && JsonContent.Partner && JsonContent.Partner.Name != "" ? JsonContent.Partner.Name : I18n.t("khach_le"))
                HTMLBase = HTMLBase.replace("{Nhan_Vien}", vendorSession.CurrentUser.Name)

                let partnerPhone = JsonContent.Partner && JsonContent.Partner.Phone ? JsonContent.Partner.Phone : ""
                HTMLBase = HTMLBase.replace("{Dien_Thoai_Khach_Hang}", " " + partnerPhone)
                let addressCustomer = JsonContent.Partner && JsonContent.Partner.Address ? JsonContent.Partner.Address : ""
                let addressCustomerShow = addressCustomer != "" ? addressCustomer : "";
                HTMLBase = HTMLBase.replace("{Dia_Chi_Khach_Hang}", " " + addressCustomerShow)

                HTMLBase = HTMLBase.replace("{Tong_Truoc_Chiet_Khau}", currencyToString(sum))
                HTMLBase = HTMLBase.replace("{Chiet_Khau_Check}", JsonContent.Discount > 0 ? "style='visibility: unset;'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{Chiet_Khau}", currencyToString(JsonContent.Discount))
                HTMLBase = HTMLBase.replace("{VAT_Check}", JsonContent.VATRates != "" && JsonContent.VAT > 0 ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{VAT}", currencyToString(JsonContent.VAT))
                HTMLBase = HTMLBase.replace("{VAT%}", JsonContent.VATRates + "%")
                HTMLBase = HTMLBase.replace("{Tong_Cong}", currencyToString(JsonContent.Total))
                HTMLBase = HTMLBase.replace(/{Excess_Cash_Check}/g, (JsonContent.ExcessCash != 0) &&
                    (JsonContent.AmountReceived != undefined && JsonContent.AmountReceived != 0) ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{Tien_Khach_Dua}", JsonContent.AmountReceived != undefined && JsonContent.AmountReceived != 0 ? currencyToString(JsonContent.AmountReceived) : "")
                HTMLBase = HTMLBase.replace("{Tien_Thua_Tra_Khach}", currencyToString(JsonContent.ExcessCash))
                HTMLBase = HTMLBase.replace("{Ghi_Chu_Check}", JsonContent.Description && JsonContent.Description != "" ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{Ghi_Chu}", JsonContent.Description)
                HTMLBase = HTMLBase.replace("{Chan_Trang}", I18n.t('xin_cam_on'))
                HTMLBase = HTMLBase.replace("{FOOTER_POS_365}", CONTENT_FOOTER_POS365)

                if (HTMLBase.indexOf("font-size:") > -1) {
                    let fontSize = HTMLBase;
                    fontSize = fontSize.split("font-size:")[1];
                    fontSize = fontSize.split("px")[0];
                    console.log("fontSize === ", fontSize);
                    HTMLBase = HTMLBase.replace(/(font-size:\s*)(\d+.*\d*)(px;)/g, "font-size:" + (parseFloat(fontSize) + 2) + "px;");
                    console.log("fontSize ==== HTMLBase  ", HTMLBase);
                }

                if (Base64Qr != "")
                    HTMLBase = HTMLBase.replace("</body>", Base64Qr + " </body>");

                HTMLBase = HTMLBase.replace("</body>", " </br></br></br></br></br></br></body>");
                console.log("html Description ", JsonContent.Description);
            }
            console.log("html ", JSON.stringify(HTMLBase));
            resolve(HTMLBase);
        })
    }

    getPrice = (item) => {
        console.log('getPrice', item);
        // let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
        return item.Quantity * item.Price
    }

    handlerQuantityPrint(el, type) {
        console.log("handlerQuantityPrint el type ", el, type);
        let Quantity = 0;
        if (type != TYPE_PRINT.KITCHEN) {
            Quantity = el.Quantity
        } else {
            Quantity = Math.round((el.Quantity - el.Processed) * 1000) / 1000;
        }
        console.log("handlerQuantityPrint Quantity ", Quantity);
        return Quantity;
    }

    GenHtmlKitchen = (html, JsonContent, i, vendorSession, type = TYPE_PRINT.KITCHEN, numberDoublePrint = 0) => {
        console.log('GenHtmlKitchen JsonContent ', JsonContent);
        let HTMLBase = html;
        let listHtml = HTMLBase.split("<!--Body Table-->");
        let listTable = ""

        JsonContent.forEach((el, index) => {
            console.log("GenHtmlKitchen el ", el);
            if ((type == TYPE_PRINT.KITCHEN && (el.Quantity - el.Processed > 0) || ((type != TYPE_PRINT.KITCHEN)))
            ) {
                console.log("GenHtmlKitchen el ok");
                var description = el.Description && el.Description.trim() != "" ? `<br>${el.Description?.replace(";", "<br>")}` : "";
                let itemTable = listHtml[1];

                itemTable = itemTable.replace("{STT_Hang_Hoa}", "" + (index + 1))
                if (type != TYPE_PRINT.KITCHEN) {
                    itemTable = itemTable.replace("{So_Luong_Check}", "text-decoration: line-through; ");
                }
                itemTable = itemTable.replace("{Ten_Hang_Hoa}", "" + el.Name)
                itemTable = itemTable.replace("{Ghi_Chu_Hang_Hoa}", description)
                itemTable = itemTable.replace("{So_Luong}", this.handlerQuantityPrint(el, type))
                itemTable = itemTable.replace("{DVT_Hang_Hoa}", (el.IsLargeUnit ? el.LargeUnit : el.Unit))
                listTable += itemTable;
            }
        });
        HTMLBase = listHtml[0] + listTable + listHtml[2];
        HTMLBase = HTMLBase.replace("{Ten_Phong_Ban}", JsonContent[0].RoomName + "[" + (JsonContent[0].Pos ? JsonContent[0].Pos : (JsonContent[0].Position ? JsonContent[0].Position : "")) + "]")
        HTMLBase = HTMLBase.replace("{Gio_Hien_Tai}", moment(new Date()).format('DD/MM/YYYY - HH:mm'))
        HTMLBase = HTMLBase.replace("{STT_Don_Hang}", i)
        HTMLBase = HTMLBase.replace("{Lien_check}", numberDoublePrint > 0 ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
        HTMLBase = HTMLBase.replace("{Lien}", numberDoublePrint == 0 ? "" : (numberDoublePrint == 1 ? "Liên 1" : "Liên 2"))
        if (vendorSession.CurrentRetailer) {
            HTMLBase = HTMLBase.replace("{Nhan_Vien}", vendorSession.CurrentUser.Name)
        }
        console.log("html ", JSON.stringify(HTMLBase));

        return HTMLBase;
    }

}
const printService = new PrintService();
export default printService;