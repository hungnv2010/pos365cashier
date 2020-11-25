import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, NativeModules } from 'react-native';
import { useSelector } from 'react-redux';
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import realmStore from '../../../data/realm/RealmStore';
import { Constant } from '../../../common/Constant';
import ViewPrint from '../../more/ViewPrint';
const { Print } = NativeModules;
import dataManager from '../../../data/DataManager'
import moment from 'moment';
import I18n from '../../../common/language/i18n';

const Served = (props) => {
    let serverEvent = null;
    const currentServerEvent = useRef({})

    const [jsonContent, setJsonContent] = useState({})

    const [data, setData] = useState("");
    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("")
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const toolBarTabletServedRef = useRef();
    const orientaition = useSelector(state => {
        return state.Common.orientaition
    });

    useEffect(() => {
        const getListPos = async () => {

            let serverEvent = await realmStore.queryServerEvents()

            const row_key = `${props.route.params.room.Id}_${position}`

            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)
            console.log('serverEventserverEvent', JSON.parse(JSON.stringify(serverEvent)));

            if (JSON.stringify(serverEvent) != '{}' && serverEvent[0].JsonContent) {
                currentServerEvent.current = serverEvent[0]
                let jsonContentObject = JSON.parse(serverEvent[0].JsonContent)
                if (!jsonContentObject.OrderDetails) jsonContentObject.OrderDetails = []
                setJsonContent(jsonContentObject)
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

    const outputSelectedProduct = (product, replace = false) => {
        if (product.Quantity > 0 && !replace) {
            if (!jsonContent.OrderDetails) jsonContent.OrderDetails = []
            if (jsonContent.OrderDetails.length == 0) {
                let title = jsonContent.RoomName ? jsonContent.RoomName : ""
                let body = I18n.t('gio_khach_vao') + moment().format('HH:mm dd/MM')
                dataManager.sentNotification(title, body)
            }
            if (product.SplitForSalesOrder) {
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
                if (!isExist) jsonContent.OrderDetails.push(product)
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
                    <PageServed
                        {...props}
                        itemOrder={meMoItemOrder}
                        jsonContent={jsonContent}
                        onClickProvisional={(res) => onClickProvisional(res)}
                        listProducts={[...listProducts]}
                        outputListProducts={outputListProducts}
                        outputItemOrder={outputItemOrder}
                        outputPosition={outputPosition}
                        outputSelectedProduct={outputSelectedProduct}
                        listTopping={listTopping} />
                </View>
            </View>
        </View>
    );
}

export default React.memo(Served)