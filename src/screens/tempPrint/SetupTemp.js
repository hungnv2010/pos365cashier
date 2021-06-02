import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NativeModules, Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import PreviewTempPrint from './PreviewTempPrint';
import I18n from '../../common/language/i18n'
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import colors from '../../theme/Colors';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { ScreenList } from '../../common/ScreenList';
import tempDefault from './tempDefault';
import { handerDataPrintTemp } from './ServicePrintTemp';

const Code = {
    Ten_Cua_Hang: "{Ten_Cua_Hang}",
    // Dia_chi_Cua_Hang: "{Dia_chi_Cua_Hang}",
    // Dien_Thoai_Cua_Hang: "{Dien_Thoai_Cua_Hang}",
    // Ma_Chung_Tu: "{Ma_Chung_Tu}",
    Product_Name: "{Product_Name}",
    Product_Name_Downline: "{Product_Name_Downline}",
    Product_Topping: "{Product_Topping}",
    Product_Price: "{Product_Price}",
    Table_Infor: "{Table_Infor}",
    Number_Invoice: "{Number_Invoice}",
    Current_time: "{Current_time}",
    Text_Size: "{Text_Size}",
    Height_FOOTER_60: "{Height_FOOTER_60}",
    Height_FOOTER_35: "{Height_FOOTER_35}"
}

export default (props) => {

    const [tabType, setTabType] = useState(1);
    const [dataHtml, setDataHtml] = useState(tempDefault);

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {

        const getDataHtml = async () => {
            let TempDefault = await getFileDuLieuString(Constant.TEMP_DEFAULT, true)
            console.log("getDataHtml TempDefault ", TempDefault, typeof (TempDefault));

            if (TempDefault != undefined && TempDefault != "")
                setDataHtml(TempDefault)
            else {
                setDataHtml(tempDefault)
            }

            handerDataPrintTemp()
        }

        getDataHtml();
    }, [])

    const onSelectTab = (number) => {
        if (number == 1) {
            setDataHtml(tempDefault)
            setFileLuuDuLieu(Constant.TEMP_DEFAULT, tempDefault);
        } else {
            dialogManager.showLoading();
            let params = {};
            new HTTPService().setPath(ApiPath.PRINT_TEMPLATES + "/12").GET(params).then((res) => {
                console.log("onClickLoadOnline res ", res);
                if (res && res.Content) {

                    let regex = /<[a-z][\s\S]*>/;
                    console.log("onClickLoadOnline regex ", regex.test(res.Content))
                    if (regex.test(res.Content)) {
                        dialogManager.showPopupOneButton(I18n.t("ung_dung_hien_tai_chua_ho_tro_in_co_dau"));
                        setDataHtml(tempDefault)
                        setFileLuuDuLieu(Constant.TEMP_DEFAULT, tempDefault);
                    } else {
                        setDataHtml(res.Content)
                        setFileLuuDuLieu(Constant.TEMP_DEFAULT, "" + res.Content);
                    }
                } else {
                    setDataHtml(tempDefault)
                    setFileLuuDuLieu(Constant.TEMP_DEFAULT, tempDefault);
                }
                dialogManager.hiddenLoading()
            }).catch((e) => {
                console.log("onClickLoadOnline err ", e);
                dialogManager.hiddenLoading()
            })
        }
    }

    const ViewInputHtml = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ padding: 5, justifyContent: "space-between", flexDirection: "row" }}>
                    <TouchableOpacity style={styles.button} onPress={() => { onSelectTab(1) }}>
                        <Text style={styles.textButton}>{I18n.t('mac_dinh')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { onSelectTab(2) }}>
                        <Text style={styles.textButton}>LOAD ONLINE</Text>
                    </TouchableOpacity>
                    {deviceType == Constant.PHONE ?
                        <TouchableOpacity style={styles.button} onPress={() => { props.navigation.navigate(ScreenList.PreviewTempPrint, { data: dataHtml }) }}>
                            <Text style={styles.textButton}>{I18n.t('hien_thi')}</Text>
                        </TouchableOpacity>
                        : null}
                </View>
                <KeyboardAvoidingView style={{ flex: 1, flexDirection: "column" }} behavior={Platform.OS == "ios" ? "padding" : "none"}>
                    <TextInput style={{
                        padding: 10,
                        flex: 1.6,
                    }}
                        multiline={true}
                        onChangeText={text => {
                            setDataHtml(text)
                        }} value={dataHtml} />

                    <ScrollView style={{ flex: 1, padding: 10, borderTopColor: "gray", borderTopWidth: 0.5 }}>
                        <Text style={{ textTransform: "uppercase", color: "orange" }}>{I18n.t("ma_nhung")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Ten_Cua_Hang} :</Text> {I18n.t("ten_cua_hang")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Product_Name} :</Text> {I18n.t("ten_san_pham")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Product_Name_Downline} :</Text> {I18n.t("hien_thi_dong_thu_hai_ten_sp")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Product_Topping} :</Text> Topping</Text>
                        <Text><Text style={styles.noteCode}>{Code.Product_Price} :</Text> {I18n.t("gia")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Table_Infor} :</Text> {I18n.t("ban")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Number_Invoice} :</Text> {I18n.t("so_thu_tu_sp")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Current_time} :</Text> {I18n.t("thoi_gian")}</Text>
                        <Text><Text style={styles.noteCode}>{Code.Text_Size} :</Text> {I18n.t("co_chu")}</Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                navigation={props.navigation}
                title="Temp Print"
            />
            {deviceType == Constant.PHONE ?
                ViewInputHtml()
                :
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                        {
                            ViewInputHtml()
                        }
                    </View>
                    <View style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: "gray" }}>
                        <PreviewTempPrint {...props} data={dataHtml} />
                    </View>
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    button: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", margin: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.colorLightBlue },
    textButton: { color: "#fff", textTransform: "uppercase" },
    noteCode: { color: colors.colorLightBlue },
})