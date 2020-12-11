import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Modal, ImageBackground, FlatList, StyleSheet } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Constant } from '../../../../common/Constant';
import { currencyToString } from '../../../../common/Utils';
import I18n from "../../../../common/language/i18n";
import { Snackbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { ScreenList } from '../../../../common/ScreenList';
import useDebounce from '../../../../customHook/useDebounce';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail'
import DialogProductUnit from '../../../../components/dialog/DialogProductUnit'
import dialogManager from '../../../../components/dialog/DialogManager';

const TYPE_MODAL = {
    UNIT: 1,
    DETAIL: 2
}

const CustomerOrder = (props) => {

    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState(() =>
        (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0)
            ? props.jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
    )
    const [itemOrder, setItemOrder] = useState({})
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [IsLargeUnit, setIsLargeUnit] = useState(false)
    const typeModal = useRef(TYPE_MODAL.UNIT)
    const [expand, setExpand] = useState(false)
    const [waitingList, setWaitingList] = useState([])
    const debouceWaitingList = useDebounce(waitingList)
    const [isQuickPayment, setIsQuickPayment] = useState(false)
    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });

    useEffect(() => {
        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
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
        listOrder.forEach((elm, index) => elm.index = index)
    }, [listOrder])

    useEffect(() => {
        setItemOrder(props.itemOrder)
    }, [props.itemOrder])


    useEffect(() => {
        props.outputPosition(props.Position)
    }, [props.Position])

    useEffect(() => {
        if (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0) {
            let listOrder = props.jsonContent.OrderDetails.filter(item => item.ProductId > 0)
            setListOrder(listOrder)
        } else setListOrder([])
    }, [props.jsonContent])

    useEffect(() => {
        console.log(props.listTopping, 'props.listTopping');
        console.log(props.itemOrder, 'props.itemOrder');

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
        let indexFind = -1
        listOrder.forEach((element, index) => {
            if (element.ProductId == props.itemOrder.ProductId && index == props.itemOrder.index) {
                indexFind = index
                element.Description = description
                element.Topping = JSON.stringify(topping)
                element.TotalTopping = totalPrice
            }
        });
        setListOrder([...listOrder])
        if (indexFind >= 0 && listOrder.length >= indexFind) mapDataToList(listOrder[indexFind], false)

    }, [props.listTopping])

    useEffect(() => {
        if (debouceWaitingList.length > 0) {
            debouceWaitingList.forEach(product => props.outputSelectedProduct(product, true))
            setWaitingList([])
        }
    }, [debouceWaitingList])

    const applyDialogDetail = (product) => {
        listOrder.forEach((elm, index) => {
            if (elm.ProductId == product.ProductId && index == product.index) elm = product
        })
        setListOrder([...listOrder])
        mapDataToList(product, true)
    }

    const mapDataToList = (product, isNow = true) => {
        if (isNow) props.outputSelectedProduct(product, true)
        else {
            let isExist = false
            waitingList.forEach(elm => {
                if (elm.ProductId == product.ProductId) {
                    isExist = true
                    elm = product
                }
            })
            if (!isExist) waitingList.push(product)
            setWaitingList([...waitingList])
        }
    }

    const removeItem = (product, index) => {
        console.log('removeItem', index, product);
        product.Quantity = 0
        product.index = index
        listOrder.splice(index, 1)
        props.outputSelectedProduct(product)
    }


    const onClickTopping = (item) => {
        props.outputItemOrder(item)
    }

    let _menu = null;

    const setMenuRef = ref => { _menu = ref };

    const hideMenu = () => { _menu.hide() };

    const showMenu = () => { _menu.show() };

    const onClickUnit = (item) => {
        if (item.Unit && item.Unit != "" && item.LargeUnit && item.LargeUnit != "") {
            typeModal.current = TYPE_MODAL.UNIT;
            setIsLargeUnit(item.IsLargeUnit)
            setItemOrder(item)
            setShowModal(true)
        }
    }

    const renderForTablet = (item, index) => {
        const isPromotion = !(item.IsPromotion == undefined || (item.IsPromotion == false))
        return (
            <>
                {
                    isPromotion && item.FisrtPromotion != undefined ?
                        <View style={{ backgroundColor: "#ffedd6", padding: 7, paddingHorizontal: 10 }}>
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khuyen_mai')}</Text>
                        </View>
                        : null
                }
                <TouchableOpacity key={index} onPress={() => {
                    if (isPromotion) return;
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
                        flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-evenly", padding: 5,
                        backgroundColor: index == props.itemOrder.index ? "#EED6A7" : 'white', borderRadius: 10, marginBottom: 2
                    }}>
                        <TouchableOpacity
                            style={{ marginRight: 5 }}
                            onPress={() => removeItem(item, index)}>
                            <Icon name={!isPromotion ? "trash-can-outline" : "gift"} size={40} color={!isPromotion ? "black" : Colors.colorLightBlue} />
                        </TouchableOpacity>
                        <View style={{ flexDirection: "column", flex: 1, }}>
                            <Text style={{ fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{}}>{isPromotion ? currencyToString(item.Price) : (item.IsLargeUnit ? currencyToString(item.PriceLargeUnit) : currencyToString(item.Price))} x </Text>
                                <View onPress={() => onClickUnit({ ...item })}>
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
                                (isPromotion ? null :
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
                                                                removeItem(item, index)
                                                            } else {
                                                                item.Quantity--
                                                                setListOrder([...listOrder])
                                                                mapDataToList(item, false)
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
                                                        setListOrder([...listOrder])
                                                        mapDataToList(item, false)
                                                    }}>
                                                        <Icon name="plus-box" size={40} color={Colors.colorchinh} />
                                                    </TouchableOpacity>
                                                </View>
                                        }
                                    </View>)
                        }
                        <View style={{ alignItems: "flex-end" }}>
                            <Icon style={{ paddingHorizontal: 5 }} name="bell-ring" size={20} color="grey" />
                            <Text
                                style={{ color: Colors.colorchinh, marginRight: 5 }}>
                                {isPromotion ? currencyToString(item.Price * item.Quantity) : (item.IsLargeUnit ? currencyToString(item.PriceLargeUnit * item.Quantity) : currencyToString(item.Price * item.Quantity))}
                            </Text>
                        </View>
                        {/* {
                            item.ProductType == 2 && item.IsTimer ?
                                null
                                :
                                <TouchableOpacity
                                    style={{ borderWidth: 1, borderRadius: 50, borderColor: Colors.colorchinh, }}
                                    onPress={() => {
                                        props.outputItemOrder(item, index)
                                    }}>
                                    <Icon name="puzzle" size={25} color={Colors.colorchinh} style={{ padding: 5 }} />
                                </TouchableOpacity>
                        } */}
                    </View>
                </TouchableOpacity>
            </>
        )
    }

    const onClickSubmitUnit = () => {
        let array = listOrder.map((item, index) => {
            if (item.ProductId == itemOrder.ProductId && index == itemOrder.index) {
                item.IsLargeUnit = IsLargeUnit
            }
            return item;
        })

        setListOrder([...array])
        setShowModal(false)
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

    const onClickPayment = () => {
        if (isQuickPayment) {

        } else {
            props.navigation.navigate(ScreenList.Payment, { RoomId: props.route.params.room.Id, Position: props.Position });
        }
    }

    const onClickOptionQuickPayment = () => {
        setIsQuickPayment(!isQuickPayment)
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {listOrder.length > 0 ?
                    <FlatList
                        data={listOrder}
                        extraData={listOrder}
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

            <View>

                <TouchableOpacity
                    onPress={() => { setExpand(!expand) }}
                    style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white", marginLeft: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                        <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{currencyToString(props.jsonContent.Total)}</Text>
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
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {currencyToString(props.jsonContent.Discount)}đ</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>VAT ({props.jsonContent.VATRates}%)</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(props.jsonContent.VAT ? props.jsonContent.VAT : 0)}đ</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(props.jsonContent.Total)}</Text>
                                </View>
                            </View>
                        </View>
                        :
                        null
                    }
                </TouchableOpacity>
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
                            <TouchableOpacity onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('tach_ban')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={changTable} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('chuyen_ban')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_tam_tinh')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="message" size={22} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_tem')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClickOptionQuickPayment} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name={isQuickPayment ? "check-box-outline" : "close-box-outline"} size={26} color={isQuickPayment ? Colors.colorchinh : "#000"} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('thanh_toan_nhanh')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { }} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('bao_che_bien')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onClickPayment()} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{isQuickPayment ? I18n.t('thanh_toan_nhanh') : I18n.t('thanh_toan')}</Text>
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
                                <DialogProductDetail
                                    onClickTopping={() => onClickTopping(itemOrder)}
                                    item={itemOrder}
                                    getDataOnClick={(data) => {
                                        applyDialogDetail(data)
                                    }}
                                    setShowModal={() => {
                                        setShowModal(false)
                                    }}
                                />
                                :
                                <DialogProductUnit
                                    setIsLargeUnit={(IsLargeUnit) => setIsLargeUnit(IsLargeUnit)}
                                    onClickSubmitUnit={() => onClickSubmitUnit()}
                                />
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

