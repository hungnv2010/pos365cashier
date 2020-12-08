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
import Entypo from 'react-native-vector-icons/Entypo';
import realmStore from '../../../../data/realm/RealmStore';
import dataManager from '../../../../data/DataManager';
import RetailToolbar from '../retailToolbar';

export default (props) => {


    // const [currentCommodity, setCurrentCommodity] = useState({})
    const [numberNewOrder, setNumberNewOrder] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState([])
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [expand, setExpand] = useState(false)
    const [customer, setCustomer] = useState("")
    const [isQuickPayment, setIsQuickPayment] = useState(false)
    const currentCommodity = useRef({})

    let serverEvents = null;

    useEffect(() => {
        console.log('retailCUstomeroder', props);
        getCommodityWaiting()
        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);


        return () => {
            if (serverEvents) serverEvents.removeAllListeners()
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    // useEffect(() => {
    //     updateServerEvent(listOrder, currentCommodity.current)
    // }, [listOrder])


    const getCommodityWaiting = async () => {
        serverEvents = await realmStore.queryServerEvents()
        let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
        newServerEvents = Object.values(newServerEvents)
        setNumberNewOrder(newServerEvents.length)
        if (newServerEvents.length == 0) {
            let newSE = await createNewServerEvent()
            currentCommodity.current = newSE
        } else {
            currentCommodity.current = newServerEvents[newServerEvents.length - 1]
            let jsonContent = JSON.parse(currentCommodity.current.JsonContent)
            setListOrder(jsonContent.OrderDetails)
        }

        serverEvents.addListener((collection, changes) => {
            if (changes.insertions.length || changes.modifications.length) {
                let newServerEvents = JSON.parse(JSON.stringify(serverEvents))
                newServerEvents = Object.values(newServerEvents)
                setNumberNewOrder(newServerEvents.length)
            }
        })
    }

    const _keyboardDidShow = () => {
        // if (orientaition != Constant.PORTRAIT)
        setMargin(Metrics.screenWidth / 1.5)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }


    const createNewServerEvent = async () => {
        let newServerEvent = await dataManager.createSeverEvent(Date.now(), "A")
        newServerEvent.JsonContent = JSON.stringify(dataManager.createJsonContentForRetail(newServerEvent.RoomId))
        console.log('newServerEvent', newServerEvent);
        return realmStore.insertServerEventForRetail(newServerEvent)
    }


    // const sendOrder = async () => {
    //     console.log("sendOrder room ", props.route.params.room);
    //     props.navigation.navigate(ScreenList.Payment, { RoomId: props.route.params.room.Id, Name: props.route.params.room.Name, Position: props.Position });
    // }

    // const printKitchen = () => {
    //     let jsonContent = props.jsonContent;
    //     if (!checkProcessedQuantityProduct(jsonContent)) {
    //         let data = dataManager.getDataPrintCook(jsonContent.OrderDetails)
    //         console.log("printKitchen data ", data);
    //         jsonContent.OrderDetails.forEach(element => {
    //             element.Processed = element.Quantity
    //         });
    //         console.log("printKitchen jsonContent ", jsonContent);
    //         props.handlerProcessedProduct(jsonContent)
    //         dispatch({ type: 'LIST_PRINT', listPrint: data })
    //         notification(I18n.t("bao_che_bien_thanh_cong"));
    //     } else {
    //         notification(I18n.t("cac_mon_ban_chon_dang_duoc_nha_bep_chuan_bi"));
    //     }
    // }

    const notification = (content) => {
        setToastDescription(content);
        setShowToast(true)
    }

    // const checkProcessedQuantityProduct = (jsonContent) => {
    //     let isProcessed = true;
    //     jsonContent.OrderDetails.forEach(element => {
    //         if (element.Processed < element.Quantity) {
    //             isProcessed = false;
    //         }
    //     });
    //     return isProcessed;
    // }

    const removeItem = (item) => {
        console.log('removeItem ', item.Name, item.index);
        listOrder.splice(item.index, 1)
        updateServerEvent(listOrder, currentCommodity.current)
        setListOrder([...listOrder])
    }


    // const getTotalPrice = () => {
    //     let total = 0;
    //     list.forEach(item => {
    //         if (!(item.ProductType == 2 && item.IsTimer)) {
    //             let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
    //             let totalTopping = item.TotalTopping ? item.TotalTopping : 0
    //             total += (price + totalTopping) * item.Quantity
    //         }
    //     })
    //     return total
    // }


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

    const onClickListedPrice = () => {
        console.log('onClickListedPrice');
    }

    const onCallBackCustomer = (data) => {
        console.log("onCallBackCustomer data ", data);
        setCustomer(data);
    }

    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
        props.navigation.navigate(ScreenList.Customer, { _onSelect: onCallBackCustomer })
    }

    const onClickPrint = () => {

    }

    const onClickOptionQuickPayment = () => {
        setIsQuickPayment(!isQuickPayment)
    }

    const onCLickQR = () => {
        props.navigation.navigate("QRCode", { _onSelect: onCallBack })
    }

    const onCLickNoteBook = () => {
        props.navigation.navigate("NoteBook", { _onSelect: onCallBack })
    }

    const onClickSync = () => {

    }

    const outputTextSearch = (text) => {
        console.log('outputTextSearch', text);
    }

    const onClickSelect = () => {
        props.navigation.navigate(ScreenList.RetailSelectProduct, { _onSelect: onCallBack, listProducts: listOrder })
    }

    const onCallBack = (data, type) => {
        switch (type) {
            case 1:
                updateServerEvent(data, currentCommodity.current)
                setListOrder(data)
                break;

            case 3:
                console.log('onCallBackonCallBack', data);
                currentCommodity.current = data
                let jsonContent = JSON.parse(currentCommodity.current.JsonContent)
                setListOrder(jsonContent.OrderDetails)
                break
            default:
                break;
        }
    }

    const updateServerEvent = (data, serverEvent) => {
        console.log('updateServerEvent', data, serverEvent);
        let jsonContent = JSON.parse(serverEvent.JsonContent)
        jsonContent.OrderDetails = [...data]
        dataManager.calculatateJsonContent(jsonContent)
        serverEvent.JsonContent = JSON.stringify(jsonContent)
        realmStore.insertServerEventForRetail(serverEvent)
    }

    const onClickNewOrder = async () => {
        if (listOrder.length == 0) {
            setToastDescription(I18n.t("moi_chon_mon_truoc"))
            setShowToast(true)
            return
        }
        let newSE = await createNewServerEvent()
        console.log('createNewServerEventcreateNewServerEvent', newSE);
        currentCommodity.current = newSE
        setListOrder([])
    }

    const onClickPayment = () => {
        console.log('onClickPayment', currentCommodity.current);
        if (isQuickPayment) {

        } else {

        }
    }

    return (
        <View style={{ flex: 1 }}>
            <RetailToolbar
                {...props}
                onClickSelect={onClickSelect}
                onCLickQR={onCLickQR}
                onCLickNoteBook={onCLickNoteBook}
                onClickSync={onClickSync}
                outputTextSearch={outputTextSearch} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickListedPrice}>
                    <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={Colors.colorchinh} />
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('gia_niem_yet')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickRetailCustomer}>
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{customer != "" ? customer.Name : I18n.t('khach_hang')}</Text>
                    <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                </TouchableOpacity>
            </View>
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
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{}đ</Text>
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
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {}đ</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text>VAT ({}%)</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{}đ</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{}đ</Text>
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
                        style={{ width: 220 }}
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 5 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5
                        }}>
                            <TouchableOpacity onPress={() => onClickPrint()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="printer" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16, flex: 1 }}>{I18n.t('in_tam_tinh')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onClickOptionQuickPayment()} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name={isQuickPayment ? "check-box-outline" : "close-box-outline"} size={26} color={isQuickPayment ? Colors.colorchinh : "#000"} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('thanh_toan_nhanh')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.navigation.navigate(ScreenList.CommodityWaiting, { _onSelect: onCallBack })
                }} style={{ flex: .5, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%", flexDirection: 'row' }}>
                    <Icon name="file-document-edit-outline" size={30} color="white" />
                    <View style={{ backgroundColor: Colors.colorchinh, borderRadius: 40, position: "absolute", right: 10, top: -5 }}>
                        <Text style={{ fontWeight: "bold", padding: 4, color: "white", fontSize: 14 }}>{numberNewOrder}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickNewOrder} style={{ flex: .8, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('don_hang_moi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickPayment} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", textAlign: "center" }}>{isQuickPayment ? I18n.t('thanh_toan_nhanh') : I18n.t('thanh_toan')}</Text>
                </TouchableOpacity>
            </View>
            {/* <Modal
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
            </Modal> */}
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

