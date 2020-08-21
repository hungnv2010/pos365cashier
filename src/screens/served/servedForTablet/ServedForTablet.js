import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, NativeModules } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ToolBarSelectProduct from '../../../components/toolbar/ToolBarSelectProduct'
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import realmStore from '../../../data/realm/RealmStore';
import { Constant } from '../../../common/Constant';
import ViewPrint from '../../more/ViewPrint';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
const { Print } = NativeModules;

const Served = (props) => {

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

    const getProductImage = async (item) => {
        let products = await realmStore.queryProducts()
        let productWithId = products.filtered(`Id ==${item.Id}`)
        productWithId = JSON.parse(JSON.stringify(productWithId))[0] ? JSON.parse(JSON.stringify(productWithId))[0] : {}
        return productWithId.ProductImages ? productWithId.ProductImages : ""
    }

    const outputListProducts = (newList, type) => {
        console.log(newList, 'newList start');
        newList = newList.filter(item => item.Quantity > 0)
        switch (type) {
            case 0:
                setListProducts(newList)
                break;
            case 2:
                console.log('newListnewListnewListnewListnewList', newList);
                newList.forEach((element, index) => {
                    getProductImage(element)
                        .then((res) => {
                            element.exist = false
                            element.ProductImages = res
                            listProducts.forEach(item => {
                                if (element.Id == item.Id && !item.SplitForSalesOrder) {
                                    item.Quantity += element.Quantity
                                    element.exist = true
                                }
                            })
                            newList = newList.filter(item => !item.exist)
                            setListProducts([...newList, ...listProducts])
                        })
                        .catch((e) => {
                            element.exist = false
                            listProducts.forEach(item => {
                                if (element.Id == item.Id && !item.SplitForSalesOrder) {
                                    item.Quantity += element.Quantity
                                    element.exist = true
                                }
                            })
                            newList = newList.filter(item => !item.exist)
                            setListProducts([...newList, ...listProducts])
                        })
                });
                break;

            default:
                break;
        }
        console.log(newList, 'newList');
        checkHasItemOrder(newList)
        checkProductId(newList, props.route.params.room.ProductId)
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