import React, { useEffect, useState } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Images } from '../../theme';
import { currencyToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import colors from '../../theme/Colors';

export default (props) => {

    const [itemOrder, setItemOrder] = useState({ ...props.item })
    const [showQuickNote, setShowQuickNote] = useState(false)
    const [listQuickNote, setListQuickNote] = useState([])
    const [IsLargeUnit, setIsLargeUnit] = useState(false)

    useEffect(() => {
        let listOrder = itemOrder.OrderQuickNotes ? itemOrder.OrderQuickNotes.split(',') : [];
        let listQuickNote = []
        listOrder.forEach((item, idx) => {
            if (item != '') {
                listQuickNote.push({ name: item.trim(), status: false })
            }
        })
        setListQuickNote([...listQuickNote])
        setIsLargeUnit(itemOrder.IsLargeUnit)
    }, [])

    const onClickOk = () => {
        props.getDataOnClick({ ...itemOrder, IsLargeUnit: IsLargeUnit })
        props.setShowModal(false)
    }

    const onClickTopping = () => {
        props.onClickTopping()
        props.setShowModal(false)
    }

    return (
        <View>
            <View style={{ backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4, }}>
                <Text style={{ margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, marginVertical: 20, color: "#fff" }}>{itemOrder.Name}</Text>
            </View>
            {
                showQuickNote && listQuickNote.length > 0 ?
                    <View style={{ padding: 20 }}>
                        <View style={{ paddingBottom: 20 }}>
                            {
                                listQuickNote.map((item, index) => {
                                    return (
                                        <TouchableOpacity key={index} style={{ flexDirection: "row", alignItems: "center", }}
                                            onPress={() => {
                                                listQuickNote[index].status = !listQuickNote[index].status
                                                setListQuickNote([...listQuickNote])
                                            }}>
                                            <Checkbox.Android
                                                color="orange"
                                                status={item.status ? 'checked' : 'unchecked'}
                                            />
                                            <Text style={{ marginLeft: 20 }}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 20 }}>
                            <TouchableOpacity onPress={() => { setShowQuickNote(false) }} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: "#fff" }} >
                                <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                let listOrder = []
                                listQuickNote.forEach(item => {
                                    if (item.status) {
                                        listOrder.push(item.name)
                                    }
                                })
                                itemOrder.Description = listOrder.join(', ')
                                setItemOrder({ ...itemOrder })
                                onClickOk()
                            }} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: Colors.colorchinh }}>
                                <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    :
                    <View style={{ padding: 20 }}>
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => setShowModal(false)}>
                            <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('don_gia')}</Text>
                            <View style={{ alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC" }}>
                                <Text style={{ padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}>{currencyToString(itemOrder.Price)}</Text>
                            </View>
                        </View>
                        {itemOrder.Unit != undefined && itemOrder.Unit != "" && itemOrder.LargeUnit != undefined && itemOrder.LargeUnit != "" ?
                            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, alignItems: "center" }} onPress={() => setShowModal(false)}>
                                <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('chon_dvt')}</Text>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 7 }}>
                                    <TouchableOpacity onPress={() => {
                                        setIsLargeUnit(false)
                                    }} style={{ flexDirection: "row", alignItems: "center", marginLeft: -10 }}>
                                        <RadioButton.Android
                                            color={colors.colorchinh}
                                            status={!IsLargeUnit ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                setIsLargeUnit(false)
                                            }}
                                        />
                                        <Text style={{ marginLeft: 0 }}>{itemOrder.Unit}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => {
                                        setIsLargeUnit(true)
                                    }} style={{ flexDirection: "row", alignItems: "center" }}>
                                        <RadioButton.Android
                                            color={colors.colorchinh}
                                            status={IsLargeUnit ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                setIsLargeUnit(true)
                                            }}
                                        />
                                        <Text style={{ marginLeft: 0 }}>{itemOrder.LargeUnit}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            : null}
                        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: (itemOrder.Unit != undefined && itemOrder.Unit != "" && itemOrder.LargeUnit != undefined && itemOrder.LargeUnit != "") ? 10 : 20 }} >
                            <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('so_luong')}</Text>
                            <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                                <TouchableOpacity onPress={() => {
                                    if (itemOrder.Quantity > 0) {
                                        itemOrder.Quantity--
                                        setItemOrder({ ...itemOrder })
                                    }
                                }}>
                                    <Text style={{ borderColor: Colors.colorchinh, borderWidth: 1, color: Colors.colorchinh, fontWeight: "bold", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5 }}>-</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={{ padding: 6, textAlign: "center", margin: 10, flex: 1, borderRadius: 4, borderWidth: 0.5, backgroundColor: "#D5D8DC", color: "#000" }}
                                    value={"" + itemOrder.Quantity}
                                    onChangeText={text => {
                                        if (!Number.isInteger(+text) || +text > 1000) return
                                        itemOrder.Quantity = +text
                                        setItemOrder({ ...itemOrder })

                                    }} />
                                <TouchableOpacity onPress={() => {
                                    if (itemOrder.Quantity < 1000) {
                                        itemOrder.Quantity++
                                        setItemOrder({ ...itemOrder })
                                    }
                                }}>
                                    <Text style={{ borderColor: Colors.colorchinh, borderWidth: 1, color: Colors.colorchinh, fontWeight: "bold", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5 }}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 20 }} onPress={() => setShowModal(false)}>
                            <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('ghi_chu')}</Text>
                            <View style={{ flexDirection: "row", flex: 7 }}>
                                <TextInput
                                    onChangeText={text => {
                                        itemOrder.Description = text
                                        setItemOrder({ ...itemOrder })
                                    }}
                                    numberOfLines={3}
                                    multiline={true}
                                    value={itemOrder.Description}

                                    style={{ height: 50, paddingLeft: 5, flex: 7, fontStyle: "italic", fontSize: 12, borderWidth: 0.5, borderRadius: 4, backgroundColor: "#D5D8DC", color: "#000" }}
                                    placeholder={I18n.t('nhap_ghi_chu')} />
                            </View>
                        </View>
                        {
                            itemOrder.OrderQuickNotes != undefined && itemOrder.OrderQuickNotes != "" ?
                                <View style={{ paddingVertical: 5, flexDirection: "row", justifyContent: "center", marginTop: 10 }} onPress={() => setShowModal(false)}>
                                    <Text style={{ fontSize: 14, flex: 3 }}></Text>
                                    <View style={{ flexDirection: "row", flex: 7 }}>
                                        <TouchableOpacity
                                            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                                            onPress={() => {
                                                setShowQuickNote(true)
                                            }}>
                                            <Image style={{ width: 20, height: 20 }} source={Images.icon_quick_note} />
                                            {/* <Icon name="square-edit-outline" size={30} color="#2381E5" /> */}
                                            <Text style={{ color: "#2381E5", marginLeft: 10 }}>{I18n.t('chon_ghi_chu_nhanh')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                :
                                null
                        }
                        <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 20 }}>
                            <TouchableOpacity onPress={() => props.setShowModal(false)} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: "#fff" }} >
                                <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickTopping()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: "#fff" }} >
                                <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Topping</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickOk()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                                <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            }
        </View>
    )
}