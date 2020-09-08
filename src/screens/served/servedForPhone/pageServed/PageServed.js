import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Modal } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import MenuConfirm from './MenuConfirm';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarPhoneServed from '../../../../components/toolbar/ToolBarPhoneServed';
import I18n from '../../../../common/language/i18n';
import signalRManager from '../../../../common/SignalR';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import { Snackbar } from 'react-native-paper';
import realmStore from '../../../../data/realm/RealmStore';
import { useDispatch } from 'react-redux';


export default (props) => {

    const [tab, setTab] = useState(1)
    const [textNotify, setTextNotify] = useState("")
    const [vendor, setVendor] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState('A')
    const [listProducts, setListProducts] = useState([])
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const toolBarPhoneServedRef = useRef();
    const [listPosition, setListPosition] = useState([
        { name: "A", status: false },
        { name: "B", status: false },
        { name: "C", status: false },
        { name: "D", status: false },
    ])
    const dispatch = useDispatch();

    // useEffect(() => {
    //     console.log(props, 'page served');
    //     const getData = async () => {
    //         let data = await getFileDuLieuString(Constant.HISTORY_ORDER, true);
    //         if (data) {
    //           data = JSON.parse(data);
    //           dispatch({ type: 'HISTORY_ORDER', historyOrder: data })
    //         }
    //       }
    //       getData()
    // }, [])

    const outputListProducts = (list) => {
        if (props.route.params.room.ProductId) {
            let ischeck = false;
            list.forEach(element => {
                if (element.Id == props.route.params.room.ProductId) {
                    ischeck = true;
                }
            });
            toolBarPhoneServedRef.current.clickCheckInRef(!ischeck)
        }
        setListProducts(list)
    }

    const onClickNoteBook = () => {
        props.navigation.navigate('NoteBook', { _onSelect: onCallBack })
    }

    const onClickQRCode = () => {
        props.navigation.navigate('QRCode', { _onSelect: onCallBack })
    }

    const onClickProductService = async () => {
        let results = await realmStore.queryProducts()
        if (results) {
            results = results.filtered(`Id = "${props.route.params.room.ProductId}"`)
            if (results && results.length > 0) {
                results = JSON.parse(JSON.stringify(results))
                console.log("outputClickProductService results ", [results["0"]]);
                results["0"]["Quantity"] = 1;
                results["0"]["Sid"] = Date.now();
                toolBarPhoneServedRef.current.clickCheckInRef()
                onCallBack([results["0"]], 2)
            }
        }
    }

    const onClickSelectProduct = () => {
        let list = listProducts.filter(item => item.Id > 0)
        props.navigation.navigate('SelectProduct', { _onSelect: onCallBack, listProducts: list })
    }


    const getProductImage = async (item) => {
        alert("onCallBack getProductImage == " + JSON.stringify(item))
        let products = await realmStore.queryProducts()
        alert("onCallBack getProductImage " + JSON.stringify(products))
        let productWithId = products.filtered(`Id ==${item.Id}`)
        productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
        // alert("onCallBack getProductImage " + JSON.stringify(productWithId.ProductImages) + " productWithId " + JSON.stringify(productWithId))
        return productWithId.ProductImages ? productWithId.ProductImages : ""
    }


    //type: 1 => from selectProduct
    //type: 2 => from noteBook, QRCode
    const onCallBack = (data, type) => {
        console.log('onCallBack', data, type);
        switch (type) {
            case 1:
                data = data.filter(item => item.Quantity > 0)
                if (data.length == 0) {
                    data.push({ Id: -1, Quantity: 1 })
                }
                setListProducts([...data])
                break;
            case 2:
                data.forEach(async (item, index, arr) => {
                    let products = await realmStore.queryProducts()
                    let productWithId = products.filtered(`Id ==${item.Id}`)
                    productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
                    let ProductImages = productWithId.ProductImages ? productWithId.ProductImages : ""

                    item.exist = false
                    item.ProductImages = ProductImages
                    listProducts.forEach((elm, idx) => {
                        if (item.Id == elm.Id && !item.SplitForSalesOrder) {
                            elm.Quantity += item.Quantity
                            item.exist = true
                        }
                    })
                    data = data.filter((item) => !item.exist)
                    console.log('data', data);
                    console.log('listProducts', listProducts);
                    setListProducts([...data, ...listProducts])
                })
                break;
            default:
                break;
        }
        if (tab != 1) setTab(1)
        checkProductId(data, props.route.params.room.ProductId)
    }


    const selectPosition = (position) => {
        setPosition(position)
        setShowModal(false);
    }

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = (position) => {
        _menu.hide();
        selectPosition(position)
    };

    const showMenu = () => {
        _menu.show();
    };

    const outputSendNotify = async (type) => {
        if (type == 1) {
            setTimeout(() => {
                signalRManager.sendMessageOrder(props.route.params.room.Name + ": " + I18n.t('yeu_cau_thanh_toan'))
            }, 100);
        } else {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            data = JSON.parse(data)
            setVendor(data)
            setTimeout(() => {
                setTextNotify(props.route.params.room.Name + ` <${I18n.t('tu')}: ` + data.CurrentUser.Name + "> ")
                setShowModal(true)
            }, 500);
        }
    }

    const outputListPos = (listPos) => {
        setListPosition(listPos)
    }

    const onClickSendNotify = () => {
        setShowModal(false)
        signalRManager.sendMessageOrder(textNotify)
    }

    const checkProductId = (listProduct, Id) => {
        console.log("checkProductId id ", Id);

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.Id == Id })
            console.log("checkProductId listProduct ", list);
            setTimeout(() => {
                list.length > 0 ? toolBarPhoneServedRef.current.clickCheckInRef(false) : toolBarPhoneServedRef.current.clickCheckInRef(true)
            }, 500);
        }
    }


    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ToolBarPhoneServed
                ref={toolBarPhoneServedRef}
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('don_hang')}
                clickLeftIcon={() => { props.navigation.goBack() }}
                clickNoteBook={onClickNoteBook}
                clickQRCode={onClickQRCode}
                rightIcon="plus"
                clickProductService={onClickProductService}
                clickRightIcon={onClickSelectProduct} />
            <View style={{ backgroundColor: Colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 5 }}>
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={{ paddingLeft: 20, textTransform: "uppercase", color: "white", fontWeight: "bold" }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                </View>
                <TouchableOpacity onPress={showMenu} style={{ flex: 1, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                    <Menu
                        style={{ width: 50 }}
                        ref={setMenuRef}
                        button={<Text style={{ color: "white", fontWeight: "bold" }} onPress={showMenu}>{position}</Text>}
                    >
                        {
                            listPosition.map(item => <MenuItem key={item.name} onPress={() => hideMenu(item.name)}>{item.name} {item.status ? <Text style={{ color: Colors.colorchinh }}>*</Text> : null}</MenuItem>)
                        }
                        {/* <MenuItem onPress={() => hideMenu("A")}>A *</MenuItem>
                        <MenuItem onPress={() => hideMenu("B")}>B</MenuItem>
                        <MenuItem onPress={() => hideMenu("C")}>C</MenuItem>
                        <MenuItem onPress={() => hideMenu("D")}>D</MenuItem> */}
                    </Menu>
                    <Icon style={{}} name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderColor: Colors.colorchinh, borderWidth: 0.5 }}>
                <TouchableOpacity onPress={() => setTab(1)} style={{ paddingVertical: 8, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tab == 1 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text style={{ color: tab == 1 ? "white" : Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('thuc_don_da_goi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab(2)} style={{ paddingVertical: 8, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tab == 2 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text style={{ color: tab == 2 ? "white" : Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('mon_da_xac_nhan')}</Text>
                </TouchableOpacity>
            </View>
            {tab == 1 ?
                <CustomerOrder
                    {...props}
                    Position={position}
                    listProducts={listProducts}
                    outputListProducts={outputListProducts}
                    outputSendNotify={(type) => outputSendNotify(type)} />
                :
                <MenuConfirm
                    {...props}
                    Position={position}
                    outputSendNotify={(type) => outputSendNotify(type)}
                    outputListPos={outputListPos} />
            }
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => setShowModal(false)}
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
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <TouchableOpacity onPress={() => selectPosition("A")}>
                                <Text style={{ margin: 10, fontSize: 16, fontWeight: "bold" }}>{I18n.t('gui_tin_nhan')}</Text>
                            </TouchableOpacity>
                            <View style={{ padding: 0, height: 40, borderRadius: 3, borderColor: Colors.colorchinh, borderWidth: 1, backgroundColor: "#fff", flexDirection: "row", margin: 10 }}>
                                <TextInput value={textNotify} style={{ width: "100%", height: "100%", color: "#000" }}
                                    autoFocus={true}
                                    onChangeText={(text) => setTextNotify(text)}
                                />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Text style={{ margin: 10, fontSize: 16 }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onClickSendNotify()}>
                                    <Text style={{ margin: 10, fontSize: 16 }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
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
        </View >
    );
}
