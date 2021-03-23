import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ImageBackground, ScrollView, Image } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { currencyToString } from '../../common/Utils';

export default (props) => {

    const [listOrder, setListOrder] = useState([])
    const { deviceType } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        const getData = () => {
            if (deviceType == Constant.PHONE) {
                console.log("props.route.params ", props.route.params);
                if (props.route.params.list.length > 0)
                    setListOrder(props.route.params.list);
            }
        }
        getData()

    }, [])

    useEffect(() => {
        const getData = () => {
            if (deviceType != Constant.PHONE) {
                console.log("getData list ", props.data);

                if (props.data != "")
                    setListOrder(props.data.list);
            }
        }
        getData()

    }, [props.data])

    const getTotalPrice = (list) => {
        let total = 0;
        list.forEach(item => {
            if (!(item.ProductType == 2 && item.IsTimer)) {
                let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
                let totalTopping = item.TotalTopping ? item.TotalTopping : 0
                total += (price + totalTopping) * item.Quantity
            }
        })
        return total
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {deviceType == Constant.PHONE ? <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                clickLeftIcon={() => {
                    props.route.params._onSelect(2);
                    props.navigation.goBack()}}
                // navigation={props.navigation}
                title={I18n.t('chi_tiet_goi_mon')}
            /> : null}
            <View style={{ padding: 10, marginTop: deviceType != Constant.PHONE ? 2 : 0, backgroundColor: colors.colorchinh, flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "bold", color: "#fff" }}>{deviceType != Constant.PHONE ? props.data.RoomName : props.route.params.RoomName}</Text>
                <Text style={{ fontWeight: "bold", color: "#fff" }}>{deviceType != Constant.PHONE ? props.data.Position : props.route.params.Position}</Text>
            </View>
            <ScrollView style={{ flex: 1 }}>
                {listOrder.length > 0 ?
                    listOrder.map(item => {
                        return (<View style={{ borderBottomColor: "#ddd", borderBottomWidth: 0.5, flex: 1, padding: 10, flexDirection: "row", }} key={item.Id}>
                            <Image
                                style={{ height: 70, width: 70, borderRadius: 50, borderWidth: 0.5 }}
                                source={item.ProductImages != "" && JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
                            />
                            <View style={{ flexDirection: "column", justifyContent: "center", padding: 5, flex: 1 }}>
                                <Text style={{ color: "#000", fontWeight: "bold", }}>{item.Name.trim()}</Text>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
                                    <Text style={{ color: "#000" }}>x {item.Quantity}</Text>
                                    <Text style={{ color: "#000" }}>{currencyToString(item.Price)} đ</Text>
                                </View>
                                {item.Description && item.Description != "" ?
                                    <Text style={{ color: "#000" }}>{item.Description}</Text> : null}
                            </View>
                        </View>)
                    }) : null}
            </ScrollView>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: colors.colorchinh, justifyContent: "space-between", alignItems: "center", padding: 10 }}>
                <Text style={{ color: "#fff" }}>{I18n.t('tam_tinh')}</Text>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>{currencyToString(getTotalPrice(listOrder))} đ</Text>
            </View>
        </View>
    );
};