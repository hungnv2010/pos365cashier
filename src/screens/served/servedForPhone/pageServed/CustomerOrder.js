import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, Modal, ImageBackground, Platform, Keyboard, Image } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TextTicker from 'react-native-text-ticker';
import { currencyToString } from '../../../../common/Utils'
import I18n from "../../../../common/language/i18n"
import { Snackbar } from 'react-native-paper';
import colors from '../../../../theme/Colors';
import { ScreenList } from '../../../../common/ScreenList';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail'
import dialogManager from '../../../../components/dialog/DialogManager';

export default (props) => {

    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState(() =>
        (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0 )
        ? props.jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
        )
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [itemOrder, setItemOrder] = useState({})
    const [marginModal, setMargin] = useState(0)
    const [expand, setExpand] = useState(false)

    useEffect(() => {

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    const _keyboardDidShow = () => {
        // if (orientaition != Constant.PORTRAIT)
        setMargin(Metrics.screenWidth / 1.5)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    useEffect(() => {
        listOrder.forEach((elm, index) =>  elm.index = index)
    },[listOrder])

    useEffect(() => {
        if (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0) {
            let listOrder = props.jsonContent.OrderDetails.filter(item => item.ProductId > 0)
            setListOrder(listOrder)
        } else setListOrder([])
    }, [props.jsonContent])

    const sendOrder = async () => {
        console.log("sendOrder room ", props.route.params.room);
        props.navigation.navigate(ScreenList.Payment, { RoomId: props.route.params.room.Id, Name: props.route.params.room.Name, Position: props.Position });
    }

    const printKitchen = () => {
        // let jsonContent = props.jsonContent;
        // if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
        //     jsonContent.RoomName = props.route.params.Name
        // }
        // viewPrintRef.current.checkBeforePrintRef(jsonContent, true);
    }

    const removeItem = (item) => {
        console.log('removeItem ', item.Name, item.index);
        listOrder.splice(item.index, 1)
        props.outputListProducts([...listOrder])
    }

    const onClickTopping = (item, index) => {
        setItemOrder(item)
        props.navigation.navigate('Topping', { _onSelect: onCallBack, itemOrder: item, Position: props.Position, IdRoom: props.route.params.room.Id })
    }

    const onCallBack = (data) => {
        console.log('onCallBack from topping', data);
        mapToppingToList(data)
    }

    const mapToppingToList = (listTopping) => {
        console.log('mapToppingToList listTopping:', listTopping);
        console.log('mapToppingToList itemOrder ', itemOrder);

        const getInfoTopping = (lt) => {
            let description = '';
            let totalTopping = 0;
            let topping = []
            lt.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -${item.Name} x${item.Quantity} = ${currencyToString(item.Quantity * item.Price)};\n `
                    totalTopping += item.Quantity * item.Price
                    topping.push({ ExtraId: item.ExtraId, QuantityExtra: item.Quantity, Price: item.Price, Quantity: item.Quantity })
                }
            }) 
            return [description, totalTopping, topping]
        }
        let [description, totalTopping, topping] = getInfoTopping(listTopping)
        listOrder.forEach((element, index) => {
            if (element.ProductId == itemOrder.ProductId && index == itemOrder.index) {
                element.Description = description
                element.Topping = JSON.stringify(topping)
                element.TotalTopping = totalTopping

                let basePriceProduct = element.Price > element.TotalTopping ? element.Price - element.TotalTopping : 0
                element.Price = basePriceProduct + totalTopping
            }
        });
        setListOrder([...listOrder])
        props.outputListProducts([...listOrder])
    }

    const mapDataToList = (data) => {
        console.log("mapDataToList data ", data);
        listOrder.forEach((element, index, arr) => {
            if (element.ProductId == data.ProductId && index == itemOrder.index) {
                if (data.Quantity == 0) {
                    arr.splice(index, 1)
                }
                element.Description = data.Description
                element.Quantity = +data.Quantity
                element.IsLargeUnit = data.IsLargeUnit
            }
        });

        props.outputListProducts([...listOrder])
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

    const renderProduct = (item, index) => {
        return (
            <TouchableOpacity key={index} onPress={() => {
                if (item.ProductType == 2 && item.IsTimer) {
                    setToastDescription(I18n.t("ban_khong_co_quyen_dieu_chinh_mat_hang_thoi_gian"))
                    setShowToast(true)
                    return
                }
                setItemOrder({ ...item })
                setShowModal(!showModal)
            }}>
                <View style={styles.mainItem}>
                    <TouchableOpacity
                        style={{ paddingHorizontal: 5 }}
                        onPress={() => removeItem(item)}>
                        <Icon name="trash-can-outline" size={40} color="black" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, }}>
                        <TextTicker
                            style={{ fontWeight: "bold", marginBottom: 7 }}
                            duration={6000}
                            marqueeDelay={1000}>
                            {item.Name}
                        </TextTicker>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{}}>{item.IsLargeUnit ? currencyToString(item.PriceLargeUnit) : currencyToString(item.Price)} x </Text>
                            <View>
                                <Text style={{ color: Colors.colorchinh }}>{Math.round(item.Quantity * 1000) / 1000} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                            </View>
                        </View>

                        {item.Description != "" ?
                            <Text
                                style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}>
                                {item.Description}
                            </Text>
                            :
                            null}
                    </View>
                    <Icon style={{ paddingHorizontal: 5 }} name="bell-ring" size={20} color="grey" />
                    {item.ProductType == 2 && item.IsTimer ?
                        null
                        :
                        <TouchableOpacity
                            style={{ marginRight: 5, borderWidth: 1, borderRadius: 50, padding: 3, borderColor: Colors.colorchinh }}
                            onPress={() => onClickTopping(item)}>
                            <Icon name="puzzle" size={25} color={Colors.colorchinh} />
                        </TouchableOpacity>
                    }
                </View>
            </TouchableOpacity>
        )
    }

    const totalPrice = (orderDetails) => {

        console.log('getPrice', orderDetails);

        let total = 0;
        if (orderDetails && orderDetails.length > 0)
            orderDetails.forEach(item => {
                total += (item.Price) * item.Quantity
            });
        return total
    }

    const changTable = () => {
        hideMenu()
        if (listOrder && listOrder.length > 0) {
            hideMenu()
            props.navigation.navigate("ChangeTable", {
                FromRoomId: props.route.params.room.Id,
                FromPos: props.Position,
                Name: props.route.params.room.Name
            });
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    let {jsonContent} = props
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {listOrder.length > 0 ?
                    <FlatList
                        data={listOrder}
                        extraData={listOrder}
                        renderItem={({ item, index }) => renderProduct(item, index)}
                        keyExtractor={(item, index) => '' + index}
                    />
                    :
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 2 }}>
                        </ImageBackground>
                    </View>
                }
            </View>
            <View>
    
            <TouchableOpacity
                onPress={() => { setExpand(!expand) }}
                style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white", marginLeft: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                    <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 16, color: colors.colorchinh }}>{currencyToString(totalPrice(jsonContent.OrderDetails))}đ</Text>
                        {expand ?
                            <Icon style={{}} name="chevron-up" size={30} color="black" />
                            :
                            <Icon style={{}} name="chevron-down" size={30} color="black" />
                        }
                    </View>
                </View>
                {expand ?
                    <View style={{ marginLeft: 0 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text>{I18n.t('tong_chiet_khau')}</Text>
                            <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {currencyToString(jsonContent.Discount)}đ</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text>VAT ({jsonContent.VATRates}%)</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.VAT ? jsonContent.VAT : 0)}đ</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.Total)}đ</Text>
                            </View>
                        </View>
                    </View>
                    :
                    null
                }
            </TouchableOpacity>
            </View>
            <View style={styles.footerMenu}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 10 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={() => changTable()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('chuyen_ban')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {}} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="message" size={22} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('tam_tinh')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={printKitchen} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('bao_che_bien')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('thanh_toan')}</Text>
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
                            // marginBottom: Platform.OS == 'ios' ? Metrics.screenHeight / 2.5 : 0
                            marginBottom: Platform.OS == 'ios' ? marginModal : 0
                        }}>
                            <DialogProductDetail
                                    onClickTopping={() => onClickTopping(itemOrder)}
                                    item={itemOrder}
                                    getDataOnClick={(data) => {
                                        mapDataToList(data)
                                    }}
                                    setShowModal={() => {
                                        setShowModal(false)
                                    }} 
                            />
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

const styles = StyleSheet.create({
    mainItem: {
        borderBottomColor: "#ddd", borderBottomWidth: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 10,
        borderBottomColor: "#ABB2B9",
        borderBottomWidth: 0.5,
    },
    wrapTamTinh: {
        borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white"
    },
    tamTinh: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5
    },
    textTamTinh: {
        fontWeight: "bold"
    },
    totalPrice: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-around"
    },
    footerMenu: {
        height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center"
    },
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
    textPriceModal: {
        padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4
    },
    wrapTextPriceModal: {
        alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC"
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
    descModal: {
        height: 50,
        flex: 7,
        fontStyle: "italic",
        fontSize: 12,
        borderWidth: 0.5,
        borderRadius: 4,
        backgroundColor: "#D5D8DC",
        padding: 5, color: "#000"
    },
    textQuantityModal: {
        padding: 6,
        textAlign: "center",
        margin: 10,
        flex: 1,
        borderRadius: 4,
        borderWidth: 0.5,
        backgroundColor: "#D5D8DC", color: "#000"
    },
});

