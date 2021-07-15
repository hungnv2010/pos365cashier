import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import realmStore from '../../data/realm/RealmStore';
import { Constant } from '../../common/Constant';
import I18n from '../../common/language/i18n';
import { change_alias } from '../../common/Utils';
import useDebounce from '../../customHook/useDebounce';
import { Colors, Metrics, Images } from '../../theme'
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import ItemProduct from '../../screens/served/servedForTablet/selectProduct/ProductsItem'
import colors from '../../theme/Colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SelectProduct from "./SelectProduct"
import { ScrollView } from 'react-native-gesture-handler';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { currencyToString } from '../../common/Utils';
import { HTTPService } from "../../data/services/HttpService";
import { ApiPath } from "../../data/services/ApiPath";
import dataManager from '../../data/DataManager';

export default (props) => {
    const [listProduct, setListProduct] = useState([])
    const [listCate, setCate] = useState([])
    const [ori, setOri] = useState(2)
    const [objSetting, setObjSetting] = useState({})
    const [objPosition, setObjPosition] = useState([])
    const dispatch = useDispatch();
    const { orientaition, orderScreen, deviceType } = useSelector(state => {
        return state.Common
    });
    const [size, setSize] = useState(orderScreen.size ? orderScreen.size : 3)
    const [isHorizontal, setisHorizontal] = useState(orderScreen.isHorizontal ? orderScreen.isHorizontal : false)


    useEffect(() => {
        console.log("screen", Metrics.screenWidth, Metrics.screenHeight);
        const getDataFromRealm = async () => {
            console.log(orderScreen);
            let product = await (await realmStore.queryProducts()).sorted('Position')
            product = JSON.parse(JSON.stringify(product))
            product = Object.values(product)
            //console.log(product);
            setPosition(product)
            //setListProduct(product)
            let category = await realmStore.queryCategories()
            category = JSON.parse(JSON.stringify(category))
            category = Object.values(category)
            console.log(category);
            setCate(category)
            let objectSetting = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
            objectSetting = JSON.parse(objectSetting)
            setisHorizontal(orderScreen ? orderScreen.isHorizontal : false)
            setSize(orderScreen ? orderScreen.size : 3)
            setObjSetting(objectSetting)
            console.log(objectSetting);
        }
        getDataFromRealm()
    }, [])
    useEffect(() => {
        console.log(listCate.length, listCate);
    }, [listCate])
    const setPosition = (list) => {
        let pos = 0;
        let arr = []
        list.forEach(item => {
            pos += 1
            item.Pos = pos
            arr.push(item)
        })
        console.log(arr);
        setListProduct(arr)
    }
    const outputDataChange = (data) => {
        console.log("data change ", data);
        let obj = {}
        data.forEach((item, index) => {
            obj[item.Id] = index
        })
        obj = JSON.stringify(obj)
        obj = obj.replace(/":/g, "=").replace(/,"/g, ", ")
        obj = obj.replace(/{"/g, "{")
        setObjPosition(obj)
        console.log("object", (obj));
    }

    const onClickSave = () => {
        console.log("object pos", objPosition);
        let object = {}
        object['isHorizontal'] = isHorizontal
        object['size'] = size
        setObjSetting({ ...objSetting, OrderScreen: object })
        setFileLuuDuLieu(Constant.OBJECT_SETTING, JSON.stringify({ ...objSetting, OrderScreen: object, }))
        dispatch({ type: 'SETTING_ORDER_SCREEN', orderScreen: object })
        let params = {
            Key: 'ProductPositions',
            Value: objPosition
        }
        new HTTPService().setPath(ApiPath.UPDATE_SETTING).POST(params)
            .then(res => {
                console.log('onClickApply res', res);
                if (res) {
                    console.log("res");
                    new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET().then(async (res) => {
                        console.log("getDataRetailerInfo res ", res);
                        setFileLuuDuLieu(Constant.VENDOR_SESSION, JSON.stringify(res))
                    })
                    dataManager.syncProduct()
                }
            })
            .catch(err => {
                console.log('onClickApply err', err);
            })
        props.navigation.pop()
    }


    return (
        <>
            {deviceType == Constant.TABLET ?
                <>
                    {orientaition == Constant.LANDSCAPE ?
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{ flex: 3 }}>
                                    <ToolBarDefault
                                        {...props}
                                        title={I18n.t("cai_dat_man_hinh_chon_san_pham")}
                                    />

                                    <View style={{ flex: 1, flexDirection: isHorizontal ? 'column' : 'row' }}>
                                        <View style={{ flexDirection: "column", flex: isHorizontal ? 0.2 : 1 }}>
                                            {listCate.length > 0 ?
                                                <FlatList
                                                    data={listCate}
                                                    horizontal={isHorizontal}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    renderItem={({ item, index }) => {
                                                        return (
                                                            <View style={{ backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                                                                <Text>{item.Name}</Text>
                                                            </View>
                                                        )
                                                    }
                                                    }
                                                />
                                                : null}
                                            <TouchableOpacity style={[styles.styleBtn, { top: isHorizontal ? 10 : Metrics.screenHeight / 4, left: isHorizontal ? Metrics.screenWidth / 3 : 0 }]} onPress={() => { setisHorizontal(!isHorizontal), setSize(size), setListProduct([...listProduct]) }}>
                                                <Icon name={"sync"} size={20} color={"#fff"} />
                                                <Text style={{ color: "#fff" }}>{isHorizontal ? I18n.t('xoay_doc') : I18n.t('xoay_ngang')}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flex: 2 }}>
                                            {
                                                listProduct.length > 0 ?
                                                    <SelectProduct numColumn={size || 3} listProducts={listProduct} widthParent={isHorizontal ? Metrics.screenHeight / 5 * 3 : Metrics.screenHeight / 5 * 2} outputDataChange={outputDataChange} />
                                                    :
                                                    <Text style={{ textAlign: "center" }}>{I18n.t('khong_tim_thay_san_pham_nao_phu_hop')}</Text>
                                            }

                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'column', position: 'absolute', right: 20, bottom: 20, backgroundColor: "#fff", paddingVertical: 15, borderRadius: 10, width: 150 }}>
                                        <TouchableOpacity style={{ paddingVertical: 10, backgroundColor: size == 4 ? colors.colorchinh : "#fff", borderRadius: 10, alignItems: 'center' }} onPress={() => { setOri(1), setSize(4) }} >
                                            <Text style={{ color: size == 4 ? "#fff" : colors.colorchinh }}>{I18n.t('nho')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ paddingVertical: 10, backgroundColor: size == 3 ? colors.colorchinh : "#fff", borderRadius: 10, alignItems: 'center' }} onPress={() => { setOri(2), setSize(3) }}>
                                            <Text style={{ color: size == 3 ? "#fff" : colors.colorchinh }}>{I18n.t('mac_dinh')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ paddingVertical: 10, backgroundColor: size == 2 ? colors.colorchinh : "#fff", borderRadius: 10, alignItems: 'center' }} onPress={() => { setOri(3), setSize(2) }}>
                                            <Text style={{ color: size == 2 ? "#fff" : colors.colorchinh }}>{I18n.t('lon')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 2, backgroundColor: '#fff' }}></View>
                            </View>
                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: Metrics.screenWidth / 4, backgroundColor: colors.colorchinh, paddingVertical: 15, borderRadius: 10, marginVertical: 10 }} onPress={() => onClickSave()}>
                                <Text style={{ fontWeight: 'bold', color: '#fff' }}>{I18n.t("luu")}</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{ flex: 3 }}>
                                    <ToolBarDefault
                                        {...props}
                                        title={I18n.t("cai_dat_man_hinh_chon_san_pham")}
                                    />
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text>{I18n.t('vui_long_xoay_ngang_man_hinh_de_thuc_hien_chuc_nang')}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    }
                </>
                :
                <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <View style={{ flex: 3 }}>
                                    <ToolBarDefault
                                        {...props}
                                        title={I18n.t("cai_dat_man_hinh_chon_san_pham")}
                                    />

                                    <View style={{ flex: 1, flexDirection: 'column', marginHorizontal:5 }}>
                                        <View style={{ flexDirection: "column", flex: 0.2 }}>
                                            {listCate.length > 0 ?
                                                <FlatList
                                                    data={listCate}
                                                    horizontal={true}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    renderItem={({ item, index }) => {
                                                        return (
                                                            <View style={{ backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                                                                <Text>{item.Name}</Text>
                                                            </View>
                                                        )
                                                    }
                                                    }
                                                />
                                                : null}
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            {
                                                listProduct.length > 0 ?
                                                    <SelectProduct numColumn={1} listProducts={listProduct} widthParent={Metrics.screenWidth} outputDataChange={outputDataChange} />
                                                    :
                                                    <Text style={{ textAlign: "center" }}>{I18n.t('khong_tim_thay_san_pham_nao_phu_hop')}</Text>
                                            }

                                        </View>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: Metrics.screenWidth / 4, backgroundColor: colors.colorchinh, paddingVertical: 15, borderRadius: 10, marginVertical: 10 }} onPress={() => onClickSave()}>
                                <Text style={{ fontWeight: 'bold', color: '#fff' }}>{I18n.t("luu")}</Text>
                            </TouchableOpacity>
                        </View>
                }
        </>
    )
}
const styles = StyleSheet.create({
    styleBtn: { alignItems: 'center', backgroundColor: colors.colorchinh, position: 'absolute', justifyContent: 'center', borderColor: colors.colorchinh, borderWidth: 0.5, borderRadius: 10, paddingVertical: 15, paddingHorizontal: 10, flexDirection: 'row', }
})