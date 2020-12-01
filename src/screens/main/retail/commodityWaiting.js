import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, ImageBackground, Dimensions, FlatList
} from 'react-native';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import realmStore from '../../../data/realm/RealmStore';
import { useSelector } from 'react-redux'
import { Constant } from '../../../common/Constant';
import { Images, Metrics } from '../../../theme';
import colors from '../../../theme/Colors';
import I18n from '../../../common/language/i18n'
import { currencyToString } from '../../../common/Utils';
import { Snackbar, FAB } from 'react-native-paper';
import dialogManager from '../../../components/dialog/DialogManager';

export default (props) => {

    const [listCommodity, setListCommodity] = useState([{ id: 1, Price: 125000 }, { id: 2, Price: 620000 }, { id: 3, Price: 125000 }, { id: 4, Price: 620000 }, { id: 5, Price: 125000 }, { id: 6, Price: 620000 }, { id: 7, Price: 125000 }, { id: 8, Price: 620000 }]);
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

    const onLongClickCommodity = (item) => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_hoa_don'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                let list = listCommodity.filter(el => item.id != el.id);
                setListCommodity(list)
            }
        })
    }

    const onClickCreateCommodity = () => {

    }

    const renderList = () => {
        return <FlatList
            style={{ padding: 2 }}
            data={listCommodity}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => onClickCommodity(item)}
                    onLongPress={() => onLongClickCommodity(item)}
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
                <View style={styles.viewListEmtry}>
                    <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={styles.backGroundLogo}>
                    </ImageBackground>
                </View>
            }
            <FAB
                style={styles.fab}
                big
                icon="plus"
                color="#fff"
                onPress={onClickCreateCommodity}
            />
        </View>
    )

}

const styles = StyleSheet.create({
    conatiner: { flex: 1 },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    },
    fill: {
        flex: 1, backgroundColor: "#fff",
    },
    viewListEmtry : { alignItems: "center", flex: 1 },
    backGroundLogo: { flex: 1, opacity: 0.8, margin: 20, width: Metrics.screenWidth / 1.5 },
})

