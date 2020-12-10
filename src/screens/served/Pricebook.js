import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import colors from '../../theme/Colors';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import dialogManager from '../../components/dialog/DialogManager';
import realmStore from '../../data/realm/RealmStore';


export default (props) => {

    const [currentPriceId, setCurrentPriceId] = useState((props.route.params.currentPriceBook.Id ? props.route.params.currentPriceBook.Id : 0))
    const [listPricebook, setListPricebook] = useState([])

    useEffect(() => {
        const initPricebook = async () => {
            dialogManager.showLoading()
            let newPricebooks = []
            let results = await realmStore.queryPricebook()
            results.forEach(item => {
                newPricebooks.push({ ...JSON.parse(JSON.stringify(item)) })
            })
            console.log('newPricebooks', newPricebooks);
            setListPricebook(newPricebooks)
            dialogManager.hiddenLoading()
        }
        initPricebook()
    }, [])

    useEffect(() => {
        setCurrentPriceId(props.route.params.currentPriceBook.Id ? props.route.params.currentPriceBook.Id : 0)
    }, [props.route.params.currentPriceBook])

    const renderPriceBook = (item, index) => {
        let isSelected = currentPriceId == item.Id
        return (
            <TouchableOpacity onPress={() => {
                props.route.params._onSelect(item ? item : { Name: "Giá niêm yết", Id: 0 }, 1)
                props.navigation.pop()
            }}>
                <View key={item.Id} style={{ ...styles.Item, backgroundColor: index % 2 == 0 ? "#f9f2e4" : "white", flex: 1 }}>
                    <Text numberOfLines={2} style={{ color: isSelected ? colors.colorchinh : "black" }}>{item.Name}</Text>
                </View >
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                {...props}
                navigation={props.navigation}
                clickLeftIcon={() => {
                    props.navigation.goBack()
                }}
                title={I18n.t('danh_sach_gia')} />
            <View style={{ flex: 1, backgroundColor: "white" }}>
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={listPricebook}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => renderPriceBook(item, index)}
                        keyExtractor={(item, index) => '' + index}
                        extraData={listPricebook}
                        key={props.route.params.numColumns}
                        numColumns={props.route.params.numColumns} />
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



