import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Images } from '../../theme';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import colors from '../../theme/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import DatePicker from 'react-native-date-picker';

const TYPE_MODAL = {
    DEFAULT: 1,
    OPEN_DATE: 2,
    OPEN_TIME: 3
}

export default (props) => {

    const [itemOrder, setItemOrder] = useState({ ...props.item })
    const [showQuickNote, setShowQuickNote] = useState(false)
    const [listQuickNote, setListQuickNote] = useState([])
    const [IsLargeUnit, setIsLargeUnit] = useState(false)
    const [percent, selectPercent] = useState(false)
    const [discount, setDiscount] = useState(props.item.Discount ? props.item.Discount : 0)
    const [price, setPrice] = useState(props.item.Price)
    const [typeModal, setTypeModal] = useState(TYPE_MODAL.DEFAULT);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        console.log('itemOrderitemOrder', props.item);
        let listOrder = itemOrder.OrderQuickNotes ? itemOrder.OrderQuickNotes.split(',') : [];
        let listQuickNote = []
        listOrder.forEach((item, idx) => {
            if (item != '') {
                listQuickNote.push({ name: item.trim(), status: false })
            }
        })
        setListQuickNote([...listQuickNote])
        setIsLargeUnit(itemOrder.IsLargeUnit)
        setPrice(itemOrder.IsLargeUnit == true ? itemOrder.PriceLargeUnit : itemOrder.Price)
    }, [])

    useEffect(() => {
        let price = itemOrder.IsLargeUnit == true ? itemOrder.PriceLargeUnit : itemOrder.UnitPrice
        let totalDiscount = percent ? itemOrder.UnitPrice * discount / 100 : discount
        setPrice(price - totalDiscount > 0 ? price - totalDiscount : 0)
    }, [discount, percent])

    const onClickOk = () => {
        props.onClickSubmit({ ...itemOrder, Discount: discount, Percent: percent, Price: price })
        props.setShowModal(false)
    }

    const onClickTopping = () => {
        props.onClickTopping()
        props.setShowModal(false)
    }

    const selectRadioButton = (status) => {
        setIsLargeUnit(status)
        if (status)
            setPrice(itemOrder.PriceLargeUnit)
        else
            setPrice(itemOrder.UnitPrice)
    }

    const dateTmp = useRef(new Date())
    const onChangeDate = (selectedDate) => {
        console.log("onChangeTime Date ", selectedDate);
        const currentDate = dateTmp.current;
        if (typeModal == TYPE_MODAL.OPEN_DATE) {
            let date = selectedDate.getDate();
            let month = selectedDate.getMonth();
            let year = selectedDate.getFullYear();
            currentDate.setDate(date)
            currentDate.setMonth(month)
            currentDate.setFullYear(year)
            console.log("onChangeTime Date ", currentDate);
            dateTmp.current = currentDate;
        } else {
            // const currentDate = dateTmp.current;
            let hours = selectedDate.getHours();
            let minutes = selectedDate.getMinutes();
            currentDate.setHours(hours)
            currentDate.setMinutes(minutes)
            console.log("onChangeTime Date ", currentDate);
            dateTmp.current = currentDate;
        }
    };

    const selectDateTime = () => {
        console.log("selectDateTime dateTmp.current ", dateTmp.current);
        setDate(dateTmp.current)
        setTypeModal(TYPE_MODAL.DEFAULT)
    }

    return (
        <View>
            <View style={{ backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4, }}>
                <Text style={{ margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, marginVertical: 20, color: "#fff" }}>{itemOrder.Name}</Text>
            </View>
            {
                typeModal == TYPE_MODAL.OPEN_DATE || typeModal == TYPE_MODAL.OPEN_TIME ?
                    <View>
                        <DatePicker date={date}
                            onDateChange={onChangeDate}
                            mode={typeModal == TYPE_MODAL.OPEN_DATE ? 'date' : 'time'}
                            display="default"
                            locale="vi-VN" />
                        <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 5, padding: 10 }}>
                            <TouchableOpacity onPress={() => setTypeModal(TYPE_MODAL.DEFAULT)} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: "#fff" }} >
                                <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => selectDateTime()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                                <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    :
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
                                    <Text style={{ padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}>{currencyToString(price)}</Text>
                                </View>
                            </View>
                            {itemOrder.Unit != undefined && itemOrder.Unit != "" && itemOrder.LargeUnit != undefined && itemOrder.LargeUnit != "" ?
                                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, alignItems: "center" }} onPress={() => setShowModal(false)}>
                                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('chon_dvt')}</Text>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 7 }}>
                                        <TouchableOpacity onPress={() => {
                                            selectRadioButton(false)
                                        }} style={{ flexDirection: "row", alignItems: "center", marginLeft: -10 }}>
                                            <RadioButton.Android
                                                color={colors.colorchinh}
                                                status={!IsLargeUnit ? 'checked' : 'unchecked'}
                                                onPress={() => {
                                                    selectRadioButton(false)
                                                }}
                                            />
                                            <Text style={{ marginLeft: 0 }}>{itemOrder.Unit}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => {
                                            selectRadioButton(true)
                                        }} style={{ flexDirection: "row", alignItems: "center" }}>
                                            <RadioButton.Android
                                                color={colors.colorchinh}
                                                status={IsLargeUnit ? 'checked' : 'unchecked'}
                                                onPress={() => {
                                                    selectRadioButton(true)
                                                }}
                                            />
                                            <Text style={{ marginLeft: 0 }}>{itemOrder.LargeUnit}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                : null}

                            {/* {
                            props.fromRetail ? */}
                            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 20 }} >
                                <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('chiet_khau')}</Text>
                                <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                                    <View style={{ flexDirection: "row", flex: 1 }}>
                                        <TouchableOpacity onPress={() => selectPercent(false)} style={{ flex: 1, width: 55, alignItems: "center", borderWidth: 0.5, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingVertical: 7, borderColor: colors.colorchinh, backgroundColor: !percent ? colors.colorchinh : "#fff" }}>
                                            <Text style={{ color: !percent ? "#fff" : "#000" }}>VNĐ</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => selectPercent(true)} style={{ flex: 1, width: 55, alignItems: "center", borderWidth: 0.5, borderColor: colors.colorchinh, borderTopRightRadius: 5, borderBottomRightRadius: 5, paddingVertical: 7, backgroundColor: !percent ? "#fff" : colors.colorchinh }}>
                                            <Text style={{ color: percent ? "#fff" : "#000" }}>%</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        returnKeyType='done'
                                        keyboardType="numeric"
                                        value={currencyToString(discount)}
                                        onChangeText={text => {
                                            text = text.replace(/,/g, "");
                                            if (isNaN(text)) return
                                            setDiscount(text)
                                        }}
                                        style={{ textAlign: "right", backgroundColor: "#D5D8DC", marginLeft: 10, flex: 1, borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
                                </View>
                            </View>
                            {/* :
                                null
                        } */}

                            {!(itemOrder.ProductType == 2 && itemOrder.IsTimer) ?
                                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 20 }} >
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
                                                if (isNaN(text) || text.length > 4) return
                                                if (itemOrder.SplitForSalesOrder || (itemOrder.ProductType == 2 && itemOrder.IsTimer)) {
                                                    itemOrder.Quantity = Math.round(+text)
                                                } else {
                                                    itemOrder.Quantity = text
                                                }
                                                setItemOrder({ ...itemOrder })
                                            }}
                                        />
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
                                : null}
                            {!(itemOrder.ProductType == 2 && itemOrder.IsTimer) ?
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
                                :
                                <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => setShowModal(false)}>
                                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('gio_vao')}</Text>
                                    <View style={{ flex: 7, flexDirection: "row" }} >
                                        <View style={{ alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC" }}>
                                            <Text style={{ padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}>{dateToString(date, "DD/MM/YYYY HH:mm")}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => { setTypeModal(TYPE_MODAL.OPEN_DATE) }} style={{ marginLeft: 5, borderColor: colors.colorchinh, borderRadius: 5, borderWidth: 1, padding: 5, justifyContent: "center" }}>
                                            <Fontisto name="date" size={20} color={colors.colorchinh} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { setTypeModal(TYPE_MODAL.OPEN_TIME) }} style={{ marginLeft: 5, borderColor: colors.colorchinh, borderRadius: 5, borderWidth: 1, padding: 5, justifyContent: "center" }}>
                                            <AntDesign name="clockcircleo" size={20} color={colors.colorchinh} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
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
                                <TouchableOpacity onPress={() => props.setShowModal(false)} style={{ alignItems: "center", margin: 2, marginLeft: 0, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: "#fff" }} >
                                    <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                {
                                    props.fromRetail ?
                                        null
                                        :
                                        <TouchableOpacity onPress={() => onClickTopping()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: "#fff" }} >
                                            <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Topping</Text>
                                        </TouchableOpacity>
                                }
                                <TouchableOpacity onPress={() => onClickOk()} style={{ alignItems: "center", margin: 2, marginRight: 0, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                                    <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
            }
        </View>
    )
}