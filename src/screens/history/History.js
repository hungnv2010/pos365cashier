import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import dataManager from '../../data/DataManager'
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import MainToolBar from '../main/MainToolBar';
import { Metrics, Images } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { NavigationEvents } from 'react-navigation';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { currencyToString } from '../../common/Utils';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../data/fileStore/FileStorage';
import DetailHistory from './DetailHistory';
import moment from 'moment';
import 'moment/min/locales'
import { URL } from '../../data/services/HttpService';

export default (props) => {

    const [dataItem, setDataItem] = useState("")
    const [listHistoryOrder, setListOrder] = useState([])
    const { deviceType } = useSelector(state => {
        return state.Common
    });

    const back = useRef(0);

    // const historyOrder = useSelector(state => {
    //     console.log("state.historyOrder", state.Common.historyOrder.length, state.Common.historyOrder);
    //     return [...state.Common.historyOrder]
    // });

    useEffect(() => {

    }, [])

    useFocusEffect(
        React.useCallback(() => {
            const getHistory = async () => {
                // dialogManager.showLoading();
                // if (historyOrder.length > 0)
                //     historyOrder.forEach(el => {
                //         console.log("useFocusEffect el ", el.shop, URL.link);
                //         if (URL.link.indexOf(el.shop) > -1) {
                //             console.log("useFocusEffect el list ", el.list);
                //             let arr = [...el.list]
                //             setListOrder(arr.reverse());
                //         }
                //     });
                // dialogManager.hiddenLoading();
                dialogManager.showLoading();
                let history = await getFileDuLieuString(Constant.HISTORY_ORDER, true);
                if (history && history != "") {
                    history = JSON.parse(history)
                    console.log("useFocusEffect history ", history);
                    if (history.length > 0)
                        history.forEach(el => {
                            console.log("useFocusEffect el ", el.shop, URL.link);
                            if (URL.link.indexOf(el.shop) > -1) {
                                console.log("useFocusEffect el list ", el.list);
                                setListOrder([...el.list.reverse()]);
                            }
                        });
                    dialogManager.hiddenLoading();
                } else {
                    dialogManager.hiddenLoading();
                }
            }
            if (back.current != 2)
                getHistory();
            return;
        }, [])
    );

    const onClickOrder = (item) => {
        deviceType == Constant.TABLET ?
            setDataItem(item)
            :
            props.navigation.navigate('DetailHistory', { _onSelect: onCallBack, ...item })
    }

    const onCallBack = (type) => {
        if (type == 2) {
            back.current = type;
            setTimeout(() => {
                back.current = 1;
            }, 1000);
        }
    }

    const totalProduct = (data) => {
        let total = 0;
        data.forEach(item => {
            total += item.Quantity;
        });
        return total;
    }

    const getTotalPrice = (data) => {
        let total = 0;
        data.forEach(item => {
            if (!(item.ProductType == 2 && item.IsTimer)) {
                let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
                let totalTopping = item.TotalTopping ? item.TotalTopping : 0
                total += (price + totalTopping) * item.Quantity
            }
        })
        return total
    }

    const renderItem = (item) => {
        return (
            <TouchableOpacity
                onPress={() => onClickOrder(item)}
                key={item.time}
                style={{ flexDirection: "row", borderRadius: 5, marginVertical: 4, padding: 20, width: "100%", borderColor: colors.colorchinh, borderWidth: 1, justifyContent: "center", alignItems: "center", backgroundColor: deviceType != Constant.PHONE && dataItem.time == item.time ? "#FFCC66" : "#EED6A7" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ textTransform: "uppercase", color: "#000", fontWeight: "bold" }}>{item.RoomName}</Text>
                    <Text style={{ color: "#000", marginTop: 10 }}>{I18n.t('tong_so_luong')}: {item.list ? totalProduct(item.list) : ""}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: "right", color: "#000", marginTop: 10 }}>{I18n.t('tam_tinh')}: {currencyToString(getTotalPrice(item.list))} đ</Text>
                    {item.time && item.time != "" ? <Text style={{ color: "#0072bc", textAlign: "right", marginTop: 10 }}>{moment(item.time).fromNow()}</Text> : null}
                </View>
            </TouchableOpacity>
        )
    }

    const renderList = () => {
        if (deviceType == Constant.PHONE) {
            return <ScrollView style={{ padding: 5, flex: 1 }}>
                {listHistoryOrder.map(item => { return renderItem(item) }
                )}
            </ScrollView>
            // return <FlatList
            //     initialNumToRender={1}
            //     keyboardShouldPersistTaps="always"
            //     showsVerticalScrollIndicator={false}
            //     style={{ padding: 5 }}
            //     data={listHistoryOrder}
            //     renderItem={({ item, index }) => (
            //         renderItem(item)
            //     )}
            //     numColumns={1}
            //     keyExtractor={(item, index) => index.toString()}
            //     key={1}
            //     removeClippedSubviews={true} // Unmount components when outside of window 
            //     initialNumToRender={2} // Reduce initial render amount
            //     maxToRenderPerBatch={1} // Reduce number in each render batch
            //     maxToRenderPerBatch={100} // Increase time between renders
            //     windowSize={7}
            // />
        } else {
            return (
                <View style={{ flexDirection: "row", flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            style={{ padding: 5, flex: 1 }}
                            data={listHistoryOrder}
                            renderItem={({ item, index }) => (
                                renderItem(item)
                            )}
                            numColumns={1}
                            keyExtractor={(item, index) => index.toString()}
                            key={1}
                        />
                    </View>
                    <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.colorchinh }}>
                        <DetailHistory data={dataItem} />
                    </View>
                </View>)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('lich_su_goi_mon')}
                outPutTextSearch={()=>{}}
            />
            {listHistoryOrder.length > 0 ?
                renderList()
                :
                <View style={{ alignItems: "center", flex: 1 }}>
                    <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 2 }}>
                    </ImageBackground>
                </View>
            }
        </View>
    );
};