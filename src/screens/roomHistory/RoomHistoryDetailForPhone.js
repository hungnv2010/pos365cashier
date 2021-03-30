import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, FlatList, Image } from 'react-native';
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import colors from '../../theme/Colors';
import { URL, HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import dialogManager from '../../components/dialog/DialogManager';
import { useSelector } from 'react-redux';
import { currencyToString, dateToString, momentToStringDateLocal, dateToStringFormatUTC } from '../../common/Utils';

const RoomHistoryDetail = (props) => {
    const [roomHistoryDetail, setRoomHistoryDetail] = useState({})
    const [user, setUser] = useState({})

    useEffect(() => {
        if (props.route.params.item) {
            setRoomHistoryDetail(props.route.params.item)
        }
    }, [props.route.params.item])
    useEffect(() => {
        const getInforUser = async () => {
            if (JSON.stringify(roomHistoryDetail) != "{}") {
                let infor = await new HTTPService().setPath(ApiPath.USERS + "/" + roomHistoryDetail.CreatedBy).GET()
                setUser(infor)
            }
        }
        getInforUser()
    }, [roomHistoryDetail])
    return (
        <View style={{ flex: 1, backgroundColor: '#DDDDDD' }}>
            <ToolBarDefault {...props} title={I18n.t("chi_tiet_huy_tra_hang")} />
            <View style={{  flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
                <View style={{ alignItems: 'center', marginTop: 10 ,paddingVertical:20}}>
                    <Image source={Images.icon_history} style={{ width: 70, height: 70 }}></Image>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t('phong_ban')}</Text>
                    <Text style={styles.infor}>{roomHistoryDetail.Room ? roomHistoryDetail.Room.Name : ""}[{roomHistoryDetail.Pos}]</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t("nhan_vien")}</Text>
                    <Text style={styles.infor}>{roomHistoryDetail ? user.Name : ""}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t("ngay_huy_tra")}</Text>
                    <Text style={styles.infor}> {dateToStringFormatUTC(roomHistoryDetail.CreatedDate)}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10, marginBottom:10 }}>
                    <Text style={[styles.title,{ justifyContent:'center', alignItems:'center', marginRight:40}]}>{I18n.t("ly_do")}</Text>
                    <Text style={{ fontSize: 14, color: '#FF0000', fontStyle: 'italic'}}>{roomHistoryDetail.Description}</Text>
                </View>
            </View>
            
            <View style={{  flexDirection: 'column', marginTop: 0.5, backgroundColor: '#FFFFFF' , flex:1}}>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t("ten_hang_hoa")}</Text>
                    <Text style={styles.infor}>{roomHistoryDetail.Product ? roomHistoryDetail.Product.Name : ""}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t("ma_san_pham")}</Text>
                    <Text style={styles.infor}>{roomHistoryDetail.Product ? roomHistoryDetail.Product.Code : ""}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t('so_luong')}</Text>
                    <Text style={styles.infor}>{roomHistoryDetail.Quantity}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t("gia")}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0099FF' }}>{currencyToString(roomHistoryDetail.Price)}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginRight: 10, marginLeft: 10, marginTop: 10 }}>
                    <Text style={styles.title}>{I18n.t("thanh_tien")}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0099FF'}}>{currencyToString(roomHistoryDetail.Total)}</Text>
                </View>
            </View>
            
        </View>
    )

}
const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        color: '#363636'
    },
    infor: {
        fontSize: 14
    }
})
export default RoomHistoryDetail