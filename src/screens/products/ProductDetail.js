import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { currencyToString } from '../../common/Utils';
import { TextInput } from 'react-native-gesture-handler';
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService } from "../../data/services/HttpService";
import DialogSingleChoice from '../../components/dialog/DialogSingleChoice'
import DialogInput from '../../components/dialog/DialogInput'
import PrintCook from '../../screens/products/PrintCook'

export default (props) => {
    const [product, setProduct] = useState({})
    const [productOl, setProductOl] = useState({})
    const [category, setCategory] = useState([])
    const [displayProduct, setDisplayProduct] = useState(true)
    const [showModal, setOnShowModal] = useState(false)
    const [defaultType, setDefaultType] = useState()
    const itemProduct = useRef({})
    const typeModal = useRef()
    const [priceConfig, setPriceConfig] = useState({})
    const [printer, setPrinter] = useState([])
    const countPrint = useRef(0)
    const addCate = useRef([{
        Name: 'ten_nhom',
        Hint: 'nhap_ten_nhom_hang_hoa'
    }])
    const addDVT = useRef([{
        Name: 'don_vi_tinh_lon',
        Hint: 'Lorem ipsum'
    },
    {
        Name: 'ma_dvt_lon',
        Hint: 'Lorem ipsum'
    },
    {
        Name: 'gia_ban_dvt_lon',
        Hint: 'Lorem ipsum'
    },
    {
        Name: 'gia_tri_quy_doi',
        Hint: 'Lorem ipsum'
    },
    ])

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });
    // let params = {
    //     CompareCost: 200000,
    //     CompareOnHand: 57,
    //     Cost: productOl.Cost,
    //     MaxQuantity: productOl.MaxQuantity,
    //     MinQuantity: productOl.MinQuantity,
    //     OnHand: productOl.OnHand,
    //     PriceByBranch: productOl.PriceByBranch,
    //     PriceByBranchLargeUnit: productOl.PriceByBranchLargeUnit,
    //     Product: {
    //         AttributesName: product.AttributesName,
    //         BlockOfTimeToUseService: product.BlockOfTimeToUseService,
    //         BonusPoint: product.BonusPoint,
    //         BonusPointForAssistant: product.BonusPointForAssistant,
    //         BonusPointForAssistant2: product.BonusPointForAssistant2,
    //         BonusPointForAssistant3: product.BonusPointForAssistant3,
    //         Code: product.Code,
    //         Coefficient: product.Coefficient,
    //         CompositeItemProducts: [],
    //         ConversionValue: product.ConversionValue,
    //         CreatedBy: 39207,
    //         CreatedDate: "2021-01-09T07:30:31.9170000Z",
    //         Description:product.Description,
    //         Hidden: false,
    //         Id: product.Id,
    //         IsPercentageOfTotalOrder: product.IsPercentageOfTotalOrder,
    //         IsPriceForBlock: product.IsPriceForBlock,
    //         IsSerialNumberTracking: product.IsSerialNumberTracking,
    //         IsTimer: true,
    //         LargeUnit: product.LargeUnit,
    //         LargeUnitCode: "",
    //         ModifiedBy: 39207,
    //         ModifiedDate: "2021-01-20T09:00:42.7030000Z",
    //         Name: product.Name,
    //         OrderQuickNotes: "",
    //         Position: 0,
    //         Price: product.Price,
    //         PriceConfig: product.priceConfig,
    //         PriceLargeUnit: product.PriceLargeUnit,
    //         Printer: product.Printer,
    //         ProductAttributes: [],
    //         ProductImages: product.ProductImages,
    //         ProductPartners: [],
    //         ProductType: product.ProductType,
    //         RetailerId: 13311,
    //         SplitForSalesOrder: product.SplitForSalesOrder,
    //         Unit: product.Unit
    //     }
    // }
    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            getData(props.route.params)
            console.log("Image", typeof (product.ProductImages));
            setDefaultType(product.ProductType)
        }
    }, [])
    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            setProduct(props.iproduct)
            setCategory(props.iCategory)
        }

    }, [props.iproduct])
    useEffect(() => {
        product.PriceConfig ? product.PriceConfig != null ? setPriceConfig(JSON.parse(product.PriceConfig)) : null : null
    }, [product])
    useEffect(() => {
        countPrint.current = 0
        let printCook = [{ Name: 'may_in_bao_bep_a', Key: 'KitchenA', Status: false },
        { Name: 'may_in_bao_bep_b', Key: 'KitchenB', Status: false },
        { Name: 'may_in_bao_bep_c', Key: 'KitchenC', Status: false },
        { Name: 'may_in_bao_bep_d', Key: 'KitchenD', Status: false },
        { Name: 'may_in_bao_pha_che_a', Key: 'BartenderA', Status: false },
        { Name: 'may_in_bao_pha_che_b', Key: 'BartenderB', Status: false },
        { Name: 'may_in_bao_pha_che_c', Key: 'BartenderC', Status: false },
        { Name: 'may_in_bao_pha_che_d', Key: 'BartenderD', Status: false },]
        setPrinter([...printCook])
        if (priceConfig && priceConfig != null) {
            printCook.forEach(printer => {
                if (product.Printer == printer.Key || priceConfig.SecondPrinter && priceConfig.SecondPrinter == printer.Key || priceConfig.Printer3 && priceConfig.Printer3 == printer.Key || priceConfig.Printer4 && priceConfig.Printer4 == printer.Key || priceConfig.Printer5 && priceConfig.Printer5 == printer.Key) {
                    printer.Status = true
                    countPrint.current = countPrint.current + 1
                } else {
                    printer.Status = false
                }
            })
            setPrinter([...printCook])
        } else {
            setPrinter([...printCook])
        }
        console.log("product", product.PriceConfig);
        console.log("printer", printer);

    }, [product])

    const getData = (param) => {
        console.log("param", param);
        itemProduct.current = JSON.parse(JSON.stringify(param.product))
        setProduct({ ...JSON.parse(JSON.stringify(param.product)) })
        console.log("data product", itemProduct.current);
        setCategory(JSON.parse(JSON.stringify(param.category)))
    }

    const getProduct = () => {
        if (product != null && product.Code != null) {
            let paramFilter = `(substringof('${product.Code}',Code) or substringof('${product.Code}',Name) or substringof('${product.Code}',Code2) or substringof('${product.Code}',Code3) or substringof('${product.Code}',Code4) or substringof('${product.Code}',Code5))`
            new HTTPService().setPath(ApiPath.PRODUCT).GET({ IncludeSummary: true, Inlinecount: 'allpages', CategoryId: -1, PartnerId: 0, top: 20, filter: paramFilter }).then((res) => {
                if (res != null) {
                    setProductOl({ ...res.results[0] })
                    console.log("res product", res);
                }
            }).catch((e) => {
                console.log("error", e);
            })
        } else {
            setProductOl({})
        }

    }
    useEffect(() => {
        console.log("afsdfsa", product);
        getProduct()
    }, [product])
    useEffect(() => {
        console.log('product Ol', productOl);
    }, [productOl])

    const clickOk = () => {
        let product1 = { ...product, ProductType: defaultType }
        setProduct({ ...product1 })
        setOnShowModal(false)
    }

    const addCategory = (data) => {
        console.log(data);
        let param = {
            Category: {
                Id: 0,
                Name: data,
                ShowOnBranchId: 21883
            }
        }
        new HTTPService().setPath(ApiPath.CATEGORIES_PRODUCT).POST(param).then(res => {
            if (res != null) {
                console.log("res add", res);
                setOnShowModal(false)
            }
        }).catch(err => {
            console.log("error", err);
        })
    }

    const outPut = (data) => {
        setPrinter([...data.printer])
        countPrint.current = 0
        printer.forEach(item => {
            if (item.Status == true) {
                countPrint.current = countPrint.current + 1
            }
        })
        console.log("abc", data.listP);
        setPriceConfig({ ...priceConfig, SecondPrinter: data.listP.SecondPrinter, Printer3: data.listP.Printer3, Printer4: data.listP.Printer4, Printer5: data.listP.Printer5 })
        console.log("config", priceConfig);
    }

    const renderModal = () => {
        return (
            <View>{typeModal.current == 1 ?
                <View style={{ maxHeight: Metrics.screenHeight * 0.7, backgroundColor: 'white', borderRadius: 5, flexDirection: 'column' }}>
                    <Text style={[styles.titleButtonOff, { padding: 15 }]}>{I18n.t('chon_loai_hang_hoa')}</Text>
                    <View style={{ flexDirection: 'row', padding: 10 }}>
                        <TouchableOpacity style={[styles.styleButton, { marginLeft: 10, borderColor: defaultType == 1 ? '#36a3f7' : null, borderWidth: 1, backgroundColor: defaultType == 1 ? 'white' : '#f2f2f2' }]} onPress={() => setDefaultType(1)}>
                            <Text style={[styles.titleButtonOff, { color: defaultType == 1 ? '#36a3f7' : null }]}>{I18n.t('hang_hoa')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.styleButton, { borderColor: defaultType == 2 ? '#36a3f7' : null, borderWidth: 1, backgroundColor: defaultType == 2 ? 'white' : '#f2f2f2' }]} onPress={() => setDefaultType(2)}>
                            <Text style={[styles.titleButtonOff, { color: defaultType == 2 ? '#36a3f7' : null }]}>{I18n.t('dich_vu')}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{ marginRight: 20, marginLeft: 20, justifyContent: 'center', borderWidth: 1, alignItems: 'center', borderRadius: 16, padding: 15, backgroundColor: '#f2f2f2', borderColor: defaultType == 3 ? '#36a3f7' : null, backgroundColor: defaultType == 3 ? 'white' : '#f2f2f2' }}
                        onPress={() => setDefaultType(3)}>
                        <Text style={[styles.titleButtonOff, { color: defaultType == 3 ? '#36a3f7' : null }]}>Combo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ padding: 15, marginRight: 20, marginLeft: 20, marginTop: 10, marginBottom: 10, borderRadius: 15, alignItems: 'center', backgroundColor: '#36a3f7' }} onPress={() => clickOk()}>
                        <Text style={[styles.titleButtonOff, { color: 'white' }]}>{I18n.t('xong')}</Text>
                    </TouchableOpacity>
                </View>
                : typeModal.current == 2 ?
                    <DialogSingleChoice listItem={category} title={I18n.t('chon_nhom_hang_hoa')} titleButton='Ok' ></DialogSingleChoice> :
                    typeModal.current == 3 ?
                        <DialogInput listItem={addCate.current} title={I18n.t('them_moi_nhom_hang_hoa')} titleButton={I18n.t('tao_nhom')} outputValue={addCategory}></DialogInput> :
                        typeModal.current == 4 ?
                            <DialogInput listItem={addDVT.current} title={I18n.t('don_vi_tinh_lon_va_cac_thong_so_khac')} titleButton={I18n.t('ap_dung')} /> :
                            null
            }
            </View>
        )
    }
    return (

        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
            { deviceType == Constant.PHONE ?
                <ToolBarDefault
                    {...props}
                    leftIcon="keyboard-backspace"
                    title={I18n.t('chi_tiet_hang_hoa')}
                    clickLeftIcon={() => { props.navigation.goBack() }}
                /> : null
            }
            <ScrollView>
                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Image style={{ width: 70, height: 70, }} source={Images.icon_product} />
                </View>
                <View style={{ padding: 3, backgroundColor: '#f2f2f2' }}></View>
                <View>
                    <Text style={styles.title}>{I18n.t('ten_hang_hoa')}</Text>
                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#36a3f7' }]} value={product ? product.Name : null} onChangeText={(text) => setProduct({ ...product, Name: text })}></TextInput>
                </View>
                <View>
                    <Text style={styles.title}>{I18n.t('loai_hang')}</Text>
                    <TouchableOpacity style={[styles.textInput, { justifyContent: 'space-between', flexDirection: 'row' }]} onPress={() => { typeModal.current = 1; setOnShowModal(true), setDefaultType(product.ProductType) }} >
                        <Text style={styles.titleButton}>{product ? product.ProductType == 1 ? I18n.t('hang_hoa') : product.ProductType == 2 ? I18n.t('dich_vu') : product.ProductType == 3 ? 'Combo' : null : null}</Text>
                        <Image style={{ width: 20, height: 20, marginTop: 5 }} source={Images.icon_arrow_down} />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={styles.title}>{I18n.t('ma_hang_ma_sku_ma_vach')}</Text>
                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#36a3f7' }]} value={product ? product.Code : null} onChangeText={(text) => setProduct({ ...product, Code: text })}></TextInput>
                </View>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.title}>{I18n.t('ten_nhom')}</Text>
                        <Text style={[styles.title, { marginRight: 10, color: '#36a3f7', textDecorationLine: 'underline', }]} onPress={() => { typeModal.current = 3, setOnShowModal(true) }}>{I18n.t('them_moi')}</Text>
                    </View>
                    <TouchableOpacity style={[styles.textInput, { justifyContent: 'space-between', flexDirection: 'row' }]} onPress={() => { typeModal.current = 2; setOnShowModal(true) }}>
                        <Text style={styles.titleButton}>{productOl.Category ? productOl.Category.Name : null}</Text>
                        <Image style={{ width: 20, height: 20, marginTop: 5 }} source={Images.icon_arrow_down} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10 }}></View>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                        <Text style={styles.titleBold}>{I18n.t('hien_thi_hang_hoa')}</Text>
                        <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} value={displayProduct} onValueChange={() => setDisplayProduct(!displayProduct)}></Switch>
                    </View>
                    <Text style={styles.titleHint}>{I18n.t('hien_thi_san_pham_tren_man_hinh_thu_ngan')}</Text>
                    {
                        displayProduct == true ? <View style={{ flexDirection: 'column' }}>
                            {
                                product ? product.ProductType == 2 ?
                                    <View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                            <Text style={styles.titleBold}>{I18n.t('tinh_theo_phan_tram')}</Text>
                                            <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} ></Switch>
                                        </View>
                                        <Text style={styles.titleHint}>{I18n.t('gia_ban_duoc_tinh_theo_phan_tram_gia_tri_don_hang')}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                            <Text style={styles.titleBold}>{I18n.t('so_luong_theo_thoi_gian')}</Text>
                                            <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} onValueChange={() => setProductOl({ ...productOl, IsTimer: !productOl.IsTimer })} value={productOl.IsTimer}></Switch>
                                        </View>
                                        <Text style={styles.titleHint}>{I18n.t('so_luong_hang_hoa_duoc_tinh_theo_thoi_gian')}</Text>
                                        {productOl.IsTimer == true ?
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                                    <Text style={styles.titleBold}>{I18n.t('thiet_lap_gia_ban_theo_block')}</Text>
                                                    <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} value={productOl.IsPriceForBlock} onValueChange={() => setProductOl({ ...productOl, IsPriceForBlock: !productOl.IsPriceForBlock })}></Switch>
                                                </View>
                                                <Text style={productOl.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>{I18n.t("block_theo_phut")}</Text>
                                                <TextInput style={{ color: productOl.IsPriceForBlock == true ? '#36a3f7' : '#B5B5B5', marginLeft: 5, fontWeight: 'bold', padding: 10 }} value={product.BlockOfTimeToUseService ? currencyToString(product.BlockOfTimeToUseService) : null}></TextInput>
                                                <Text style={productOl.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>{I18n.t('so_block_gio_dau_tien')}</Text>
                                                <TextInput style={{ color: productOl.IsPriceForBlock == true ? '#36a3f7' : '#B5B5B5', marginLeft: 5, fontWeight: 'bold', padding: 10 }} value={product.PriceConfig ? JSON.parse(product.PriceConfig).Block + '' : null}></TextInput>
                                                <Text style={productOl.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>{I18n.t('gia_bon_block_dau')}</Text>
                                                <TextInput style={{ color: productOl.IsPriceForBlock == true ? '#36a3f7' : '#B5B5B5', marginLeft: 5, fontWeight: 'bold', padding: 10 }} value={product.Price ? currencyToString(product.Price) : null}></TextInput>
                                            </View> : null}
                                    </View>
                                    : product ? product.ProductType == 3 ?
                                        <View>
                                            <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10, marginBottom: 10 }}></View>
                                            <Text style={styles.titleBold}>{I18n.t('thanh_phan_combo')}</Text>
                                            {productOl.Formular ?
                                                <View>
                                                    <Text style={styles.titleHint}>{productOl.Formular}</Text>
                                                </View>
                                                :
                                                <View>
                                                    <Text style={styles.titleHint}>{I18n.t('chua_co')}</Text>
                                                    <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]} onPress={() => { typeModal.current = 4; setOnShowModal(true) }}>
                                                        <Text style={[styles.titleButton]}>{I18n.t("chon_hang_hoa")}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                        </View>
                                        : null : null : null
                            }
                            <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10 }}></View>
                            <View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.title}>{I18n.t('gia_von')}</Text>
                                        <TextInput style={[styles.textInput, { color: '#36a3f7', fontWeight: 'bold' }]} value={productOl.Cost ? currencyToString(productOl.Cost) : null} onChangeText={(text) => setProductOl({ ...productOl, Cost: parseInt(text) })}></TextInput>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.title} >{I18n.t('gia')}</Text>
                                        <TextInput style={[styles.textInput, { color: '#36a3f7', fontWeight: 'bold' }]} value={product ? currencyToString(product.Price) : '0'} onChangeText={(text) => setProductOl({ ...product, Price: parseInt(text) })}></TextInput>
                                    </View>
                                </View>
                                {product ? product.ProductType == 2 ?
                                    <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={[styles.titleButton]}>{I18n.t("thiet_lap_khung_gio_dac_biet")}</Text>
                                    </TouchableOpacity>
                                    :
                                    <View>
                                        <Text style={styles.title}>{I18n.t('ton_kho')}</Text>
                                        <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#36a3f7', textAlign: 'center' }]} value={productOl.OnHand ? productOl.OnHand + '' : null} onChangeText={(text) => setProductOl({ ...productOl, OnHand: parseInt(text) })}></TextInput>
                                    </View> : null
                                }

                                <View>
                                    <Text style={styles.title}>{I18n.t('don_vi_tinh')}</Text>
                                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#36a3f7' }]} value={product ? product.Unit : null} onChangeText={(text) => setProduct({ ...product, Unit: text })}></TextInput>
                                </View>
                                <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]} onPress={() => { typeModal.current = 4; setOnShowModal(true) }}>
                                    <Text style={[styles.titleButton]}>{I18n.t("don_vi_tinh_lon_va_cac_thong_so_khac")}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10, }}></View>
                            {product ?
                                <PrintCook productOl={product} config={priceConfig} printer={printer} countPrint={countPrint.current} outPut={outPut}></PrintCook> : null}
                        </View> : null}
                </View>
                <View style={{ backgroundColor: '#f2f2f2', padding: 10 }}>
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#00AE72', padding: 15, justifyContent: 'center', margin: 7, alignItems: 'center', borderRadius: 15, height: 50 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('luu_va_sao_chep')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#00BFFF', padding: 15, justifyContent: 'center', margin: 7, alignItems: 'center', borderRadius: 15, height: 50 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('luu')}</Text>
                            </TouchableOpacity>
                        </View>
                        {product != {} ?
                            <View>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: '#FF3030', padding: 15, justifyContent: 'center', margin: 7, alignItems: 'center', borderRadius: 15, height: 50 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('xoa')}</Text>
                                </TouchableOpacity>
                            </View> : null
                        }
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setOnShowModal(false)
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={{
                            backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ width: Metrics.screenWidth * 0.8 }}>
                        {renderModal()}
                    </View>
                </View>
            </Modal>
        </View>

    )
}
const styles = StyleSheet.create({
    title: {
        padding: 5,
        marginLeft: 10,
        marginTop: 5,
    },
    titleButton: {
        fontWeight: 'bold',
        color: '#36a3f7',
        marginTop: 5
    },
    titleButtonOff: {
        fontWeight: 'bold',
        alignItems: 'center',
        textAlign: 'center'
    },
    titleButtonOn: {
        fontWeight: 'bold',
        alignItems: 'center',
        textAlign: 'center',
        color: '#36a3f7'
    },
    styleButton: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 15, backgroundColor: '#f2f2f2'
    },
    styleButtonOn: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 15, backgroundColor: 'white', borderColor: '#36a3f7'
    },
    textInput: { backgroundColor: '#f2f2f2', marginTop: 5, marginLeft: 15, marginRight: 15, height: 40, borderRadius: 15, height: 50, padding: 10, borderWidth: 0.25, borderColor: 'silver' },
    titleHint: {
        marginLeft: 15, marginRight: 10, color: '#B5B5B5', marginBottom: 5, marginTop: 5
    },
    textHintBold: {
        marginLeft: 15, fontWeight: 'bold', marginRight: 10, color: '#B5B5B5', marginBottom: 5, marginTop: 10
    },
    titleBold:
        { fontWeight: 'bold', fontSize: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 10, textTransform: 'uppercase' },
    backgroundModal: {
        backgroundColor: 'white',
        borderRadius: 5
    }
})