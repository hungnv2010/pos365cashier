import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Image, View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, ImageBackground, FlatList, StyleSheet } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import dataManager from '../../../../data/DataManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ApiPath } from '../../../../data/services/ApiPath';
import dialogManager from '../../../../components/dialog/DialogManager';
import { HTTPService, URL } from '../../../../data/services/HttpService';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import { currencyToString } from '../../../../common/Utils';
import I18n from "../../../../common/language/i18n";
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, RadioButton } from 'react-native-paper';
import colors from '../../../../theme/Colors';
import { ScreenList } from '../../../../common/ScreenList';

var isClick = false;

const TYPE_MODAL = {
    UNIT: 1,
    DETAIL: 2
}

const CustomerOrder = (props) => {

    const [listPosition, setListPosition] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [list, setListOrder] = useState([])
    const [vendorSession, setVendorSession] = useState({})
    const [itemOrder, setItemOrder] = useState({})
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [IsLargeUnit, setIsLargeUnit] = useState(false)
    const typeModal = useRef(TYPE_MODAL.UNIT)
    const dispatch = useDispatch();

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });

    const deviceType = useSelector(state => {
        console.log("deviceType", state);
        return state.Common.deviceType
    });

    const historyOrder = useSelector(state => {
        console.log("state.historyOrder5 ", state.Common.historyOrder);
        return state.Common.historyOrder
    });


    useEffect(() => {
        console.log("Customer props ", props);
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data));
        }

        const init = () => {
            let tempListPosition = dataManager.dataChoosing.filter(item => item.Id == props.route.params.room.Id)
            if (tempListPosition && tempListPosition.length > 0) {
                console.log('from tempListPosition');
                setListPosition(tempListPosition[0].data)
            }
        }
        getVendorSession()
        init()

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            console.log(dataManager.dataChoosing, 'dataManager.dataChoosing');
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    const _keyboardDidShow = () => {
        if (orientaition != Constant.PORTRAIT)
            setMargin(Metrics.screenWidth / 2)

    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    useEffect(() => {
        setItemOrder(props.itemOrder)
    }, [props.itemOrder])


    useEffect(() => {
        props.outputPosition(props.Position)
    }, [props.Position])

    useEffect(() => {
        if (props.listProducts.length == 0) return
        let exist = false
        listPosition.forEach(element => {
            if (element.key == props.Position) {
                exist = true
                element.list = props.listProducts
            }
        })
        if (!exist) {
            listPosition.push({ key: props.Position, list: props.listProducts })
        }
        console.log(listPosition, 'listPosition');

        setListOrder([...props.listProducts])
        savePosition()
    }, [props.listProducts])

    useEffect(() => {
        console.log('useEffect props.Position', props.Position);
        let exist = false
        listPosition.forEach(element => {
            if (element.key == props.Position) {
                exist = true
                syncListProducts(element.list)
            }
        })
        if (!exist) {
            syncListProducts([])
        }
    }, [props.Position, listPosition])


    useEffect(() => {
        console.log(props.listTopping, 'props.listTopping');
        console.log(props.itemOrder, 'props.itemOrder');
        console.log(itemOrder, 'itemOrder');

        const getInfoTopping = (listTopping) => {
            let description = '';
            let totalPrice = 0;
            let topping = []
            listTopping.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -${item.Name} x${item.Quantity} = ${currencyToString(item.Quantity * item.Price)};\n `
                    totalPrice += item.Quantity * item.Price
                    topping.push({ ExtraId: item.ExtraId, QuantityExtra: item.Quantity, Price: item.Price, Quantity: item.Quantity })
                }
            })
            return [description, totalPrice, topping]
        }
        let [description, totalPrice, topping] = getInfoTopping(props.listTopping)
        list.forEach(element => {
            if (element.Sid == props.itemOrder.Sid) {
                element.Description = description
                element.Topping = JSON.stringify(topping)
                element.TotalTopping = totalPrice
            }
        });
        setListOrder([...list])
    }, [props.listTopping])


    const syncListProducts = (listProducts) => {
        console.log('syncListProducts');
        // setListOrder(listProducts)
        props.outputListProducts(listProducts, 0)
    }

    const savePosition = () => {
        let exist = false
        dataManager.dataChoosing.forEach(element => {
            if (element.Id == props.route.params.room.Id) {
                exist = true
                element.data = listPosition
            }
        })
        if (!exist) {
            dataManager.dataChoosing.push({ Id: props.route.params.room.Id, ProductId: props.route.params.room.ProductId, Name: props.route.params.room.Name, data: listPosition })
        }
        console.log(dataManager.dataChoosing, 'savePosition');
    }

    const sendOrder = () => {
        props.navigation.navigate(ScreenList.Payment, { totalPrice: 100000, RoomId: props.route.params.room.Id, Position: props.Position });
        return;

        if (list.length > 0 && isClick == false) {
            isClick = true;
            let ls = [];
            let listItem = [];
            ls = JSON.parse(JSON.stringify(list))
            console.log("sendOrder", ls, vendorSession);
            let params = {
                ServeEntities: []
            };

            ls.forEach(element => {
                let PriceConfig = element.PriceConfig ? JSON.parse(element.PriceConfig) : '';
                let obj = {
                    BasePrice: element.Price,
                    Code: element.Code,
                    Name: element.Name,
                    OrderQuickNotes: [],
                    Position: props.Position,
                    Price: element.Price,

                    Printer: element.Printer,
                    Printer3: PriceConfig && PriceConfig.Printer3 ? PriceConfig.Printer3 : null,
                    Printer4: PriceConfig && PriceConfig.Printer4 ? PriceConfig.Printer4 : null,
                    Printer5: PriceConfig && PriceConfig.Printer5 ? PriceConfig.Printer5 : null,
                    ProductId: element.Id,
                    Quantity: element.Quantity,
                    RoomId: props.route.params.room.Id,
                    RoomName: props.route.params.room.Name,
                    SecondPrinter: PriceConfig && PriceConfig.SecondPrinter ? PriceConfig.SecondPrinter : null,

                    Serveby: vendorSession.CurrentUser && vendorSession.CurrentUser.Id ? vendorSession.CurrentUser.Id : "",
                    Topping: element.Topping,
                    TotalTopping: element.TotalTopping,
                    Description: element.Description,
                    IsLargeUnit: element.IsLargeUnit,
                    PriceLargeUnit: element.PriceLargeUnit,
                }
                params.ServeEntities.push(obj)
                listItem.push({
                    Quantity: element.Quantity,
                    ProductType: element.ProductType,
                    IsTimer: element.IsTimer,
                    IsLargeUnit: element.IsLargeUnit,
                    PriceLargeUnit: element.PriceLargeUnit,
                    Price: element.Price,
                    TotalTopping: element.TotalTopping,
                    ProductImages: element.ProductImages,
                    Name: element.Name,
                    Description: element.Description,
                    Unit: element.Unit,
                    LargeUnit: element.LargeUnit
                })
            });
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.SAVE_ORDER).POST(params).then(async (res) => {
                console.log("sendOrder res ", res);
                // dialogManager.hiddenLoading()
                isClick = false;
                if (res) {
                    syncListProducts([])
                    let tempListPosition = dataManager.dataChoosing.filter(item => item.Id != props.route.params.room.Id)
                    dataManager.dataChoosing = tempListPosition;
                    let historyTemp = [];
                    // let history = await getFileDuLieuString(Constant.HISTORY_ORDER, true);
                    let history = [...historyOrder];
                    if (history != undefined) {
                        // history = JSON.parse(history)
                        let check = false;
                        if (history.length > 0)
                            history.forEach(el => {
                                if (URL.link.indexOf(el.shop) > -1) {
                                    check = true;
                                    if (el.list.length > 0) {
                                        el.list.push({
                                            time: new Date(),
                                            Position: props.Position,
                                            list: listItem, RoomId: props.route.params.room.Id,
                                            RoomName: props.route.params.room.Name,
                                        })
                                        if (el.list.length >= 50) {
                                            el.list = el.list.slice(1, 49);
                                        }
                                    }
                                }
                                historyTemp.push(el)
                            });

                        if (check == false) {
                            history.push(
                                {
                                    shop: URL.link,
                                    list: [{
                                        time: new Date(),
                                        Position: props.Position,
                                        list: listItem, RoomId: props.route.params.room.Id,
                                        RoomName: props.route.params.room.Name,
                                    }]
                                }
                            )
                            historyTemp = history;
                        }
                    } else {
                        historyTemp = [
                            {
                                shop: URL.link,
                                list: [{
                                    time: new Date(),
                                    Position: props.Position,
                                    list: listItem, RoomId: props.route.params.room.Id,
                                    RoomName: props.route.params.room.Name,
                                }]
                            }
                        ]
                    }
                    console.log("JSON.stringify(historyTemp) ", JSON.stringify(historyTemp));
                    setFileLuuDuLieu(Constant.HISTORY_ORDER, JSON.stringify(historyTemp))
                    dispatch({ type: 'HISTORY_ORDER', historyOrder: historyTemp })
                }
                dialogManager.hiddenLoading()
            }).catch((e) => {
                isClick = false;
                console.log("sendOrder err ", e);
                dialogManager.hiddenLoading()
            })
        } else {
            setToastDescription(I18n.t("ban_hay_chon_mon_an_truoc"))
            setShowToast(true)
        }
    }

    const dellAll = () => {
        if (list.length > 0) {
            dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_muon_xoa_toan_bo_mat_hang_da_chon'), I18n.t('thong_bao'), (value) => {
                if (value == 1) {
                    syncListProducts([])
                    let hasData = true
                    dataManager.dataChoosing.forEach(item => {
                        if (item.Id == props.route.params.room.Id) {
                            item.data = item.data.filter(it => it.key != props.Position)
                        }
                        if (item.data.length == 0) {
                            hasData = false
                        }
                    })
                    if (!hasData) {
                        dataManager.dataChoosing = dataManager.dataChoosing.filter(item => item.data.length > 0)
                        dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
                    }
                }
            })
        }

    }

    const removeItem = (item, index) => {
        console.log('delete', index, item);
        let hasData = true
        list.splice(index, 1)
        dataManager.dataChoosing.forEach(item => {
            if (item.Id == props.route.params.room.Id) {
                if (list.length == 0) {
                    item.data = item.data.filter(it => it.key != props.Position)
                }
            }
            if (item.data.length == 0) {
                hasData = false
            }
        })
        if (!hasData) {
            dataManager.dataChoosing = dataManager.dataChoosing.filter(item => item.data.length > 0)
            dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
        }
        syncListProducts(list)
    }

    const getTotalPrice = () => {
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

    const onClickTopping = (item) => {
        props.outputItemOrder(item)
    }

    const mapDataToList = (data) => {
        console.log("mapDataToList(data) ", data);
        list.forEach((element, idx, arr) => {
            if (element.Sid == data.Sid) {
                if (data.Quantity == 0) {
                    arr.splice(idx, 1)
                }
                element.Description = data.Description
                element.Quantity = +data.Quantity
                element.IsLargeUnit = data.IsLargeUnit
            }
        });
        props.outputListProducts(list, 0)
        console.log("mapDataToList(ls) ", list);

        let hasData = true
        dataManager.dataChoosing.forEach(item => {
            if (item.Id == props.route.params.room.Id) {
                if (list.length == 0) {
                    item.data = item.data.filter(it => it.key != props.Position)
                }
            }
            if (item.data.length == 0) {
                hasData = false
            }
        })
        if (!hasData) {
            dataManager.dataChoosing = dataManager.dataChoosing.filter(item => item.data.length > 0)
            dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
        }
    }


    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = () => {
        _menu.hide();
    };

    const showMenu = () => {
        _menu.show();
    };

    const sendNotidy = (type) => {
        console.log("sendNotidy type ", type);
        hideMenu();
        if (type == 1 && !props.route.params.room.IsActive) {
            setToastDescription(I18n.t("ban_hay_chon_mon_an_truoc"))
            setShowToast(true)
        } else
            props.outputSendNotify(type);
    }

    const onClickUnit = (item) => {
        if (item.Unit && item.Unit != "" && item.LargeUnit && item.LargeUnit != "") {
            typeModal.current = TYPE_MODAL.UNIT;
            setIsLargeUnit(item.IsLargeUnit)
            setItemOrder(item)
            setShowModal(true)
        }
    }

    const renderForTablet = (item, index) => {
        return (
            <TouchableOpacity key={index} onPress={() => {
                if (item.ProductType == 2 && item.IsTimer) {
                    setToastDescription(I18n.t("ban_khong_co_quyen_dieu_chinh_mat_hang_thoi_gian"))
                    setShowToast(true)
                    return
                }
                console.log("setItemOrder ", item);
                typeModal.current = TYPE_MODAL.DETAIL;
                setItemOrder({ ...item })
                setShowModal(!showModal)
            }}>
                <View style={{
                    borderBottomColor: "#ddd", borderBottomWidth: 0.5,
                    flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-evenly", padding: 5, backgroundColor: item.Sid == props.itemOrder.Sid ? "#EED6A7" : 'white', borderRadius: 10, marginBottom: 2
                }}>
                    <TouchableOpacity
                        style={{ marginRight: 5 }}
                        onPress={() => removeItem(item, index)}>
                        <Icon name="trash-can-outline" size={40} color="black" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "column", flex: 1, }}>
                        <Text style={{ fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{}}>{item.IsLargeUnit ? currencyToString(item.PriceLargeUnit) : currencyToString(item.Price)} x </Text>
                            <View onPress={() => onClickUnit(item)}>
                                {
                                    orientaition == Constant.PORTRAIT ?
                                        <Text style={{ color: Colors.colorchinh, }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                                        :
                                        <View>
                                            <Text style={{ color: Colors.colorchinh, }}>{item.IsLargeUnit ? (item.LargeUnit ? "/" + item.LargeUnit : "") : (item.Unit ? "/" + item.Unit : "")}</Text>
                                        </View>
                                }
                            </View>
                        </View>
                        <Text
                            style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}>
                            {item.Description}
                        </Text>
                    </View>
                    {
                        orientaition == Constant.PORTRAIT ?
                            null
                            :
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                {
                                    item.ProductType == 2 && item.IsTimer ?
                                        <View style={{
                                            flex: 1 / 2, alignItems: "center", paddingVertical: 10,
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: 1,
                                            },
                                            shadowOpacity: 0.18,
                                            shadowRadius: 1.00,
                                            elevation: 2,
                                            borderRadius: 2
                                        }}>
                                            <Text style={{}}>{Math.round(item.Quantity * 1000) / 1000}</Text>
                                        </View>
                                        :
                                        <View style={{ alignItems: "center", flexDirection: "row", }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (item.Quantity == 1) {
                                                        list.splice(index, 1)
                                                        syncListProducts(list)
                                                    } else {
                                                        item.Quantity--
                                                        setListOrder([...list])
                                                    }
                                                }}>
                                                <Icon name="minus-box" size={40} color={Colors.colorchinh} />
                                            </TouchableOpacity>
                                            <View style={{
                                                width: 60,
                                                height: 35,
                                                shadowColor: "#000",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 1,
                                                },
                                                shadowOpacity: 0.18,
                                                shadowRadius: 1.00,
                                                elevation: 2,
                                                borderRadius: 2,
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: "bold",
                                                    }}>{item.Quantity}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => {
                                                item.Quantity++
                                                setListOrder([...list])
                                            }}>
                                                <Icon name="plus-box" size={40} color={Colors.colorchinh} />
                                            </TouchableOpacity>
                                        </View>
                                }
                            </View>
                    }
                    {
                        item.ProductType == 2 && item.IsTimer ?
                            null
                            :
                            <TouchableOpacity
                                style={{ borderWidth: 1, borderRadius: 50, borderColor: Colors.colorchinh, }}
                                onPress={() => {
                                    props.outputItemOrder(item)
                                }}>
                                <Icon name="puzzle" size={25} color={Colors.colorchinh} style={{ padding: 5 }} />
                            </TouchableOpacity>
                    }
                </View>
            </TouchableOpacity>
        )
    }

    const onClickSubmitUnit = () => {
        let array = list.map(item => {
            if (item.Id == itemOrder.Id && item.Sid == itemOrder.Sid) {
                item.IsLargeUnit = IsLargeUnit
            }
            return item;
        })
        console.log("onClickSubmitUnit array ", array);

        setListOrder([...array])
        setShowModal(false)
    }

    const renderViewUnit = () => {
        return (
            <View >
                <View style={styles.headerModal}>
                    <Text style={styles.headerModalText}>{I18n.t('chon_dvt')}</Text>
                </View>

                <TouchableOpacity onPress={() => {
                    setIsLargeUnit(false)
                }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                    <RadioButton.Android
                        color="orange"
                        status={!IsLargeUnit ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setIsLargeUnit(false)
                        }}
                    />
                    <Text style={{ marginLeft: 20, fontSize: 20 }}>{itemOrder.Unit}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    setIsLargeUnit(true)
                }} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                    <RadioButton.Android
                        color="orange"
                        status={IsLargeUnit ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setIsLargeUnit(true)
                        }}
                    />
                    <Text style={{ marginLeft: 20, fontSize: 20 }}>{itemOrder.LargeUnit}</Text>
                </TouchableOpacity>

                <View style={[styles.wrapAllButtonModal, { justifyContent: "center", marginBottom: 10 }]}>
                    <TouchableOpacity onPress={() => onClickSubmitUnit()} style={{
                        backgroundColor: Colors.colorchinh, alignItems: "center",
                        margin: 2,
                        width: 100,
                        borderWidth: 1,
                        borderColor: Colors.colorchinh,
                        padding: 5,
                        borderRadius: 4,
                    }} >
                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>

            </View >
        )
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {list.length > 0 ?
                    <FlatList
                        data={list}
                        extraData={list}
                        renderItem={({ item, index }) => renderForTablet(item, index)}
                        keyExtractor={(item, index) => '' + index}
                    />
                    :
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 3 }}>
                        </ImageBackground>
                    </View>
                }
            </View>
            <View
                style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>{I18n.t('tam_tinh')}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#0072bc" }}>{currencyToString(getTotalPrice())}đ</Text>
                    </View>
                </View>
            </View>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 10 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={() => sendNotidy(1)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('yeu_cau_thanh_toan')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => sendNotidy(2)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="message" size={22} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('gui_thong_bao_toi_thu_ngan')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('gui_thuc_don')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={dellAll} style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 10, borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Icon name="delete-forever" size={30} color="white" />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => { setShowModal(false) }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }, { backgroundColor: 'rgba(0,0,0,0.5)' }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 0,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8,
                            marginBottom: Platform.OS == 'ios' ? marginModal : 0
                        }}>
                            {typeModal.current == TYPE_MODAL.DETAIL ?
                                <PopupDetail
                                    onClickTopping={() => onClickTopping(itemOrder)}
                                    item={itemOrder}
                                    getDataOnClick={(data) => {
                                        console.log("getDataOnClick ", data);
                                        mapDataToList(data)
                                    }}
                                    setShowModal={() => {
                                        console.log("getDataOnClick list ", list);
                                        setShowModal(false)
                                    }
                                    } />
                                :
                                renderViewUnit()
                            }
                        </View>
                    </View>
                </View>
            </Modal>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View>
    )
}

const PopupDetail = (props) => {

    const [itemOrder, setItemOrder] = useState({ ...props.item })
    const [showQuickNote, setShowQuickNote] = useState(false)
    const [listQuickNote, setListQuickNote] = useState([])
    const [IsLargeUnit, setIsLargeUnit] = useState(false)

    useEffect(() => {
        let list = itemOrder.OrderQuickNotes ? itemOrder.OrderQuickNotes.split(',') : [];
        let listQuickNote = []
        list.forEach((item, idx) => {
            if (item != '') {
                listQuickNote.push({ name: item.trim(), status: false })
            }
        })
        console.log('setListQuickNote1', list);
        setListQuickNote([...listQuickNote])
        setIsLargeUnit(itemOrder.IsLargeUnit)
    }, [])

    const onClickOk = () => {
        console.log("onClickOk itemOrder ", itemOrder);
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
                                let list = []
                                listQuickNote.forEach(item => {
                                    if (item.status) {
                                        list.push(item.name)
                                    }
                                })
                                itemOrder.Description = list.join(', ')
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

const styles = StyleSheet.create({
    headerModal: {
        backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4,
    },
    headerModalText: {
        margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, marginVertical: 10, color: "#fff"
    },
    button: {
        borderColor: Colors.colorchinh,
        borderWidth: 1,
        color: Colors.colorchinh,
        fontWeight: "bold",
        paddingHorizontal: 17,
        paddingVertical: 10,
        borderRadius: 5
    },
    wrapAllButtonModal: {
        alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 15
    },
    wrapButtonModal: {
        alignItems: "center",
        margin: 2,
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.colorchinh,
        padding: 5,
        borderRadius: 4,
        backgroundColor: "#fff"
    },
    buttonModal: {
        color: Colors.colorchinh, textTransform: "uppercase"
    },
});


export default React.memo(CustomerOrder)

