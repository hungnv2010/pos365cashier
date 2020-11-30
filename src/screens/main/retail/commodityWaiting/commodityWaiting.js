import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, ImageBackground, Dimensions, FlatList
} from 'react-native';
import ToolBarDefault from '../../../../components/toolbar/ToolBarDefault';
import realmStore from '../../../../data/realm/RealmStore';
import { useSelector } from 'react-redux'
import { Constant } from '../../../../common/Constant';
import { Images, Metrics } from '../../../../theme';
import colors from '../../../../theme/Colors';
import I18n from '../../../../common/language/i18n'
import { currencyToString } from '../../../../common/Utils';

export default (props) => {

    const [listCommodity, setListCommodity] = useState([{ Price: 125000 }, { Price: 620000 }, { Price: 125000 }, { Price: 620000 }, { Price: 125000 }, { Price: 620000 }, { Price: 125000 }, { Price: 620000 }]);
    const numberColumn = useSelector(state => {
        console.log("useSelector state ", state);
        let numberColumn = (state.Common.orientaition == Constant.LANDSCAPE) ? 6 : 4
        if (state.Common.deviceType == Constant.TABLET) numberColumn++
        return numberColumn
    });

    const widthRoom = Dimensions.get('screen').width / numberColumn;

    useEffect(() => {
        const getCommodityWaiting = async () => {
            let serverEvents = await realmStore.queryServerEvents()
            console.log('commodityWaiting serverEvents', JSON.parse(JSON.stringify(serverEvents)));
        }
        getCommodityWaiting()
    }, [])

    const onClickCommodity = (item) => {
        props.navigation.pop()
    }

    const renderList = () => {
        return <FlatList
            style={{ padding: 2 }}
            data={listCommodity}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => onClickCommodity(item)}
                    key={item.Id}
                    style={{ borderRadius: 5, margin: numberColumn == 4 ? 2 : 2, padding: 0, width: widthRoom - (numberColumn == 4 ? 5 : 4.67), height: widthRoom - (numberColumn == 4 ? 5 : 4.67), backgroundColor: colors.colorLightBlue, borderWidth: 0, alignItems: "center" }}>
                    <View style={{ height: "35%", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ textAlign: "center", textTransform: "uppercase", color: "#fff", fontSize: 14 }}>Order</Text>
                    </View>
                    <View style={{ backgroundColor: "#fff", height: 0.5, width: "100%" }}></View>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                        <Text style={{ textAlign: "center", color: "#fff", marginTop: 0, fontSize: 10 }}>Retail customers</Text>
                        <Text style={{ textAlign: "center", color: "#fff", marginTop: 10, fontSize: 10 }}>{currencyToString(item.Price)}</Text>
                    </View>
                </TouchableOpacity>
            )}
            numColumns={numberColumn}
            keyExtractor={(item, index) => index.toString()}
            key={numberColumn}
        />
    }

    return (
        <View style={{ flex: 1, }}>
            <ToolBarDefault
                {...props}
                title="Commodity waiting for payment" />
            {listCommodity.length > 0 ?
                renderList()
                :
                <View style={{ alignItems: "center", flex: 1 }}>
                    <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.8, margin: 20, width: Metrics.screenWidth / 1.5 }}>
                    </ImageBackground>
                </View>
            }
        </View>
    )

}


