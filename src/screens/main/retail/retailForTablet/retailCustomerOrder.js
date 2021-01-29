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
import { useSelector , useDispatch} from 'react-redux';
import { ScreenList } from '../../../../common/ScreenList';
import DialogProductDetail from '../../../../components/dialog/DialogProductDetail'
import realmStore from '../../../../data/realm/RealmStore';
import dataManager from '../../../../data/DataManager';
import _, { map } from 'underscore';
import { ApiPath } from '../../../../data/services/ApiPath';
import { HTTPService } from '../../../../data/services/HttpService';
import Entypo from 'react-native-vector-icons/Entypo';


const TYPE_MODAL = {
    // UNIT: 1,
    DETAIL: 2
}

const RetailCustomerOrder = (props) => {

    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false)
    const [listOrder, setListOrder] = useState(() =>
        (props.jsonContent.OrderDetails && props.jsonContent.OrderDetails.length > 0)
            ? props.jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
    )
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [marginModal, setMargin] = useState(0)
    const [numberCommodity, setNumberCommodity] = useState(props.numberCommodity)
    const [expand, setExpand] = useState(false)
    const typeModal = useRef(TYPE_MODAL.DETAIL)
    const [itemOrder, setItemOrder] = useState({})

    const [isQuickPayment, setIsQuickPayment] = useState(false)
    const [promotions, setPromotions] = useState([])

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });



    useEffect(() => {
        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
        const getDataRealm = async () => {
            let promotions = await realmStore.querryPromotion();
            console.log("promotions === ", promotions);
            setPromotions(promotions)

        }
        getDataRealm();
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    useEffect(() => {
        setNumberCommodity(props.numberCommodity)
    }, [props.numberCommodity])

    useEffect(() => {
        console.log('props.jsonContent.OrderDetails', props.jsonContent);
        const getPromotion = async () => {
            if (JSON.stringify(props.jsonContent) != "{}") {
                let list = []
                list = await addPromotion([...props.jsonContent.OrderDetails])
                setListOrder(list)
            }
        }
        getPromotion()
    }, [props.jsonContent])


    useEffect(() => {
        listOrder.forEach((elm, index) => elm.index = index)
    }, [listOrder])





    const syncListProducts = (data) => {
        props.outputSelectedProduct(data, 2)
    }




    const _keyboardDidShow = () => {
        if (orientaition != Constant.PORTRAIT)
            setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }

    const applyDialogDetail = (product) => {
        console.log('applyDialogDetail', product);
        let price = product.IsLargeUnit == true ? product.PriceLargeUnit : product.UnitPrice
        let discount = product.Percent ? (price * product.Discount / 100) : product.Discount
        listOrder.forEach((elm, index, arr) => {
            if (elm.ProductId == product.ProductId && index == product.index) {
                if (product.Quantity == 0) {
                    arr.splice(index, 1)
                }
                elm.Quantity = product.Quantity
                elm.Description = product.Description
                elm.Discount = discount - price > 0 ? price : discount
                elm.Price = product.Price
            }
        })
        syncListProducts([...listOrder])

    }

    const setDataOrder = async (listOrder) => {
        let list = [];
        if (listOrder != undefined && listOrder.length > 0)
            list = await addPromotion([...listOrder])
        console.log("setDataOrder listOrder list ", listOrder, list);

        setListOrder([...list])

    }

    const removeItem = (product, index) => {
        console.log('removeItem', index, product);
        listOrder.splice(index, 1)
        syncListProducts(listOrder)
    }

    const onClickNewOrder = async () => {
        if (listOrder.length == 0) {
            setToastDescription(I18n.t("moi_chon_mon_truoc"))
            setShowToast(true)
            return
        }
        props.onClickNewOrder()
    }

    const addPromotion = async (list) => {
        console.log("addPromotion list ", list);
        console.log("addPromotion promotions ", promotions);
        let listProduct = await realmStore.queryProducts()
        // console.log("addPromotion listProduct:::: ", listProduct);

        let listNewOrder = list.filter(element => (element.IsPromotion == undefined || (element.IsPromotion == false)))
        let listOldPromotion = list.filter(element => (element.IsPromotion != undefined && (element.IsPromotion == true)))
        console.log("listNewOrder listOldPromotion ==:: ", listNewOrder, listOldPromotion);

        var DataGrouper = (function () {
            var has = function (obj, target) {
                return _.any(obj, function (value) {
                    return _.isEqual(value, target);
                });
            };

            var keys = function (data, names) {
                return _.reduce(data, function (memo, item) {
                    var key = _.pick(item, names);
                    if (!has(memo, key)) {
                        memo.push(key);
                    }
                    return memo;
                }, []);
            };

            var group = function (data, names) {
                var stems = keys(data, names);
                return _.map(stems, function (stem) {
                    return {
                        key: stem,
                        vals: _.map(_.where(data, stem), function (item) {
                            return _.omit(item, names);
                        })
                    };
                });
            };

            group.register = function (name, converter) {
                return group[name] = function (data, names) {
                    return _.map(group(data, names), converter);
                };
            };

            return group;
        }());

        DataGrouper.register("sum", function (item) {
            console.log("register item ", item);

            return _.extend({ ...item.vals[0] }, item.key, {
                Quantity: _.reduce(item.vals, function (memo, node) {
                    return memo + Number(node.Quantity);
                }, 0)
            });
        });

        let listGroupByQuantity = DataGrouper.sum(listNewOrder, ["Id", "IsLargeUnit"])

        console.log("listGroupByQuantity === ", listGroupByQuantity);

        let listPromotion = [];
        let index = 0;
        listGroupByQuantity.forEach(element => {
            promotions.forEach(async (item) => {
                if ((element.IsPromotion == undefined || (element.IsPromotion == false)) && element.Id == item.ProductId && checkEndDate(item.EndDate) && (item.IsLargeUnit == element.IsLargeUnit && element.Quantity >= item.QuantityCondition)) {
                    let promotion = listProduct.filtered(`Id == ${item.ProductPromotionId}`)
                    promotion = JSON.parse(JSON.stringify(promotion[0]));
                    // let promotion = JSON.parse(item.Promotion)
                    console.log("addPromotion item:::: ", promotion);
                    if (index == 0) {
                        promotion.FisrtPromotion = true;
                    }

                    let quantity = Math.floor(element.Quantity / item.QuantityCondition)
                    promotion.Quantity = quantity

                    if (listOldPromotion.length > 0) {
                        let oldPromotion = listOldPromotion.filter(el => promotion.Id == el.Id)
                        if (oldPromotion.length == 1) {
                            promotion = oldPromotion[0];
                            promotion.Quantity = quantity;
                        }
                    }

                    promotion.Price = item.PricePromotion;
                    promotion.IsLargeUnit = item.ProductPromotionIsLargeUnit;
                    promotion.IsPromotion = true;
                    promotion.ProductId = promotion.Id
                    promotion.Description = element.Quantity + " " + element.Name + ` ${I18n.t('khuyen_mai_')} ` + Math.floor(element.Quantity / item.QuantityCondition);

                    console.log("addPromotion promotion ", promotion, index);
                    listPromotion.push(promotion)
                    index++;
                }
            });
        });
        console.log("addPromotion listPromotion:: ", listPromotion);
        listNewOrder = listNewOrder.concat(listPromotion);
        console.log("addPromotion listNewOrder::::: ", listNewOrder);
        return listNewOrder;
    }

    const checkEndDate = (date) => {
        let endDate = new Date(date)
        let currentDate = new Date();
        console.log("currentDate endDate ", currentDate, endDate);
        if (endDate.getTime() > currentDate.getTime()) {
            return true;
        }
        return true;
    }

    let _menu = null;

    const setMenuRef = ref => { _menu = ref };

    const hideMenu = () => { _menu.hide() };

    const showMenu = () => { _menu.show() };



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
                    setItemOrder(item)
                    console.log("setItemOrder ", item);
                    typeModal.current = TYPE_MODAL.DETAIL;
                    setShowModal(!showModal)
                }}>
                    <View style={{
                        borderBottomColor: "#ddd", borderBottomWidth: 0.5,
                        flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-evenly", padding: 5,
                        backgroundColor: 'white', borderRadius: 10, marginBottom: 2
                    }}>
                        <TouchableOpacity
                            style={{ marginRight: 5 }}
                            onPress={() => { if (!isPromotion) removeItem(item, index) }}>
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
                                {item.AttributesName ? `${item.AttributesName} \n` : ""}
                                {item.Description ? `${item.Description}` : ""}
                            </Text>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                            {/* <Icon style={{ paddingHorizontal: 5 }} name="bell-ring" size={20} color="grey" /> */}
                            {/* <Text
                                style={{ color: Colors.colorchinh, marginRight: 5 }}>
                                {isPromotion ? currencyToString(item.Price * item.Quantity) : (item.IsLargeUnit ? currencyToString(item.PriceLargeUnit * item.Quantity) : currencyToString(item.Price * item.Quantity))}
                            </Text> */}
                        </View>

                        {
                            orientaition == Constant.PORTRAIT ?
                                null
                                :
                                (isPromotion ? null :
                                    <View style={{ alignItems: "center", flexDirection: "row", }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (item.Quantity == 1) {
                                                    removeItem(item, index)
                                                } else {
                                                    item.Quantity--

                                                    syncListProducts([...listOrder])
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

                                            syncListProducts([...listOrder])
                                        }}>
                                            <Icon name="plus-box" size={40} color={Colors.colorchinh} />
                                        </TouchableOpacity>
                                    </View>
                                )
                        }

                    </View>
                </TouchableOpacity>
            </>
        )
    }

    const onCallBackPayment = (type, data) => {
        console.log("onCallBackPayment data ", data);
        // syncListProducts([])
        props.setJsonContent({ ...data })
    }

    // const onCallBackPayment = (type, data) => {
    //     console.log("onCallBackPayment type ,data ", type, data);
    //     // setJsonContent( { ...data })
    //     props.jsonContent = { ...data }
    // }

    const onClickPayment = () => {
        if (isQuickPayment) {

        } else {
            props.navigation.navigate(ScreenList.Payment, { onCallBack: onCallBackPayment, Screen: ScreenList.MainRetail, RoomId: props.jsonContent.RoomId, Name: props.jsonContent.RoomName ? props.jsonContent.RoomName : I18n.t('app_name'), Position: props.jsonContent.Pos });
        }
    }



    const onCLickCommodity = () => {

        props.onCLickCommodity()
    }



    const onClickOptionQuickPayment = () => {
        setIsQuickPayment(!isQuickPayment)
    }

    const onClickPrint = () => {
        hideMenu()
        console.log("onClickProvisional jsonContent ", props.jsonContent);
        // if (!(jsonContent.RoomName && jsonContent.RoomName != "")) {
        //     jsonContent.RoomName = props.route.params.room.Name
        // }
        dispatch({ type: 'PRINT_PROVISIONAL', printProvisional: { jsonContent: props.jsonContent, provisional: true } })
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
                        <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.colorchinh }}>{currencyToString(props.jsonContent.Total - props.jsonContent.VAT + props.jsonContent.Discount)}</Text>
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
                                <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
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
                        button={<Icon style={{ paddingHorizontal: 5 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={onClickPrint} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('in_tam_tinh')}</Text>
                            </TouchableOpacity>

                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCLickCommodity} style={{ flex: .5, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%", flexDirection: 'row' }}>
                    <Icon name="file-document-edit-outline" size={30} color="white" />
                    <View style={{ backgroundColor: Colors.colorchinh, borderRadius: 40, position: "absolute", right: 0, top: -5 }}>
                        <Text style={{ fontWeight: "bold", padding: 4, color: "white", fontSize: 14 }}>{numberCommodity}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickNewOrder} style={{ flex: .8, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('don_hang_moi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClickPayment} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
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
                                    fromRetail={true}
                                    item={itemOrder}
                                    onClickSubmit={data => { applyDialogDetail(data) }}
                                    setShowModal={() => {
                                        setShowModal(false)
                                    }}
                                />
                                :
                                null
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


export default RetailCustomerOrder

