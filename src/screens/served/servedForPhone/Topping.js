import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors, Metrics, Images } from '../../../theme'
import realmStore from '../../../data/realm/RealmStore';
import I18n from '../../../common/language/i18n';
import dataManager from '../../../data/DataManager';
import { currencyToString } from '../../../common/Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export default (props) => {

    const [topping, setTopping] = useState([])
    const [categories, setCategories] = useState([])
    const [listCateId, setlistCateId] = useState([I18n.t('tat_ca')])
    const [itemOrder, setItemOrder] = useState(() => props.route.params.itemOrder)
    const [listTopping, setListTopping] = useState([])
    const toppingRef = useRef([])


    useEffect(() => {
        console.log('dataManager.listTopping', dataManager.listTopping);
        const init = () => {
            dataManager.listTopping.forEach(item => {
                if (item.IdRoom == props.route.params.IdRoom) {
                    setListTopping([...item.Data])
                }
            })
        }
        init()
    }, [])



    useEffect(() => {
        const getTopping = async () => {
            let newCategories = [{ Id: -1, Name: I18n.t('tat_ca') }]
            let newTopping = []
            let exist = false
            let results = await realmStore.queryTopping()
            results.forEach(item => {
                if (item.ExtraGroup !== '' && newCategories.filter(cate => cate.Name == item.ExtraGroup).length == 0) {
                    newCategories.push({ Id: item.Id, Name: item.ExtraGroup })
                }
                newTopping.push({ ...JSON.parse(JSON.stringify(item)), Quantity: 0 })
            })
            toppingRef.current = [...newTopping]
            listTopping.forEach(lt => {
                if (lt.Id == itemOrder.Sid && lt.Key == props.route.params.Position) {
                    exist = true
                    newTopping.forEach(top => {
                        lt.List.forEach(ls => {
                            if (top.Id == ls.Id) {
                                top.Quantity = ls.Quantity
                            }
                        })
                    })
                }
            })
            setCategories(newCategories)
            setTopping(newTopping)
        }
        getTopping()
    }, [listTopping, itemOrder])

    useEffect(() => {
        if (listCateId[0] == I18n.t('tat_ca')) {
            setTopping(toppingRef.current)
        } else {
            let topping = toppingRef.current.filter(tp => tp.ExtraGroup == listCateId[0])
            console.log(topping, 'topping');
            setTopping([...topping])
        }
    }, [listCateId])

    const getTotalPrice = () => {
        let priceTotal = topping.reduce((accumulator, currentValue) => accumulator + currentValue.Price * currentValue.Quantity, 0)
        return priceTotal
    }


    const onclose = () => {
        saveListTopping()
        console.log(listTopping);

    }

    const handleButtonDecrease = (item, index) => {
        topping[index].Quantity += 1;
        setTopping([...topping])
    }

    const handleButtonIncrease = (item, index) => {
        if (item.Quantity == 0) {
            return
        }
        topping[index].Quantity -= 1;
        setTopping([...topping])
    }

    const saveListTopping = () => {
        let exist = false
        let ls = toppingRef.current.filter(item => item.Quantity > 0)
        ls = JSON.parse(JSON.stringify(ls))
        listTopping.forEach(lt => {
            if (lt.Id == itemOrder.Sid && lt.Key == props.route.params.Position) {
                exist = true
                lt.List = [...ls]
                lt.Key = props.route.params.Position
            }
        })
        if (!exist) {
            listTopping.push({ Id: itemOrder.Sid, List: [...ls], Key: props.route.params.Position })
        }
        saveData()
        navigationBack(ls)
    }


    const saveData = () => {
        let exist = false
        dataManager.listTopping.forEach(data => {
            if (data.IdRoom == props.route.params.IdRoom) {
                exist = true
                data.Data = listTopping
            }
        })
        if (!exist) {
            dataManager.listTopping.push({ IdRoom: props.route.params.IdRoom, Data: listTopping })
        }
        console.log(dataManager.listTopping, 'dataManager.listTopping');

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
            <View key={item.Id} style={[styles.toppingItem, { backgroundColor: item.Quantity > 0 ? "#EED6A7" : "white" }]}>
                <View style={{ flex: 3, paddingRight: 10 }}>
                    <Text numberOfLines={2} style={{}}>{item.Name}</Text>
                    <Text numberOfLines={2} style={{ fontStyle: "italic", fontSize: 13, color: "gray" }}>{currencyToString(item.Price)}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 2, justifyContent: "space-between", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { handleButtonIncrease(item, index) }}>
                        <Text style={styles.button}>-</Text>
                    </TouchableOpacity>
                    <Text>{item.Quantity}</Text>
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
                    <TouchableOpacity style={{}} onPress={() => { onclose() }}>
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



