import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, NativeModules, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Menu, { MenuItem } from 'react-native-material-menu';
import { useSelector } from 'react-redux';
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import Topping from './Topping';
import realmStore from '../../../data/realm/RealmStore';
import { Constant } from '../../../common/Constant';
import ViewPrint from '../../more/ViewPrint';
const { Print } = NativeModules;
import dataManager from '../../../data/DataManager'
import moment from 'moment';
import I18n from '../../../common/language/i18n';
import { Modal } from 'react-native';
import Pricebook from '../Pricebook';
import colors from '../../../theme/Colors';
import { Colors } from '../../../theme';
import CustomerOrder from './pageServed/CustomerOrder';
import { ApiPath } from '../../../data/services/ApiPath';
import { HTTPService } from '../../../data/services/HttpService';

const Served = (props) => {
    let serverEvent = null;
    const currentServerEvent = useRef({})

    const [position, setPosition] = useState('A')
    const [listPosition, setListPosition] = useState([
        { name: "A", status: false },
        { name: "B", status: false },
        { name: "C", status: false },
        { name: "D", status: false },
    ])
    const [jsonContent, setJsonContent] = useState({})

    const [data, setData] = useState("");
    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [showPriceBook, setShowPriceBook] = useState(false)
    const [currentPriceBook, setCurrentPriceBook] = useState({Name: "Giá niêm yết", Id: 0})
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])

    const pricebooksRef = useRef()
    const toolBarTabletServedRef = useRef();
    const orientaition = useSelector(state => {
        return state.Common.orientaition
    });

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

    useEffect(() => { 
        const initPricebook = async () => {
            let newPricebooks = []
            let results = await realmStore.queryPricebook()
            results.forEach(item => {
                newPricebooks.push({ ...JSON.parse(JSON.stringify(item))})
            })
            pricebooksRef.current = newPricebooks    
        }
        initPricebook()
    },[])

    useEffect(() => {
        const getListPos = async () => {

            let serverEvent = await realmStore.queryServerEvents()

            const row_key = `${props.route.params.room.Id}_${position}`

            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)

            if (JSON.stringify(serverEvent) != '{}' && serverEvent[0].JsonContent) {
                currentServerEvent.current = serverEvent[0]
                let jsonContentObject = JSON.parse(serverEvent[0].JsonContent)
                if (!jsonContentObject.OrderDetails) jsonContentObject.OrderDetails = []
                setJsonContent(jsonContentObject)
            } else setJsonContent(Constant.JSONCONTENT_EMPTY)

            setPriceBookId(jsonContent.PriceBookId)

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

    useEffect(() => {
        const getOtherPrice = async() => {
            if(jsonContent.OrderDetails && currentPriceBook){
                let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
                let params = {"pricebookId": currentPriceBook.Id, "ProductIds": jsonContent.OrderDetails.map( (product) => product.ProductId) }
                let res = await new HTTPService().setPath(apiPath).POST(params)
                if (res && res.PriceList && res.PriceList.length > 0) {
                    jsonContent.OrderDetails.map( (product) => {
                        res.PriceList.forEach((priceBook) => {
                            if (priceBook.ProductId == product.ProductId) {
                                product.DiscountRatio = 0.0
                                if (!priceBook.PriceLargeUnit) priceBook.PriceLargeUnit = product.PriceLargeUnit
                                if (!priceBook.Price) priceBook.Price = product.UnitPrice
                                let newBasePrice = (product.IsLargeUnit)? priceBook.PriceLargeUnit : priceBook.Price
                                product.Price = newBasePrice + product.TotalTopping
                            }
                        })
                    })
                    updateServerEvent()
                }
            }
        }

        const getBasePrice = () => {
            jsonContent.OrderDetails.map( (product) => {
                product.DiscountRatio = 0.0
                let basePrice = (product.IsLargeUnit)? product.PriceLargeUnit : product.UnitPrice
                product.Price = basePrice + product.TotalTopping
            })
            updateServerEvent()
        }
        if(jsonContent.OrderDetails) {
            if(currentPriceBook && currentPriceBook.Id) getOtherPrice() 
            else getBasePrice()
        }
    },[currentPriceBook])

    const getOtherPrice = async(product) => {
        if(currentPriceBook.Id){
            let apiPath = ApiPath.PRICE_BOOK + `/${currentPriceBook.Id}/manyproductprice`
            let params = {"pricebookId": currentPriceBook.Id, "ProductIds": [product.ProductId] }
            let res = await new HTTPService().setPath(apiPath).POST(params)
            if (res && res.PriceList && res.PriceList.length > 0) {
                res.PriceList.forEach((priceBook) => {
                    if (priceBook.ProductId == product.ProductId) {
                        product.DiscountRatio = 0.0
                        if (!priceBook.PriceLargeUnit) priceBook.PriceLargeUnit = product.PriceLargeUnit
                        if (!priceBook.Price) priceBook.Price = product.UnitPrice
                        let newBasePrice = (product.IsLargeUnit)? priceBook.PriceLargeUnit : priceBook.Price
                        product.Price = newBasePrice + product.TotalTopping
                    }
                })
                return product
            } else                 
                return product
        } else 
            return product
    } 

    const setPriceBookId = (pricebookId) => {
        let filters = pricebooksRef.current.filter(item => item.Id == pricebookId)
        if(filters.length > 0) setCurrentPriceBook(filters[0])
    }

    const outputSelectedProduct = async (product, replace = false) => {
        if (product.Quantity > 0 && !replace) {
            if (!jsonContent.OrderDetails) jsonContent.OrderDetails = []
            if (jsonContent.OrderDetails.length == 0) {
                let title = jsonContent.RoomName ? jsonContent.RoomName : ""
                let body = I18n.t('gio_khach_vao') + moment().format('HH:mm dd/MM')
                dataManager.sentNotification(title, body)
            }
            if (product.SplitForSalesOrder) {
                product = await getOtherPrice(product)
                jsonContent.OrderDetails.push(product)
            } else {
                let isExist = false
                jsonContent.OrderDetails.forEach(elm => {
                    if (elm.ProductId == product.ProductId) {
                        isExist = true
                        elm.Quantity += product.Quantity
                        return;
                    }
                })
                if (!isExist) {
                    product = await getOtherPrice(product)
                    jsonContent.OrderDetails.push(product)
                }
            }
        } else if (replace) {
            jsonContent.OrderDetails = jsonContent.OrderDetails.map((elm, index) => {
                if (elm.ProductId == product.ProductId && index == product.index) elm = product
                return elm
            })
        } else {
            jsonContent.OrderDetails = jsonContent.OrderDetails
                .filter((elm, index) => index != product.index)
        }
        checkRoomProductId([product], props.route.params.room.ProductId)
        updateServerEvent()
    }

    const outputListProducts = (newList, type) => {
        console.log('outputListProducts', type, newList);
        newList = newList.filter(item => item.Quantity > 0)
        newList.forEach((newItem, index) => {
            newItem.exist = false
            if (!jsonContent.OrderDetails) jsonContent.OrderDetails = []
            jsonContent.OrderDetails.forEach((elm, idx) => {
                if (newItem.ProductId == elm.ProductId && !elm.SplitForSalesOrder) {
                    elm.Quantity += newItem.Quantity
                    newItem.exist = true
                }
            })
            newList = newList.filter(item => !item.exist)
            jsonContent.OrderDetails = [...newList, ...jsonContent.OrderDetails]
        });
        checkHasItemOrder(newList)
        checkRoomProductId(newList, props.route.params.room.ProductId)
        updateServerEvent()
    }

    const updateServerEvent = () => {
        if (currentServerEvent) {
            let serverEvent = JSON.parse(JSON.stringify(currentServerEvent.current))
            dataManager.calculatateJsonContent(jsonContent)
            setJsonContent({ ...jsonContent })
            serverEvent.Version += 1
            serverEvent.JsonContent = JSON.stringify(jsonContent)

            dataManager.updateServerEvent(serverEvent)
        }
    }

    const outputTextSearch = (text) => {
        setValue(text)
    }

    const outputItemOrder = (item) => {
        setItemOrder(item)
    }

    const outputPosition = (position) => {
        setPosition(position)
    }

    const outputListTopping = (listTopping) => {
        setListTopping(listTopping)
    }

    const onClickListedPrice = () => {
        outputClickPriceBook()
    }

    const outputClickPriceBook = () => {
        setShowPriceBook(true)
    }

    const onClickRetailCustomer = () => {
        console.log('onClickRetailCustomer');
    }

    const outputPriceBookSelected = (pricebook) => {
        if(pricebook) setCurrentPriceBook(pricebook) 
        setShowPriceBook(false)
    }

    const outputClickProductService = async () => {
        let results = await realmStore.queryProducts()
        if (results) {
            results = results.filtered(`Id = "${props.route.params.room.ProductId}"`)
            if (results && results.length > 0) {
                results = JSON.parse(JSON.stringify(results))
                console.log("outputClickProductService results ", [results["0"]]);
                results["0"]["Quantity"] = 1;
                outputListProducts([results["0"]], 2)
                toolBarTabletServedRef.current.clickCheckInRef()
            }
        }
    }

    const checkRoomProductId = (listProduct, Id) => {

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.ProductId == Id })
            setTimeout(() => {
                list.length > 0 ? toolBarTabletServedRef.current.clickCheckInRef(false) : toolBarTabletServedRef.current.clickCheckInRef(true)
            }, 500);
        }
    }

    const checkHasItemOrder = (newList) => {
        let exist = false
        newList.forEach((item, index) => {
            if (item.ProductId == itemOrder.ProductId && (itemOrder.index == undefined || index == itemOrder.index)) {
                exist = true
            }
        })
        if (!exist) {
            setItemOrder({})
        }
    }

    const onClickProvisional = (res) => {
        if (res && res != "") {
            let html = data.replace("width: 76mm", "")
            setData(res)
        }
        setTimeout(() => {
            viewPrintRef.current.clickCaptureRef();
        }, 500);
    }
    const viewPrintRef = useRef();

    return (
        <View style={{ flex: 1 }}>
            <ViewPrint
                ref={viewPrintRef}
                html={data}
                callback={(uri) => {
                    console.log("callback uri ", uri)
                    Print.printImageFromClient([uri + ""])
                }}
            />
            <ToolBarServed
                {...props}
                ref={toolBarTabletServedRef}
                outputClickProductService={outputClickProductService}
                navigation={props.navigation}
                outputListProducts={outputListProducts}
                outputTextSearch={outputTextSearch} />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showPriceBook}
                    supportedOrientations={['portrait', 'landscape']}
                    onRequestClose={() => {}}>
                    <Pricebook
                        currentPriceBook = {currentPriceBook}
                        outputPriceBookSelected = {outputPriceBookSelected}
                        listPricebook = {pricebooksRef.current}
                    >
                    </Pricebook>
                </Modal>                 


                <View style={{ flex: 6, }}>
                    <View style={!itemOrder.ProductId ? { flex: 1 } : { width: 0, height: 0 }}>
                        <SelectProduct
                            valueSearch={value}
                            numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
                            listProducts={jsonContent.OrderDetails ? [...jsonContent.OrderDetails] : []}
                            outputSelectedProduct={outputSelectedProduct} />
                    </View>

                    <View style={itemOrder.ProductId ? { flex: 1 } : { width: 0, height: 0 }}>
                        <Topping
                            {...props}
                            numColumns={orientaition == Constant.LANDSCAPE ? 2 : 1}
                            position={position}
                            itemOrder={meMoItemOrder}
                            onClose={() => { setItemOrder({}) }}
                            outputListTopping={outputListTopping}
                        />
                    </View>
                </View>
                <View style={{ flex: 4, marginLeft: 2 }}>
                <View style={{ flex: 1, backgroundColor: "#fff" }}>
            
                    <View style={{ backgroundColor: colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderTopColor: "#EAECEE", borderTopWidth: 1.5, height: 35 }}>
                        <View style={{ flex: 1, justifyContent: "center", }}>
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
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderBottomColor: Colors.colorchinh, borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 5 }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={onClickListedPrice}>
                            <Entypo style={{ paddingHorizontal: 5 }} name="price-ribbon" size={25} color={colors.colorchinh} />
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{currentPriceBook.Name? currentPriceBook.Name: I18n.t('gia_niem_yet')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={onClickRetailCustomer}>
                            <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{I18n.t('khach_hang')}</Text>
                            <Icon style={{ paddingHorizontal: 5 }} name="account-plus-outline" size={25} color={Colors.colorchinh} />
                        </TouchableOpacity>
                    </View>

                    <CustomerOrder
                        {...props}
                        itemOrder={meMoItemOrder}
                        jsonContent={jsonContent}
                        onClickProvisional={(res) => onClickProvisional(res)}
                        listProducts={[...listProducts]}
                        outputListProducts={outputListProducts}
                        outputItemOrder={outputItemOrder}
                        outputPosition={outputPosition}
                        outputSelectedProduct={outputSelectedProduct}
                        listTopping={listTopping} 
                        currentPriceBook = {currentPriceBook}
                        outputClickPriceBook = {outputClickPriceBook}
                        Position={position}/>
                </View > 

                </View>
            </View>
        </View>
    );
}

export default React.memo(Served)