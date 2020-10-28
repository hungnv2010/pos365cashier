import React, { useLayoutEffect, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Modal } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarPhoneServed from '../../../../components/toolbar/ToolBarPhoneServed';
import I18n from '../../../../common/language/i18n';
import signalRManager from '../../../../common/SignalR';
import { Constant } from '../../../../common/Constant';
import { Snackbar } from 'react-native-paper';
import realmStore from '../../../../data/realm/RealmStore';
import { useDispatch } from 'react-redux';
import colors from '../../../../theme/Colors';
import dataManager from '../../../../data/DataManager';

export default (props) => {

    let serverEvent = null;
    const currentServerEvent = useRef({})

    const [jsonContent, setJsonContent] = useState({})

    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState('A')
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

    useEffect(() => {
        const getListPos = async () => {

            let serverEvent = await realmStore.queryServerEvents()

            const row_key = `${props.route.params.room.Id}_${position}`

            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)
        
            if (JSON.stringify(serverEvent) != '{}' && serverEvent[0].JsonContent) {
                currentServerEvent.current = serverEvent[0]
                let jsonContentObject = JSON.parse(serverEvent[0].JsonContent)
                setJsonContent(jsonContentObject.OrderDetails? jsonContentObject : Constant.JSONCONTENT_EMPTY)     
            } else setJsonContent(Constant.JSONCONTENT_EMPTY)

            serverEvent.addListener((collection, changes) => {
                if ((changes.insertions.length || changes.modifications.length) && serverEvent[0].FromServer) {
                    currentServerEvent.current = serverEvent[0]
                    setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                }
            })

        }

        getListPos()
        return () => {
            if (serverEvent) serverEvent.removeAllListeners()
        }
    }, [position])

    const outputListProducts = (list) => {
        console.log("outputListProducts ", list);
        if (props.route.params.room.ProductId) {
            let ischeck = false;
            list.forEach(element => {
                if (element.Id == props.route.params.room.ProductId) {
                    ischeck = true;
                }
            });
            toolBarPhoneServedRef.current.clickCheckInRef(!ischeck)
        }
        jsonContent.OrderDetails = [...list]
        updateServerEvent()
    }

    const updateServerEvent = () => {
        if(currentServerEvent) {
            let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current))
            dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({...jsonContent})
            serverEvent.Version += 1
            serverEvent.JsonContent = JSON.stringify(jsonContent)
            dataManager.updateServerEvent(serverEvent)
        }
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
                toolBarPhoneServedRef.current.clickCheckInRef()
                onCallBack([results["0"]], 2)
            }
        }
    }

    const onClickSelectProduct = () => {
        let list = jsonContent.OrderDetails ? jsonContent.OrderDetails.filter(item => item.ProductId > 0) : []
        props.navigation.navigate('SelectProduct', { _onSelect: onCallBack, listProducts: list })
    }

    //type: 1 => from selectProduct
    //type: 2 => from noteBook, QRCode
    const onCallBack = (newList, type) => {
        console.log('onCallBack', newList, type);
        switch (type) {
            case 1:
                newList = newList.filter(item => item.Quantity > 0)
                if (newList.length == 0) {
                    newList.push({ Id: -1, Quantity: 1 })
                }
                outputListProducts([...newList])
                break;
            case 2:
                newList.forEach(async (newItem, index, arr) => {
                    let products = await realmStore.queryProducts()
                    let productWithId = products.filtered(`Id ==${newItem.Id}`)
                    productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
                    let ProductImages = productWithId.ProductImages ? productWithId.ProductImages : ""

                    newItem.exist = false
                    newItem.ProductImages = ProductImages
                    if(!jsonContent.OrderDetails) jsonContent.OrderDetails = []
                    jsonContent.OrderDetails.forEach((elm, idx) => {
                        if (newItem.Id == elm.Id && !newItem.SplitForSalesOrder) {
                            elm.Quantity += newItem.Quantity
                            newItem.exist = true
                        }
                    })
                    newList = newList.filter((newItem) => !newItem.exist)
                    console.log('newList', newList);
                    console.log('listProducts', jsonContent.OrderDetails);
                    outputListProducts([...newList, ...jsonContent.OrderDetails])
                })
                break;
            default:
                break;
        }
        checkRoomProductId(newList, props.route.params.room.ProductId)
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

    const checkRoomProductId = (listProduct, Id) => {
        console.log("checkRoomProductId id ", Id);

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.Id == Id })
            console.log("checkRoomProductId listProduct ", list);
            setTimeout(() => {
                list.length > 0 ? toolBarPhoneServedRef.current.clickCheckInRef(false) : toolBarPhoneServedRef.current.clickCheckInRef(true)
            }, 500);
        }
    }

    const onClickListedPrice = () => {

    }

    const onClickRetailCustomer = () => {

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
                     
                    </Menu>
                    <Icon style={{}} name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickListedPrice}>
                    <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={colors.colorchinh} />
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('gia_niem_yet')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={onClickRetailCustomer}>
                    <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khach_hang')}</Text>
                    <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={colors.colorchinh} />
                </TouchableOpacity>
            </View>
            <CustomerOrder
                {...props}
                Position={position}
                jsonContent={jsonContent}
                outputListProducts={outputListProducts} />
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
