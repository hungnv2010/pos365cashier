import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Images } from '../../theme';
import { currencyToString, dateToString, momentToDateUTC, momentToDate } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import { Checkbox, RadioButton } from 'react-native-paper';
import colors from '../../theme/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import DatePicker from 'react-native-date-picker';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import { ApiPath } from '../../data/services/ApiPath';
import { HTTPService } from '../../data/services/HttpService';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import ProductManager from '../../data/objectManager/ProductManager'
import moment from "moment";

const TYPE_MODAL = {
    DEFAULT: 1,
    OPEN_DATE: 2,
    OPEN_TIME: 3
}

export default (props) => {

    const [itemOrder, setItemOrder] = useState({ ...props.item })
    const [showQuickNote, setShowQuickNote] = useState(false)
    const [listQuickNote, setListQuickNote] = useState([])
    const [IsLargeUnit, setIsLargeUnit] = useState(props.item.IsLargeUnit)
    const [percent, selectPercent] = useState(false)
    const [discount, setDiscount] = useState(() => {
        // props.item.Discount ? props.item.Discount : props.item.DiscountRatio ? props.item.Price * props.item.DiscountRatio / 100 : 0
        if (props.item.Discount) return props.item.Discount
        else if (props.item.DiscountRatio) {
            let basePrice = props.item.IsLargeUnit ? props.item.PriceLargeUnit: props.item.UnitPrice
            return basePrice * props.item.DiscountRatio / 100 
        }
    })
    const [price, setPrice] = useState(props.item.Price)
    const [typeModal, setTypeModal] = useState(TYPE_MODAL.DEFAULT);
    const [date, setDate] = useState( props.item.Checkin? moment.utc(props.item.Checkin).toDate() : new Date());
    const [dateOut, setDateOut] = useState(props.item.Checkout? moment.utc(props.item.Checkout).toDate() : new Date());
    const [isDateIn, setIsDateIn] = useState(true);
    const LargePrice = useRef(props.item.PriceLargeUnit)
    const UnitPrice = useRef(props.item.UnitPrice)
    const [productName, setProductName] = useState(props.item.Name)
    const [allowChangeNameProduct, setAllowChangeNameProduct] = useState(false)
    const [allowChangePriceProduct, setAllowChangePriceProduct] = useState(false)


    useEffect(() => {
        const getListQuickNote = () => {
            let listOrder = itemOrder.OrderQuickNotes ? itemOrder.OrderQuickNotes.split(',') : [];
            let listQuickNote = []
            listOrder.forEach((item, idx) => {
                if (item != '') {
                    listQuickNote.push({ name: item.trim(), status: false })
                }
            })
            setListQuickNote([...listQuickNote])
        }
        const getOtherPrice = async () => {
            if (!props.priceBookId) return
            let apiPath = ApiPath.PRICE_BOOK + `/${props.priceBookId}/manyproductprice`
            let params = { "pricebookId": props.priceBookId, "ProductIds": [itemOrder.ProductId] }
            let res = await new HTTPService().setPath(apiPath).POST(params)
            console.log('getOtherPrice res', res);
            if (res && res.PriceList && res.PriceList.length > 0) {
                res.PriceList.forEach((priceBook) => {
                    if (priceBook.ProductId == itemOrder.ProductId) {
                        itemOrder.DiscountRatio = 0.0
                        itemOrder.Discount = 0
                        if ('PriceLargeUnit' in priceBook) LargePrice.current = priceBook.PriceLargeUnit
                        if ('Price' in priceBook) UnitPrice.current = priceBook.Price
                    }
                })
            }
        }
        const getSetting = async () => {
            let data = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            data = JSON.parse(data)
            if (data) {
                setAllowChangeNameProduct(data.cho_phep_thay_doi_ten_hang_hoa_khi_ban_hang)
                setAllowChangePriceProduct(data.cho_phep_nhan_vien_thay_doi_gia_khi_ban_hang)

            }
        }
        getListQuickNote()
        getOtherPrice()
        getSetting()
    }, [])


    useDidMountEffect(() => {
        let price = (itemOrder.IsLargeUnit == true ? LargePrice.current : UnitPrice.current)
        let totalDiscount = percent ? price * discount / 100 : discount
        setPrice((price - totalDiscount > 0 ? price - totalDiscount : 0) + itemOrder.TotalTopping)
    }, [discount])

    useDidMountEffect(() => {
        let price = (itemOrder.IsLargeUnit == true ? LargePrice.current : UnitPrice.current)
        let newDiscount = percent ? discount||0 / price * 100 : discount||0 * price / 100
        console.log("useDidMountEffect newDiscount", newDiscount, typeof(newDiscount));
        
        setDiscount(newDiscount)
    }, [percent])

    useDidMountEffect(() => {
        setDiscount(0)
    }, [IsLargeUnit])

    const onClickOk = () => {
        props.onClickSubmit({ ...itemOrder, Discount: discount, Percent: percent, Price: price, Name: productName })
        props.setShowModal(false)
    }

    const onClickTopping = () => {
        if (itemOrder.ProductType == 2 && itemOrder.IsTimer){
            let newValue = !itemOrder.StopTimer

            itemOrder.StopTimer = newValue
            itemOrder.Checkout = momentToDate(moment().utc())

            if (newValue) {
                itemOrder.UnitPrice = itemOrder.Price
                itemOrder.PriceLargeUnit = itemOrder.Price
            } else {
                itemOrder.UnitPrice = itemOrder.BasePrice
                itemOrder.PriceLargeUnit = itemOrder.BasePrice
            }
            ProductManager.setProductTimeQuantityNormal(itemOrder)
            ProductManager.getProductTimePrice(itemOrder, newValue)
            setPrice(itemOrder.Price)
            setItemOrder({...itemOrder})
        } else {
            onClickOk()
            props.onClickTopping()
            props.setShowModal(false)
        }
    }

    const selectRadioButton = (status) => {
        itemOrder.IsLargeUnit = status
        setIsLargeUnit(status)
        if (status) {
            setPrice(LargePrice.current + itemOrder.TotalTopping)
        }
        else {
            setPrice(UnitPrice.current + itemOrder.TotalTopping)
        }
    }

    const dateTmp = useRef(new Date())
    const dateOutTmp = useRef(new Date())
    const onChangeDate = (selectedDate) => {
        console.log("onChangeTime Date ", selectedDate);
        const currentDate = isDateIn? dateTmp.current : dateOutTmp.current
        if (typeModal == TYPE_MODAL.OPEN_DATE) {
            let date = selectedDate.getDate();
            let month = selectedDate.getMonth();
            let year = selectedDate.getFullYear();
            currentDate.setDate(date)
            currentDate.setMonth(month)
            currentDate.setFullYear(year)
            console.log("onChangeTime Date ", currentDate);
        } else {
            let hours = selectedDate.getHours();
            let minutes = selectedDate.getMinutes();
            currentDate.setHours(hours)
            currentDate.setMinutes(minutes)
            console.log("onChangeTime Date ", currentDate);
        }
        currentDate.setSeconds(0)
        currentDate.setMilliseconds(0)
        if (isDateIn) dateTmp.current = currentDate
        else  dateOutTmp.current = currentDate;

    };

    const selectDateTime = () => {
        if(isDateIn) {
            setDate(dateTmp.current)
            itemOrder.Checkin = momentToDateUTC(dateTmp.current, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]")
            ProductManager.setProductTimeQuantityNormal(itemOrder)
            ProductManager.getProductTimePrice(itemOrder, true)
        
        } else {
            setDateOut(dateOutTmp.current)
            itemOrder.Checkout = momentToDateUTC(dateOutTmp.current, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]")
            ProductManager.setProductTimeQuantityNormal(itemOrder)
            ProductManager.getProductTimePrice(itemOrder, true)
        }
        setItemOrder({ ...itemOrder })
        setPrice(itemOrder.Price)
        setTypeModal(TYPE_MODAL.DEFAULT)
    }

    const openDateTimeModal = (typeModal, fromDateIn) => {
        setIsDateIn(fromDateIn) 
        setTypeModal(typeModal)
    }

    return (
        <View>
            <View style={{ backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4, }}>
                <TextInput
                    style={{ margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, marginVertical: 20, color: "#fff" }}
                    value={productName}
                    editable={allowChangeNameProduct}
                    onChangeText={(text) => {
                        setProductName(text)
                    }}>
                </TextInput>
            </View>
            {
                typeModal == TYPE_MODAL.OPEN_DATE || typeModal == TYPE_MODAL.OPEN_TIME ?
                    <View>
                        <DatePicker date={isDateIn? date : dateOut}
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
                    : // TYPE_MODAL.DEFAULT
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
                                    <TextInput
                                        style={{ color: "#000", padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}
                                        value={currencyToString(price)}
                                        editable={allowChangePriceProduct}
                                        //keyboardType="numbers-and-punctuation"
                                        onChangeText={text => {
                                            text = text.replace(/,/g, "");
                                            if (isNaN(text)) return
                                            setPrice(text)
                                        }}>
                                    </TextInput>
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
                                        keyboardType="numbers-and-punctuation"
                                        value={currencyToString(discount)}
                                        onChangeText={text => {
                                            text = text.replace(/,/g, "");
                                            if (isNaN(text)) return
                                            setDiscount(text)
                                        }}
                                        style={{ textAlign: "right", color: "#000", backgroundColor: "#D5D8DC", marginLeft: 10, flex: 1, borderWidth: 0.5, borderRadius: 5, padding: 6.8 }} />
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
                                            style={{ padding: 6, color: "#000", textAlign: "center", margin: 10, flex: 1, borderRadius: 4, borderWidth: 0.5, backgroundColor: "#D5D8DC", color: "#000" }}
                                            value={"" + itemOrder.Quantity} keyboardType="numbers-and-punctuation"
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
                                            placeholderTextColor="#808080"
                                            style={{ height: 50, color: "#000", paddingLeft: 5, flex: 7, fontStyle: "italic", fontSize: 12, borderWidth: 0.5, borderRadius: 4, backgroundColor: "#D5D8DC", color: "#000" }}
                                            placeholder={I18n.t('nhap_ghi_chu')} />
                                    </View>
                                </View>
                                :
                                <>
                                    <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => setShowModal(false)}>
                                        <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('gio_vao')}</Text>
                                        <View style={{ flex: 7, flexDirection: "row" }} >
                                            <View style={{ alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC" }}>
                                                <Text style={{ padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}>{dateToString(date, "DD/MM/YYYY HH:mm")}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => { openDateTimeModal(TYPE_MODAL.OPEN_DATE, true) }} style={{ marginLeft: 5, borderColor: colors.colorchinh, borderRadius: 5, borderWidth: 1, padding: 5, justifyContent: "center" }}>
                                                <Fontisto name="date" size={20} color={colors.colorchinh} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { openDateTimeModal(TYPE_MODAL.OPEN_TIME, true) }} style={{ marginLeft: 5, borderColor: colors.colorchinh, borderRadius: 5, borderWidth: 1, padding: 5, justifyContent: "center" }}>
                                                <AntDesign name="clockcircleo" size={20} color={colors.colorchinh} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {itemOrder.StopTimer ?
                                        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => setShowModal(false)}>
                                            <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('gio_ra')}</Text>
                                            <View style={{ flex: 7, flexDirection: "row" }} >
                                                <View style={{ alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC" }}>
                                                    <Text style={{ padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}>{dateToString(dateOut, "DD/MM/YYYY HH:mm")}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => { openDateTimeModal(TYPE_MODAL.OPEN_DATE, false) }} style={{ marginLeft: 5, borderColor: colors.colorchinh, borderRadius: 5, borderWidth: 1, padding: 5, justifyContent: "center" }}>
                                                    <Fontisto name="date" size={20} color={colors.colorchinh} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => { openDateTimeModal(TYPE_MODAL.OPEN_TIME, false) }} style={{ marginLeft: 5, borderColor: colors.colorchinh, borderRadius: 5, borderWidth: 1, padding: 5, justifyContent: "center" }}>
                                                    <AntDesign name="clockcircleo" size={20} color={colors.colorchinh} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    : null}
                                </>
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
                                <TouchableOpacity onPress={() => props.setShowModal(false)} style={{ alignItems: "center", margin: 4, marginLeft: 0, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: "#fff" }} >
                                    <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                {
                                    props.fromRetail ?
                                        null
                                        :
                                        <TouchableOpacity onPress={() => onClickTopping()} style={{ alignItems: "center", margin: 4, flex: 1.2, borderWidth: 1, borderColor: Colors.colorchinh, paddingVertical:10,paddingHorizontal:2, borderRadius: 4, backgroundColor: "#fff" }} >
                                            <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>
                                                {(itemOrder.ProductType == 2 && itemOrder.IsTimer) ? (itemOrder.StopTimer ? I18n.t('tinh_gio') : I18n.t('dung_tinh') ) :"Topping"}</Text>
                                        </TouchableOpacity>
                                }
                                <TouchableOpacity onPress={() => onClickOk()} style={{ alignItems: "center", margin: 4, marginRight: 0, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 10, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                                    <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
            }
        </View>
    )
}