import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme'
import realmStore from '../../../data/realm/RealmStore';
import I18n from '../../../common/language/i18n';
import { currencyToString } from '../../../common/Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default (props) => {

    const [topping, setTopping] = useState([]) // list toppings to show
    const [categories, setCategories] = useState([])
    const [listCateId, setlistCateId] = useState([I18n.t('tat_ca')])
    const [itemOrder, setItemOrder] = useState(() => props.route.params.itemOrder) //current product
    const toppingRef = useRef([]) // save all toppings from db

    useEffect(() => {// initial
        console.log('initial', itemOrder);
        const init = async () => {

            let toppingIntial = []
            if (itemOrder.Topping)
                try {
                    toppingIntial = [...JSON.parse(itemOrder.Topping)]
                } catch (error) {}

            let newCategories = [{ Id: -1, Name: I18n.t('tat_ca') }]
            let newTopping = []
            let results = await realmStore.queryTopping()

            results.forEach(item => {
                if (item.ExtraGroup !== '' && newCategories.filter(cate => cate.Name == item.ExtraGroup).length == 0) {
                    newCategories.push({ Id: item.Id, Name: item.ExtraGroup })
                }
                newTopping.push({ ...JSON.parse(JSON.stringify(item)), QuantityExtra: 0 })
            })

            newTopping.forEach(top => {
                toppingIntial.forEach(ls => {
                    if (top.ExtraId == ls.ExtraId) {
                        top.QuantityExtra = ls.QuantityExtra
                    }
                })
            })

            toppingRef.current = [...newTopping]
            setCategories(newCategories)

            setTopping(toppingRef.current)
        }
        init()
    }, [])

    useEffect(() => {// change category topping
        if (listCateId[0] == I18n.t('tat_ca')) {
            setTopping(toppingRef.current)
        } else {
            let topping = toppingRef.current.filter(tp => tp.ExtraGroup == listCateId[0])
            console.log(topping, 'topping');
            setTopping([...topping])
        }
    }, [listCateId])

    const getTotalPrice = () => {
        let priceTotal = topping.reduce((accumulator, currentValue) => accumulator + currentValue.Price * currentValue.QuantityExtra, 0)
        return priceTotal
    }

    const handleButtonDecrease = (item, index) => {
        topping[index].QuantityExtra += 1;
        setTopping([...topping])
    }

    const handleButtonIncrease = (item, index) => {
        if (item.QuantityExtra == 0) {
            return
        }
        topping[index].QuantityExtra -= 1;
        setTopping([...topping])
    }

    const saveListTopping = () => {
        let ls = toppingRef.current.filter(item => item.QuantityExtra > 0)
        ls = JSON.parse(JSON.stringify(ls))
        navigationBack(ls)
    }

    const navigationBack = (list) => {
        props.navigation.pop();
        props.route.params._onSelect(list);
    }

    const renderCateItem = (item, index) => {
        let isSelected = item.Name == listCateId[0] ? Colors.colorchinh : "black";
        return (
            <TouchableOpacity onPress={() => { setlistCateId([item.Name]) }}
                key={index} style={[styles.cateItem, { borderColor: isSelected }]}>
                <Text style={{ color: isSelected, fontWeight: "bold" }}>{item.Name}</Text>
            </TouchableOpacity>
        )
    }

    const renderTopping = (item, index) => {
        return (
            <View key={item.Id} style={[styles.toppingItem, { backgroundColor: item.QuantityExtra > 0 ? "#EED6A7" : "white" }]}>
                <View style={{ flex: 3, paddingRight: 10 }}>
                    <Text numberOfLines={2} style={{}}>{item.Name}</Text>
                    <Text numberOfLines={2} style={{ fontStyle: "italic", fontSize: 13, color: "gray" }}>{currencyToString(item.Price)}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 2, justifyContent: "space-between", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { handleButtonIncrease(item, index) }}>
                        <Text style={styles.button}>-</Text>
                    </TouchableOpacity>
                    <Text>{item.QuantityExtra}</Text>
                    <TouchableOpacity onPress={() => { handleButtonDecrease(item, index) }}>
                        <Text style={styles.button}>+</Text>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: Colors.colorchinh, flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text numberOfLines={1} style={{ color: "white", textAlign: "center" }}>{itemOrder ? itemOrder.Name : ''}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>Topping</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end", paddingRight: 5 }}>
                    <TouchableOpacity style={{}} onPress={() => { saveListTopping() }}>
                        <Icon name="check" size={30} color="white" style={{}} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: "white", marginBottom: 3 }}>
                    <FlatList
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        renderItem={({ item, index }) => renderCateItem(item, index)}
                        keyExtractor={(item, index) => '' + index}
                        extraData={listCateId} />
                </View>
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={topping}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => renderTopping(item, index)}
                        keyExtractor={(item, index) => '' + index}
                        extraData={topping}
                        key={props.numColumns}
                        numColumns={props.numColumns} />
                </View>
            </View>
            <View style={{ height: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 5, backgroundColor: "white" }}>
                <Text style={{ fontWeight: "bold", fontSize: 15 }}>{I18n.t('tong_thanh_tien')}</Text>
                <Text style={{ fontWeight: "bold", fontSize: 15 }}>{currencyToString(getTotalPrice())}đ</Text>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    cateItem: { borderWidth: 0.5, padding: 15, margin: 5, borderRadius: 10 },
    toppingItem: { flex: 1, flexDirection: "row", justifyContent: "space-between", padding: 10, alignItems: "center", borderRadius: 10, margin: 3 },
    button: { borderWidth: .5, padding: 15, borderRadius: 10 },
})



