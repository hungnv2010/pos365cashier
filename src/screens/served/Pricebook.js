import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import colors from '../../theme/Colors';
import realmStore from '../../data/realm/RealmStore';
import I18n from '../../common/language/i18n';
import { currencyToString } from '../../common/Utils'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default (props) => {

    const [currentPriceId, setCurrentPriceId] = useState((props.currentPriceBook.Id? props.currentPriceBook.Id : 0))

    useEffect(() => {
        setCurrentPriceId(props.currentPriceBook.Id? props.currentPriceBook.Id : 0)
    }, [props.currentPriceBook])

    const renderPriceBook = (item, index) => {
        let isSelected = currentPriceId == item.Id
        return (
            <TouchableOpacity onPress ={() => props.outputPriceBookSelected(item ? item : {Name: "Giá niêm yết", Id: 0})}>
                <View key={item.Id} style={{...styles.Item, backgroundColor: index % 2 == 0 ? "#f9f2e4" : "white", flex: 1}}>
                        <Text numberOfLines={2} style={{ color: isSelected? colors.colorchinh : "black"}}>{item.Name}</Text>
                </View >
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: Colors.colorchinh, flexDirection: "row" }}>
                <View style={{ alignItems: "flex-start" }}>
                    <TouchableOpacity onPress={() => props.outputPriceBookSelected() }>
                        <Icon name="keyboard-backspace" size={35} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>{I18n.t("chon_bang_gia")}</Text>
                </View>
            </View>
            <View style={{ flex: 1 , backgroundColor: "white"}}>
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={props.listPricebook}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => renderPriceBook(item, index)}
                        keyExtractor={(item, index) => '' + index}
                        extraData={props.listPricebook}
                        key={props.numColumns}
                        numColumns={props.numColumns} />
                </View>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    cateItem: { borderWidth: 0.5, padding: 15, margin: 5, borderRadius: 10 },
    Item: { flexDirection: "row", justifyContent: "space-between", padding: 10, alignItems: "center", borderRadius: 10, margin: 2 },
    button: { borderWidth: .5, padding: 15, borderRadius: 10 },
})



