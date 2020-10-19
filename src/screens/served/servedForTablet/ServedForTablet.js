import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, NativeModules } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import realmStore from '../../../data/realm/RealmStore';
import { Constant } from '../../../common/Constant';
import ViewPrint from '../../more/ViewPrint';
const { Print } = NativeModules;
import dataManager from '../../../data/DataManager'

const Served = (props) => {
    let serverEvent = null;
    const [currentServerEvent, setCurrentSeverEvent] = useState({})

    const [jsonContent, setJsonContent] = useState({})

    const [data, setData] = useState("");
    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("")
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const toolBarTabletServedRef = useRef();
    const dispatch = useDispatch();
    const orientaition = useSelector(state => {
        console.log("useSelector state ", state.Common.orientaition);
        return state.Common.orientaition
    });

    const getProductImage = async (item) => {
        let products = await realmStore.queryProducts()
        let productWithId = products.filtered(`Id ==${item.Id}`)
        productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
        return productWithId.ProductImages ? productWithId.ProductImages : ""
    }

    useEffect(() => {
        const getListPos = async () => {

            let serverEvent = await realmStore.queryServerEvents()

            const row_key = `${props.route.params.room.Id}_${position}`

            serverEvent = serverEvent.filtered(`RowKey == '${row_key}'`)
        
            if (JSON.stringify(serverEvent) != '{}' && serverEvent[0].JsonContent) {
                setCurrentSeverEvent(serverEvent[0])
                let jsonContentObject = JSON.parse(serverEvent[0].JsonContent)
                setJsonContent(jsonContentObject.OrderDetails? jsonContentObject : Constant.JSONCONTENT_EMPTY) 
            } else setJsonContent(Constant.JSONCONTENT_EMPTY)

            serverEvent.addListener((collection, changes) => {
                if (changes.insertions.length || changes.modifications.length) {
                    setCurrentSeverEvent(serverEvent[0])
                    setJsonContent(JSON.parse(serverEvent[0].JsonContent))

                }
            })

        }

        getListPos()
        return () => {
            if (serverEvent) serverEvent.removeAllListeners()
        }
    }, [position])

    const outputListProducts = (newList, type) => {
        console.log(newList, 'newList start');
        newList = newList.filter(item => item.Quantity > 0)
        switch (type) {
            case 0:
                outputListProducts(newList)
                break;
            case 2:
                console.log('newListnewListnewListnewListnewList', newList);
                newList.forEach((newItem, index) => {
                    getProductImage(newItem)
                        .then((res) => {
                            newItem.exist = false
                            newItem.ProductImages = res
                            if(!jsonContent.OrderDetails) jsonContent.OrderDetails = []
                            jsonContent.OrderDetails.forEach((elm, idx) => {
                                if (newItem.Id == elm.Id && !elm.SplitForSalesOrder) {
                                    elm.Quantity += newItem.Quantity
                                    newItem.exist = true
                                }
                            })
                            newList = newList.filter(item => !item.exist)
                            outputListProducts([...newList, ...jsonContent.OrderDetails])
                        })
                        .catch((e) => {
                            newItem.exist = false
                            if(!jsonContent.OrderDetails) jsonContent.OrderDetails = []
                            jsonContent.OrderDetails.forEach((elm, idx) => {
                                if (newItem.Id == elm.Id && !elm.SplitForSalesOrder) {
                                    elm.Quantity += newItem.Quantity
                                    newItem.exist = true
                                }
                            })
                            newList = newList.filter(item => !item.exist)
                            outputListProducts([...newList, ...jsonContent.OrderDetails])
                        })
                });
                break;

            default:
                break;
        }
        console.log(newList, 'newList');
        checkHasItemOrder(newList)
        checkProductId(newList, props.route.params.room.ProductId)

        if(currentServerEvent)
            updateServerEvent(JSON.parse(JSON.stringify(currentServerEvent)), newList)
    }

    const updateServerEvent = (serverEvent, newOrderDetail) => {
        dataManager.calculatateServerEvent(serverEvent, newOrderDetail)
        serverEvent.Version += 1
        dataManager.subjectUpdateServerEvent.next(serverEvent)
    }

    const outputTextSearch = (text) => {
        setValue(text)
    }

    const outputItemOrder = (item) => {
        setItemOrder(item)
    }

    const outputPosition = (position) => {
        console.log('outputPosition', position);

        setPosition(position)
    }

    const outputListTopping = (listTopping) => {
        console.log('outputListTopping', listTopping);
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
                results["0"]["Sid"] = Date.now();
                outputListProducts([results["0"]], 2)
                toolBarTabletServedRef.current.clickCheckInRef()
            }
        }
    }

    const checkProductId = (listProduct, Id) => {
        console.log("checkProductId id ", Id);

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.Id == Id })
            console.log("checkProductId listProduct ", list);
            setTimeout(() => {
                list.length > 0 ? toolBarTabletServedRef.current.clickCheckInRef(false) : toolBarTabletServedRef.current.clickCheckInRef(true)
            }, 500);
            // listProduct.length > 0 ? toolBarTabletServedRef.current.clickCheckInRef(false) : toolBarTabletServedRef.current.clickCheckInRef(true)
        }
    }

    const checkHasItemOrder = (newList) => {
        let exist = false
        newList.forEach(item => {
            if (item.Sid == itemOrder.Sid) {
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
    const renderForTablet = () => {
        return (
            <>
                <ViewPrint
                    ref={viewPrintRef}
                    html={data}
                    callback={(uri) => {
                        console.log("callback uri ", uri)
                        Print.printImageFromClient([uri + ""])
                    }
                    }
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
                        <View style={!itemOrder.Sid ? { flex: 1 } : { width: 0, height: 0 }}>
                            <SelectProduct
                                valueSearch={value}
                                numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
                                listProducts={[...listProducts]}
                                outputListProducts={outputListProducts} />
                        </View>
                        <View style={itemOrder.Sid ? { flex: 1 } : { width: 0, height: 0 }}>
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
                            jsonContent ={jsonContent}
                            onClickProvisional={(res) => onClickProvisional(res)}
                            listProducts={[...listProducts]}
                            outputListProducts={outputListProducts}
                            outputItemOrder={outputItemOrder}
                            outputPosition={outputPosition}
                            listTopping={listTopping} />
                    </View>
                </View>
            </>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {
                renderForTablet()
            }
        </View>
    );
}

export default React.memo(Served)