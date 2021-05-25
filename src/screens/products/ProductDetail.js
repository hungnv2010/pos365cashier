import React, { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, NativeModules, ScrollView, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';
import { Metrics, Images } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { currencyToString, dateUTCToMoment, momentToDate, momentToDateUTC } from '../../common/Utils';
import { TextInput } from 'react-native-gesture-handler';
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService } from "../../data/services/HttpService";
import DialogSingleChoice from '../../components/dialog/DialogSingleChoice'
import DialogInput from '../../components/dialog/DialogInput'
import DialogSettingTime from '../../components/dialog/DialogSettingTime'
import PrintCook from '../../screens/products/PrintCook'
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import realmStore from '../../data/realm/RealmStore';
import Ionicons from 'react-native-vector-icons/AntDesign';
import { ScreenList } from '../../common/ScreenList';
import DialogConfirm from '../../components/dialog/DialogConfirm'
import dialogManager from '../../components/dialog/DialogManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dataManager from '../../data/DataManager';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import GDrive from "react-native-google-drive-api-wrapper";
import NetInfo from "@react-native-community/netinfo";
import { handerDataPrintTempProduct } from '../tempPrint/ServicePrintTemp';
const { Print } = NativeModules;

export default (props) => {
    const [product, setProduct] = useState({})
    const [productOl, setProductOl] = useState({})
    const [category, setCategory] = useState([])
    const [showModal, setOnShowModal] = useState(false)
    const [defaultType, setDefaultType] = useState(1)
    const itemProduct = useRef({})
    const typeModal = useRef()
    const [priceConfig, setPriceConfig] = useState({})
    const [printer, setPrinter] = useState([])
    const countPrint = useRef(0)
    const currentUserId = useRef()
    const modifiedDate = new Date()
    const currentRetailerId = useRef()
    const compareCost = useRef()
    const compareOnHand = useRef()
    const [nameCategory, setNameCategory] = useState()
    const [listItemFomular, setListItemFormular] = useState([])
    const [countFormular, setCountFormular] = useState(0)
    const [type, setType] = useState('')
    const [compositeItemProducts, setCompositeItemProducts] = useState([])
    const [qrCode, setQrCode] = useState()
    const [printerPr, setPrinterPr] = useState('')
    const scrollRef = useRef();
    const [codeProduct, setCodeProduct] = useState()
    const [cost, setCost] = useState(0)
    const isCoppy = useRef(false)
    const [marginModal, setMargin] = useState(0)
    const [isTakePhoto, setIsTakePhoto] = useState(true)
    const [imageUrl, setImageUrl] = useState()
    const [onHand, setOnHand] = useState()
    const token = useRef()
    const addCate = useRef([{
        Name: 'ten_nhom',
        Hint: 'nhap_ten_nhom_hang_hoa',
        Key: 'CategoryName',
        Value: '',
        isNum: false
    }])
    const printStamp = useRef([])
    const [addDVT, setAddDVT] = useState([])

    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });
    const { isFNB } = useSelector(state => {
        return state.Common
    });

    let params = {
        CompareCost: compareCost.current ? compareCost.current : 0,
        CompareOnHand: compareOnHand.current ? compareOnHand.current : 0,
        Cost: cost ? cost : 0,
        MaxQuantity: productOl.MaxQuantity ? productOl.MaxQuantity : 999,
        MinQuantity: productOl.MinQuantity ? productOl.MinQuantity : 0,
        OnHand: onHand ? parseFloat(onHand) : 0,
        PriceByBranch: productOl.PriceByBranch ? productOl.PriceByBranch : 0,
        PriceByBranchLargeUnit: productOl.PriceByBranchLargeUnit ? productOl.PriceByBranchLargeUnit : 0,
        Product: {
            AttributesName: product.AttributesName,
            BlockOfTimeToUseService: product.BlockOfTimeToUseService,
            BonusPoint: product.BonusPoint ? product.BonusPoint : 0,
            BonusPointForAssistant: product.BonusPointForAssistant ? product.BonusPointForAssistant : 0,
            BonusPointForAssistant2: product.BonusPointForAssistant2 ? product.BonusPointForAssistant2 : 0,
            BonusPointForAssistant3: product.BonusPointForAssistant3 ? product.BonusPointForAssistant3 : 0,
            Code: codeProduct,
            Coefficient: product.Coefficient ? product.Coefficient : undefined,
            CompositeItemProducts: compositeItemProducts,
            ConversionValue: product.ConversionValue ? product.ConversionValue : 1,
            CreatedBy: currentUserId.current,
            CreatedDate: productOl.CreatedDate,
            Description: product.Description,
            Hidden: product.Hidden ? product.Hidden : undefined,
            Id: product.Id ? product.Id : 0,
            IsPercentageOfTotalOrder: product.IsPercentageOfTotalOrder,
            IsPriceForBlock: product.IsPriceForBlock,
            IsSerialNumberTracking: product.IsSerialNumberTracking,
            IsTimer: product.IsTimer ? product.IsTimer : undefined,
            LargeUnit: product.LargeUnit,
            LargeUnitCode: productOl.LargeUnitCode ? productOl.LargeUnitCode : undefined,
            ModifiedBy: currentUserId.current,
            ModifiedDate: momentToDate(modifiedDate),
            Name: product.Name,
            OrderQuickNotes: productOl.OrderQuickNotes ? productOl.OrderQuickNotes : undefined,
            Position: productOl.Position ? productOl.Position : undefined,
            Price: product.Price ? product.Price : 0,
            PriceConfig: priceConfig ? JSON.stringify(priceConfig) : JSON.stringify({ Type: "percent", Type2: "percent", DontPrintLabel: false, OpenTopping: false }),
            PriceLargeUnit: product.PriceLargeUnit,
            Printer: deviceType == Constant.PHONE ? product.Printer ? product.Printer : 'KitchenA' : printerPr ? printerPr : 'KitchenA',
            ProductAttributes: productOl.ProductAttributes ? productOl.ProductAttributes : undefined,
            ProductImages: productOl.ProductImages ? productOl.ProductImages : product.ProductImages,
            ProductType: product.ProductType ? product.ProductType : 1,
            RetailerId: currentRetailerId.current,
            SplitForSalesOrder: product.SplitForSalesOrder ? product.SplitForSalesOrder : undefined,
            Unit: product.Unit,
            //ShowOnBranchId: undefined,
            CategoryId: product.CategoryId ? product.CategoryId : undefined
        },
        ProductPartners: productOl.ProductPartners ? productOl.ProductPartners : []
    }
    useEffect(() => {
        if (deviceType == Constant.PHONE) {
            getData(props.route.params)
            setDefaultType(product.ProductType)
            setPriceConfig({})
        }
        getCategory()
    }, [])

    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            setProduct({ ...JSON.parse(JSON.stringify(props.iproduct)) })
            console.log({ ...JSON.parse(JSON.stringify(props.iproduct)) });
            setPrinterPr(props.iproduct.Printer ? props.iproduct.Printer : '')
            getCategory()
            getProduct({ ...JSON.parse(JSON.stringify(props.iproduct)) })
            console.log("CompositeItemProducts", props.compositeItemProducts);
            setNameCategory()
            setCost(props.iproduct.Cost)
            if (props.iproduct.Code) {
                setCodeProduct(props.iproduct.Code)
                setType('sua')
            } else {
                if (isCoppy.current == true) {
                    setProduct({ ...product, ProductType: product.ProductType ? product.ProductType : 1, BlockOfTimeToUseService: product.BlockOfTimeToUseService ? product.BlockOfTimeToUseService : 6 })
                    isCoppy.current = false
                } else {
                    setProduct({ ...JSON.parse(JSON.stringify(props.iproduct)), ProductType: 1, BlockOfTimeToUseService: 6 })
                    setOnHand(0)
                }
                setCodeProduct("")
                setPriceConfig({})
                setType('them')
            }
            scrollRef.current?.scrollTo({
                y: 0,
                animated: true,
            });
        }
    }, [props.iproduct])

    useEffect(() => {
        console.log("type", type);
        console.log("prodcut", product);
    }, [type])

    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            setQrCode(props.scanQr)
            console.log('qrcode', qrCode);
            if (props.scanQr != null) {
                setProduct({ ...product, Code: props.scanQr })
                setCodeProduct(props.scanQr)
            }
        }
    }, [props.scanQr])
    useEffect(() => {
        if (deviceType == Constant.TABLET) {
            setCompositeItemProducts(props.compositeItemProducts)
            setListItemFormular(props.compositeItemProducts)
            setCountFormular(props.compositeItemProducts.length)
        }
    }, [props.compositeItemProducts])
    useEffect(() => {
        let t = 0
        compositeItemProducts.forEach(el => {
            t = t + (el.Cost * el.Quantity)
        })
        console.log("cost.....", compositeItemProducts);
        setCost(t)
    }, [compositeItemProducts])

    useEffect(() => {
        //setPriceConfig({})
        setPrinter([])
        product.PriceConfig ? product.PriceConfig != null ? setPriceConfig(JSON.parse(product.PriceConfig)) : null : null
        const getCurrentAccount = async () => {
            let current = await getFileDuLieuString(Constant.VENDOR_SESSION, true)
            console.log("account", JSON.parse(current).CurrentUser.Id);
            currentUserId.current = JSON.parse(current).CurrentUser.Id
            currentRetailerId.current = JSON.parse(current).CurrentRetailer.Id
        }
        getCurrentAccount()
        setStatusPrinter()
        console.log("product data", product);
        printStamp.current = [{
            Name: 'so_luong_ma_vach_can_in',
            Hint: '',
            Key: 'quantity',
            Value: 1,
            isNum: true
        },
        {
            Name: 'gia_ban',
            Hint: '',
            Key: 'price',
            Value: product.Price,
            isNum: true
        }]
    }, [product])

    useEffect(() => {
        setStatusPrinter()
    }, [priceConfig])

    const setStatusPrinter = () => {
        countPrint.current = 0
        let printCook
        printCook = [{ Name: 'may_in_bao_bep_a', Key: 'KitchenA', Status: false },
        { Name: 'may_in_bao_bep_b', Key: 'KitchenB', Status: false },
        { Name: 'may_in_bao_bep_c', Key: 'KitchenC', Status: false },
        { Name: 'may_in_bao_bep_d', Key: 'KitchenD', Status: false },
        { Name: 'may_in_bao_pha_che_a', Key: 'BartenderA', Status: false },
        { Name: 'may_in_bao_pha_che_b', Key: 'BartenderB', Status: false },
        { Name: 'may_in_bao_pha_che_c', Key: 'BartenderC', Status: false },
        { Name: 'may_in_bao_pha_che_d', Key: 'BartenderD', Status: false }]
        setPrinter([...printCook])
        if (priceConfig && priceConfig != null) {
            printCook.forEach(printer => {
                if (deviceType == Constant.PHONE) {
                    if (product.Printer == printer.Key || priceConfig.SecondPrinter && priceConfig.SecondPrinter == printer.Key || priceConfig.Printer3 && priceConfig.Printer3 == printer.Key || priceConfig.Printer4 && priceConfig.Printer4 == printer.Key || priceConfig.Printer5 && priceConfig.Printer5 == printer.Key) {
                        printer.Status = true
                        countPrint.current = countPrint.current + 1
                    } else {
                        printer.Status = false
                    }
                } else {
                    if (printerPr == printer.Key || priceConfig.SecondPrinter && priceConfig.SecondPrinter == printer.Key || priceConfig.Printer3 && priceConfig.Printer3 == printer.Key || priceConfig.Printer4 && priceConfig.Printer4 == printer.Key || priceConfig.Printer5 && priceConfig.Printer5 == printer.Key) {
                        printer.Status = true
                        countPrint.current = countPrint.current + 1
                    } else {
                        printer.Status = false
                    }
                }

            })
            setPrinter([...printCook])
        } else {
            setPrinter([...printCook])
        }

    }

    const getData = (param) => {
        itemProduct.current = JSON.parse(JSON.stringify(param.product))
        setProduct({ ...itemProduct.current })
        setCodeProduct(itemProduct.current.Code)
        getProduct(itemProduct.current)
        setCost(itemProduct.current.Cost)
        console.log("data product", param.type);
        setType(params.type)
        // setCategory([...JSON.parse(JSON.stringify(param.category))])

        console.log("category", category);
        if (itemProduct.current.Id) {
            setType('sua')
        } else {
            setProduct({ ProductType: 1, BlockOfTimeToUseService: 6 })
            setType('them')
        }
    }
    const getCategory = async () => {
        setCategory([])
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
            await dataManager.syncCategories()
        }
        let categoryTmp = await realmStore.queryCategories()
        setCategory([...categoryTmp])
        if (product.CategoryId) {
            let cate = categoryTmp.filter(item => item.Id == product.CategoryId)
            setNameCategory(cate.Name)
        }
    }

    const getProduct = (product) => {
        if (product != null && product.Code && product.Code != '') {
            console.log("product", product);
            let paramFilter = `(substringof('${product.Code}',Code) or substringof('${product.Code}',Name) or substringof('${product.Code}',Code2) or substringof('${product.Code}',Code3) or substringof('${product.Code}',Code4) or substringof('${product.Code}',Code5))`
            new HTTPService().setPath(ApiPath.PRODUCT).GET({ IncludeSummary: true, Inlinecount: 'allpages', CategoryId: -1, PartnerId: 0, top: 20, filter: paramFilter }).then((res) => {
                if (res != null) {
                    setProductOl({ ...res.results[0] })
                    if (nameCategory == null) {
                        setNameCategory(res.results[0].Category && res.results[0].Category.Name ? res.results[0].Category.Name : '')
                        setCost(res.results[0].Cost)
                        console.log("largeUnitCode", res.results[0].LargeUnitCode);
                        setOnHand(res.results[0].OnHand)
                    }

                    console.log("add dvt", addDVT.current);
                    compareCost.current = productOl.Cost
                    compareOnHand.current = productOl.OnHand

                }
            }).catch((e) => {
                console.log("error", e);
            })
        } else {
            setProductOl({})
        }

        getFormular(product)
    }
    const getFormular = (product) => {
        if (product.ProductType == 3 && product.Id > 0) {
            new HTTPService().setPath(`api/products/${product.Id}/components`).GET({ Includes: 'Item' }).then((res) => {
                if (res != null) {
                    console.log("res formular", res);
                    setListItemFormular(res)
                    setCompositeItemProducts(res)
                    setCountFormular(res.length)
                }
            }).catch((e) => {
                onsole.log("error", e);
            })
        }
    }

    useEffect(() => {

    }, [listItemFomular])
    useEffect(() => {
        console.log("afsdfsa", product);
        //getProduct()
    }, [product])
    useEffect(() => {
        console.log('product Ol', productOl);
        if (productOl.ProductImages && productOl.ProductImages.length > 0) {
            let img = productOl.ProductImages.filter(el => el.IsDefault == true)
            console.log("img", img);
            if (img.length > 0) {
                setImageUrl(img[0].ImageURL)
            } else {
                setImageUrl()
            }
        }

        setAddDVT([{
            Name: 'don_vi_tinh_lon',
            Hint: 'nhap_don_vi_tinh_lon',
            Key: 'LargeUnit',
            Value: product.LargeUnit ? product.LargeUnit : '',
            isNum: false
        },
        {
            Name: 'ma_dvt_lon',
            Hint: 'ma_don_vi_tinh_lon',
            Key: 'LargeUnitId',
            Value: productOl.LargeUnitCode ? productOl.LargeUnitCode : null,
            isNum: false
        },
        {
            Name: 'gia_ban_dvt_lon',
            Hint: 'gia_ban_don_vi_tinh_lon',
            Key: 'PriceLargeUnit',
            Value: product.PriceLargeUnit ? product.PriceLargeUnit : 0,
            isNum: true
        },
        {
            Name: 'gia_tri_quy_doi',
            Hint: 'gia_tri_quy_doi',
            Key: 'ConversionValue',
            Value: product.ConversionValue ? product.ConversionValue : 1,
            isNum: true
        }])
    }, [productOl])

    const clickOk = () => {
        setProduct({ ...product, ProductType: defaultType })
        setOnShowModal(false)
    }

    const addCategory = async (data) => {
        addCate.current = [{
            Name: 'ten_nhom',
            Hint: 'nhap_ten_nhom_hang_hoa',
            Key: 'CategoryName',
            Value: '',
            isNum: false
        }]
        console.log(data);
        let param = {
            Category: {
                Id: 0,
                Name: data.CategoryName,
                ShowOnBranchId: 21883
            }
        }
        setOnShowModal(false)
        if (param.Category.Name && param.Category.Name != '') {
            new HTTPService().setPath(ApiPath.CATEGORIES_PRODUCT).POST(param).then(res => {
                if (res) {
                    if (res.ResponseStatus && res.ResponseStatus.Message) {
                        dialogManager.showLoading()
                        dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                            dialogManager.destroy();
                            dialogManager.hiddenLoading()
                        }, null, null, I18n.t('dong'))
                    } else {
                        if (deviceType == Constant.PHONE) {
                            props.route.params.onCallBack('them', 1)
                            handleSuccess('them')
                        } else
                            props.handleSuccessTab('them', 1, product)
                        //setProduct({...product})
                        getCategory()
                    }
                }
            })
            //await dataManager.syncCategories()
        } else {
            dialogManager.showLoading()
            dialogManager.showPopupOneButton(I18n.t('vui_long_nhap_day_du_thong_tin_truoc_khi_luu'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
                dialogManager.hiddenLoading()
            }, null, null, I18n.t('dong'))
        }

    }
    const handleSuccess = async (type1) => {
        console.log("type", type1);
        //dialogManager.showLoading()
        try {
            if (type1 != 'them') {
                await realmStore.deleteCategory()
            }
            await dataManager.syncCategories()
            getCategory()
            // dialogManager.showPopupOneButton(`${I18n.t(type1)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            // dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            //dialogManager.hiddenLoading()
        }
    }

    const outPutPrinter = (data) => {
        setPrinter([...data.printer])
        countPrint.current = 0
        printer.forEach(item => {
            if (item.Status == true) {
                countPrint.current = countPrint.current + 1
            }
        })
        if (deviceType == Constant.PHONE) {
            let listprinter = printer.filter(item => item.Status == true)
            switch (listprinter.length) {
                case 1:
                    product.Printer = listprinter[0].Key
                    setPriceConfig({ ...priceConfig, SecondPrinter: '', Printer3: '', Printer4: '', Printer5: '' })
                    break
                case 2:
                    product.Printer = listprinter[0].Key
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: '', Printer4: '', Printer5: '' })
                    break
                case 3:
                    product.Printer = listprinter[0].Key
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: listprinter[2].Key, Printer4: '', Printer5: '' })
                    break
                case 4:
                    product.Printer = listprinter[0].Key
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: listprinter[2].Key, Printer4: listprinter[3].Key, Printer5: '' })
                    break
                case 5:
                    product.Printer = listprinter[0].Key
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: listprinter[2].Key, Printer4: listprinter[3].Key, Printer5: listprinter[4].Key })
                    break
            }
            console.log("price config", product.Printer);
        } else {
            setPrinterPr('')
            let listprinter = printer.filter(item => item.Status == true)
            switch (listprinter.length) {
                case 1:
                    setPrinterPr(listprinter[0].Key)
                    setPriceConfig({ ...priceConfig, SecondPrinter: '', Printer3: '', Printer4: '', Printer5: '' })
                    break
                case 2:
                    setPrinterPr(listprinter[0].Key)
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: '', Printer4: '', Printer5: '' })
                    break
                case 3:
                    setPrinterPr(listprinter[0].Key)
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: listprinter[2].Key, Printer4: '', Printer5: '' })
                    break
                case 4:
                    setPrinterPr(listprinter[0].Key)
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: listprinter[2].Key, Printer4: listprinter[3].Key, Printer5: '' })
                    break
                case 5:
                    setPrinterPr(listprinter[0].Key)
                    setPriceConfig({ ...priceConfig, SecondPrinter: listprinter[1].Key, Printer3: listprinter[2].Key, Printer4: listprinter[3].Key, Printer5: listprinter[4].Key })
                    break
            }
            console.log("price config", printerPr);
        }
    }
    const onClickSave = (type) => {
        // if (product.CategoryId && product.CategoryId > 0) {
        //     params.Product = { ...params.Product, CategoryId: product.CategoryId }
        // if (product.ProductType == 2) {
        //     param.Product = { ...params.Product, IsTimer: true }
        // }
        //}
        saveProduct()
    }
    const syncData = async () => {
        dialogManager.showLoading()
        try {
            //await realmStore.deleteProduct()
            await dataManager.syncProduct()
        } catch (error) {
            console.log('handleSuccess err', error);
            //dialogManager.hiddenLoading()
        }
    }
    const saveProduct = async () => {
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
            if (product.Name && product.Name != '') {
                new HTTPService().setPath(ApiPath.PRODUCT).POST(params).then(res => {
                    console.log('onClickSave', res)
                    if (res) {
                        console.log("ressssssss", { ...res, Code: "", Id: 0 });
                        if (res.ResponseStatus && res.ResponseStatus.Message) {
                            dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                dialogManager.destroy();
                            }, null, null, I18n.t('dong'))
                        } else {
                            if (deviceType == Constant.PHONE) {
                                if (isCoppy.current == false) {
                                    props.route.params.onCallBack(type, 2)
                                    props.navigation.pop()
                                } else {
                                    setCodeProduct("")
                                    setProduct({ ...res, Code: "", Id: 0 })
                                    //syncData()
                                    props.route.params.onCallBack(type, 2)
                                    dialogManager.hiddenLoading()
                                    dialogManager.showPopupOneButton(`${I18n.t(type)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
                                    setType('them')
                                    scrollRef.current?.scrollTo({
                                        y: 0,
                                        animated: true,
                                    });
                                }
                            } else if (deviceType == Constant.TABLET) {
                                if (isCoppy.current == false) {
                                    props.handleSuccessTab(type, 2)
                                } else {
                                    //setProduct({ ...res })
                                    setProduct({ ...res, Code: "", Id: 0 })
                                    setCodeProduct("")
                                    props.handleSuccessTab(type, 2, { ...res, Code: "", Id: 0 })
                                    setType('them')
                                    setImageUrl(imageUrl)
                                }
                            }
                        }
                    }
                })
            } else {
                dialogManager.showPopupOneButton(I18n.t('vui_long_nhap_day_du_thong_tin_truoc_khi_luu'), I18n.t('thong_bao'), () => {
                    dialogManager.destroy();
                }, null, null, I18n.t('dong'))
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }
    const setLargeUnit = (data) => {
        console.log("data", data);
        setProduct({ ...product, LargeUnit: data.LargeUnit, PriceLargeUnit: data.PriceLargeUnit, ConversionValue: data.ConversionValue, LargeUnitId: data.LargeUnitId })
        setProductOl({ ...productOl, LargeUnitCode: data.LargeUnitId })
        setOnShowModal(false)
    }
    const pickCategory = (data) => {
        console.log(data);
        if (data.key) {
            console.log("value", data.key.Name);
            setProduct({ ...product, CategoryId: data.key.Id })
            //product.CategoryId = data.key.Id
            setNameCategory(data.key.Name)
            console.log(data);
        }
        setOnShowModal(false)
    }
    const getDataTime = (data) => {
        setPriceConfig(data)
        console.log("product detail data", priceConfig);
        setOnShowModal(false)
    }
    const chooseProduct = () => {
        if (deviceType == Constant.TABLET) {
            props.outPutCombo({ comboTab: true, list: listItemFomular, product: product })
        } else if (deviceType == Constant.PHONE) {
            console.log("listcombo", listItemFomular);
            props.navigation.navigate('ComboForPhone', { list: listItemFomular, product: product, _onSelect: onCallBackData })
        }
    }
    const onCallBackData = (data) => {
        console.log("data composite", data);
        setCompositeItemProducts(data)
        setListItemFormular(data)
        setCountFormular(data.length)
    }

    const onChangeTextInput = (text) => {
        console.log("onChangeTextInput text ===== ", text, props.route);
        if (text == "") {
            text = 0;
        } else {
            text = text.replace(/,/g, "");
            text = Number(text);
        }
        return text
    }

    const onClickQrcodeScan = () => {
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate('QrcodeAdd', { _onSelectQR: onCallBackQr })
        } else if (deviceType == Constant.TABLET) {
            props.outPutCombo({ scanQrCode: true })
        }
    }
    const onCallBackQr = (data) => {
        console.log('qr data', data);
        setProduct({ ...product, Code: data })
        setCodeProduct(data)
    }
    const upLoadPhoto = async (source) => {
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
            dialogManager.showLoading()
            await new HTTPService().setPath(`api/google/tocken`).GET().then(res => {
                if (res != null) {
                    token.current = res.Tocken
                    console.log("Token", res.Tocken);
                }
            })
            GDrive.setAccessToken(token.current)
            GDrive.init()
            //if (source.fileName && source.fileName != '') {
            GDrive.files.createFileMultipart(
                source.base64,
                "'image/jpg'", {
                parents: ["1uNWm1G_BusweTf7x8g1O1wC3z9ET-2n_"],
                name: source.fileName
            },
                true)
                .then(
                    (response) => response.json()
                ).then((res) => {
                    // result data
                    console.log(res.id);
                    let url = "https://docs.google.com/uc?id=" + `${res.id}` + "&export=view"
                    let item = {
                        ImageURL: url,
                        IsDefault: true,
                        ThumbnailUrl: url
                    }
                    let image = []
                    // if (productOl.ProductImages) {
                    //     image = JSON.parse(JSON.stringify(productOl.ProductImages))
                    // }
                    image = [...image, item]
                    setProductOl({ ...productOl, ProductImages: image })
                    setImageUrl(url)
                    console.log(image);
                    dialogManager.hiddenLoading()

                })
            // }
            // else
            //     dialogManager.hiddenLoading()
            setOnShowModal(false)
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
    }
    const captureImage = async () => {
        //setOnShowModal(false)
        let options = {
            mediaType: 'photo',
            cameraType: 'front',
            includeBase64: true,
            saveToPhotos: true
        };
        await launchCamera(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log(
                    'User tapped custom button: ',
                    response.customButton
                );
                alert(response.customButton);
            } else {
                let source = response;
                console.log("sourc", source);
                upLoadPhoto(source)
                setOnShowModal(false)
            }
        });
        dialogManager.hiddenLoading()

    }

    const chooseImage = async () => {
        let options = {
            mediaType: 'photo',
            maxWidth: 300,
            maxHeight: 550,
            quality: 1,
            includeBase64: true,
        };
        launchImageLibrary(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log(
                    'User tapped custom button: ',
                    response.customButton
                );
                alert(response.customButton);
            } else {
                let source = response;
                console.log("sourc", source);
                upLoadPhoto(source)
                setOnShowModal(false)
            }
            dialogManager.hiddenLoading()
        });
    }
    useFocusEffect(useCallback(() => {

        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }


    }, []))
    const _keyboardDidShow = () => {
        setMargin(Metrics.screenWidth / 2)
    }

    const _keyboardDidHide = () => {
        setMargin(0)
    }
    const outputOnHand = (data) => {
        console.log(parseFloat(data.value));
        setProductOl({ ...productOl, OnHand: parseFloat(data.value) })
    }

    const renderFormular = (item, index) => {
        return (
            <View style={{ flexDirection: 'row', padding: 10, flex: 1 }}>
                <View style={{ backgroundColor: colors.colorchinh, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 }}>
                    <Text style={{ color: '#fff' }}>{item.Product ? item.Product.Name : null}</Text>
                </View>
                <View style={{ marginTop: -5, right: 10, backgroundColor: colors.colorLightBlue, padding: 5, borderRadius: 200, marginBottom: 10, height: 30, width: 30 }}>
                    <Text style={{ color: '#fff', textAlign: 'center' }} >{item.Quantity}</Text>
                </View>
            </View>
        )
    }
    const onClickDelete = () => {
        console.log("delete", product.Id);
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_hang_hoa'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(`${ApiPath.PRODUCT}/${product.Id}`).DELETE()
                    .then(res => {
                        console.log('onClickDelete', res)
                        if (res) {
                            if (res.ResponseStatus && res.ResponseStatus.Message) {
                                dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                                    dialogManager.destroy();
                                }, null, null, I18n.t('dong'))
                            } else {
                                if (deviceType == Constant.PHONE) {
                                    props.route.params.onCallBack('xoa', 2)
                                    props.navigation.pop()
                                } else
                                    props.handleSuccessTab('xoa', 2)
                            }
                        }
                    })
                    .catch(err => console.log('ClickDelete err', err))
            }
        })
    }

    const onClickPrintTemp = async (data) => {
        console.log("temp",data);
        console.log("onClickPrintTemp product ", product);
        let settingObject = await getFileDuLieuString(Constant.OBJECT_SETTING, true)
        if (settingObject && settingObject != "") {
            settingObject = JSON.parse(settingObject)
            console.log("onClickPrintTemp settingObject ", settingObject);
            settingObject.Printer.forEach(async element => {
                if (element.key == Constant.KEY_PRINTER.StampPrintKey && element.ip != "") {
                    let value = await handerDataPrintTempProduct(product)
                    console.log("handerDataPrintTempProduct value  ", value);
                    //Print.PrintTemp(value, element.ip, "40x30")
                }
            });
        }
        setOnShowModal(false)
    }

    const renderModal = () => {
        return (
            <View>{typeModal.current == 1 ?
                <View style={{ backgroundColor: 'white', borderRadius: 5, flexDirection: 'column' }}>
                    <Text style={[styles.titleButtonOff, { padding: 15 }]}>{I18n.t('chon_loai_hang_hoa')}</Text>
                    <View>
                        <View style={{ flexDirection: 'row', padding: 10 }}>
                            <TouchableOpacity style={[styles.styleButton, { marginLeft: 10, borderColor: defaultType == 1 ? colors.colorLightBlue : null, borderWidth: 1, backgroundColor: defaultType == 1 ? 'white' : '#f2f2f2' }]} onPress={() => { setDefaultType(1), console.log("click", defaultType); }}>
                                <Text style={[styles.titleButtonOff, { color: defaultType == 1 ? colors.colorLightBlue : null }]}>{I18n.t('hang_hoa')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.styleButton, { borderColor: defaultType == 2 ? colors.colorLightBlue : null, borderWidth: 1, backgroundColor: defaultType == 2 ? 'white' : '#f2f2f2' }]} onPress={() => { setDefaultType(2), console.log("click", defaultType); }}>
                                <Text style={[styles.titleButtonOff, { color: defaultType == 2 ? colors.colorLightBlue : null }]}>{I18n.t('dich_vu')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 10 }}>
                            <TouchableOpacity style={{ flex: 1, marginRight: 10, marginLeft: 10, justifyContent: 'center', borderWidth: 1, alignItems: 'center', borderRadius: 16, padding: 15, backgroundColor: '#f2f2f2', borderColor: defaultType == 3 ? colors.colorLightBlue : null, backgroundColor: defaultType == 3 ? 'white' : '#f2f2f2' }}
                                onPress={() => { setDefaultType(3) }}>
                                <Text style={[styles.titleButtonOff, { color: defaultType == 3 ? colors.colorLightBlue : null }]}>Combo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={{ padding: 15, marginRight: 20, marginLeft: 20, marginTop: 20, marginBottom: 10, borderRadius: 15, alignItems: 'center', backgroundColor: colors.colorLightBlue }} onPress={() => clickOk()}>
                        <Text style={[styles.titleButtonOff, { color: 'white' }]}>{I18n.t('xong')}</Text>
                    </TouchableOpacity>
                </View>
                : typeModal.current == 2 ?
                    <DialogSingleChoice listItem={category} title={I18n.t('chon_nhom_hang_hoa')} titleButton='Ok' outputValue={pickCategory} itemName={nameCategory} ></DialogSingleChoice>
                    :
                    typeModal.current == 3 ?
                        <DialogInput listItem={addCate.current} title={I18n.t('them_moi_nhom_hang_hoa')} titleButton={I18n.t('tao_nhom_hang_hoa')} outputValue={addCategory}></DialogInput>
                        :
                        typeModal.current == 4 ?
                            <DialogInput listItem={addDVT} title={I18n.t('don_vi_tinh_lon_va_cac_thong_so_khac')} titleButton={I18n.t('ap_dung')} outputValue={setLargeUnit} />
                            :
                            typeModal.current == 5 ?
                                <DialogSettingTime type1={priceConfig && priceConfig.Type != '' ? priceConfig.Type : null} type2={priceConfig && priceConfig.Type2 != '' ? priceConfig.type2 : null} priceConfig={priceConfig ? priceConfig : null} putData={getDataTime} />
                                : typeModal.current == 6 ?
                                    <View style={{ backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' }}>
                                        <Text style={{ padding: 10, fontWeight: 'bold', color: colors.colorchinh }}>{I18n.t('chon_anh')}</Text>
                                        <View style={{ flexDirection: 'column', backgroundColor: '#fff', marginBottom: 20 }}>
                                            <TouchableOpacity style={styles.styleBtn} onPress={() => { setIsTakePhoto(true), captureImage(), console.log("click capture"); }}>
                                                {/* <Icon name={isTakePhoto == true ? 'radiobox-marked' : 'radiobox-blank'} size={20} /> */}
                                                <Text style={{ marginLeft: 10 }}>{I18n.t('chup_moi')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.styleBtn} onPress={() => { setIsTakePhoto(false), chooseImage() }}>
                                                {/* <Icon name={isTakePhoto == false ? 'radiobox-marked' : 'radiobox-blank'} size={20} /> */}
                                                <Text style={{ marginLeft: 10 }}>{I18n.t('chon_tu_thu_vien')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10 }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                                <TouchableOpacity style={{ borderRadius: 10, borderWidth: 1, borderColor: colors.colorchinh, flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginRight: 10 }} onPress={() => setOnShowModal(false)}>
                                                    <Text style={{ color: colors.colorchinh, justifyContent: 'flex-end' }}>{I18n.t('huy')}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: colors.colorchinh, borderRadius: 10, paddingVertical: 10, marginLeft: 10 }} onPress={() => { setOnShowModal(false), onClickTakePhoto() }}>
                                                    <Text style={{ color: '#fff' }}>{I18n.t('dong_y')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View> */}
                                    </View>
                                    : typeModal.current == 7 ?
                                        <DialogInput listItem={printStamp.current} title={product.Name} titleButton={I18n.t('in_tem')} outputValue={onClickPrintTemp}  /> :
                                        null
            }
            </View>
        )
    }
    return (

        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
            {deviceType == Constant.PHONE ?
                <ToolBarDefault
                    {...props}
                    leftIcon="keyboard-backspace"
                    title={type == 'them' ? I18n.t('them_moi_hang_hoa') : I18n.t('chi_tiet_hang_hoa')}
                    clickLeftIcon={() => { props.navigation.goBack() }}
                /> : <View style={{ padding: 3, backgroundColor: '#f2f2f2' }}></View>
            }

            <ScrollView ref={scrollRef} >
                <KeyboardAwareScrollView>
                    <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }} >
                        <TouchableOpacity onPress={() => { typeModal.current = 6, setOnShowModal(true) }}>
                            {productOl.ProductImages && (productOl.ProductImages).length > 0 ?
                                <Image style={{ height: 70, width: 70, borderRadius: 16 }} source={{ uri: imageUrl }} /> :
                                // : product.Name ? <View style={{ width: 70, height: 70, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: colors.colorchinh }}>
                                //     <Text style={{ textAlign: 'center', color: 'white' }}>{product.Name ? product.Name.indexOf(' ') == -1 ? product.Name.slice(0, 2).toUpperCase() : (product.Name.slice(0, 1) + product.Name.slice(product.Name.indexOf(' ') + 1, product.Name.indexOf(' ') + 2)).toUpperCase() : null}</Text>
                                // </View> :
                                <View style={{ flexDirection: 'row' }}>
                                    <Image style={{ height: 70, width: 70, borderRadius: 16 }} source={Images.ic_box} />
                                    <View style={{ width: 28, height: 28, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e6ffff', marginLeft: -20, marginTop: 45 }}>
                                        <Icon name={'camera'} color={'#36a3f7'} size={20} style={{}} />
                                    </View>
                                </View>
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={{ padding: 3, backgroundColor: '#f2f2f2' }}></View>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <Text style={styles.title}>{I18n.t('ten_hang_hoa')}</Text>
                            <Text style={{ color: '#f21e3c', marginLeft: 5, fontSize: 18 }}>*</Text>
                        </View>
                        <TextInput style={[styles.textInput, { fontWeight: 'bold', color: colors.colorLightBlue }]} onBlur={false} placeholderTextColor={'#bbbbbb'} placeholder={I18n.t('ten_hang_hoa')} value={product ? product.Name : null} onChangeText={(text) => setProduct({ ...product, Name: text })} ></TextInput>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput style={[styles.textInput, { fontWeight: 'bold', color: colors.colorLightBlue, flex: 8 }]} placeholderTextColor={'#bbbbbb'} placeholder={I18n.t('tu_dong_tao_ma')} value={codeProduct ? codeProduct : null} onChangeText={(text) => setCodeProduct(text)}></TextInput>
                            <TouchableOpacity style={{ justifyContent: 'flex-end', flex: 1 }} onPress={() => onClickQrcodeScan()}>
                                <Icon name="qrcode-scan" size={25} color={colors.colorLightBlue} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>{I18n.t('ten_nhom')}</Text>
                            <Text style={[styles.title, { marginRight: 10, color: colors.colorLightBlue, textDecorationLine: 'underline', }]} onPress={() => { typeModal.current = 3, setOnShowModal(true) }}>{I18n.t('them_moi')}</Text>
                        </View>
                        <TouchableOpacity style={[styles.textInput, { justifyContent: 'space-between', flexDirection: 'row' }]} onPress={() => { typeModal.current = 2; setOnShowModal(true) }}>
                            <Text style={styles.titleButton}>{nameCategory ? nameCategory : I18n.t('chon_nhom')}</Text>
                            <Image style={{ width: 20, height: 20, marginTop: 5 }} source={Images.icon_arrow_down} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10 }}></View>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                            <Text style={styles.titleBold}>{I18n.t('tach_thanh_nhieu_dong_khi_ban_hang')}</Text>
                            <Switch style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} value={product.SplitForSalesOrder ? product.SplitForSalesOrder : false} onValueChange={() => setProduct({ ...product, SplitForSalesOrder: !product.SplitForSalesOrder })} trackColor={{ false: "silver", true: colors.colorchinh }} thumbColor={{ true: colors.colorchinh, false: 'silver' }}></Switch>
                        </View>
                        <Text style={styles.titleHint}>{I18n.t('mo_ta_tach_hang')}</Text>
                        <View style={{ padding: 3, backgroundColor: '#f2f2f2' }}></View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                            <Text style={styles.titleBold}>{I18n.t('hien_thi_hang_hoa')}</Text>
                            <Switch style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }], }} value={product.Hidden ? !product.Hidden : true} onValueChange={() => setProduct({ ...product, Hidden: !product.Hidden })} trackColor={{ false: "silver", true: colors.colorchinh }} thumbColor={{ true: colors.colorchinh, false: 'silver' }}></Switch>
                        </View>
                        <Text style={styles.titleHint}>{I18n.t('hien_thi_san_pham_tren_man_hinh_thu_ngan')}</Text>
                        <View style={{ flexDirection: 'column' }}>
                            {
                                product ? product.ProductType == 2 ?
                                    <View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                            <Text style={styles.titleBold}>{I18n.t('tinh_theo_phan_tram')}</Text>
                                            <Switch style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} onValueChange={() => setProduct({ ...product, IsPercentageOfTotalOrder: !product.IsPercentageOfTotalOrder })} value={product.IsPercentageOfTotalOrder} trackColor={{ false: "silver", true: colors.colorchinh }}></Switch>
                                        </View>
                                        <Text style={styles.titleHint}>{I18n.t('gia_ban_duoc_tinh_theo_phan_tram_gia_tri_don_hang')}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                            <Text style={styles.titleBold}>{I18n.t('so_luong_theo_thoi_gian')}</Text>
                                            <Switch style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} onValueChange={() => setProduct({ ...product, IsTimer: !product.IsTimer })} value={product.IsTimer} trackColor={{ false: "silver", true: colors.colorchinh }}></Switch>
                                        </View>
                                        <Text style={styles.titleHint}>{I18n.t('so_luong_hang_hoa_duoc_tinh_theo_thoi_gian')}</Text>
                                        {product.ProductType == 2 && product.IsTimer == true ?
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                                    <Text style={styles.titleBold}>{I18n.t('thiet_lap_gia_ban_theo_block')}</Text>
                                                    <Switch style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} value={product.IsPriceForBlock} onValueChange={() => setProduct({ ...product, IsPriceForBlock: !product.IsPriceForBlock })} trackColor={{ false: "silver", true: colors.colorchinh }}></Switch>
                                                </View>
                                                <Text style={product.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>{I18n.t("block_theo_phut")}</Text>
                                                <TextInput style={{ color: product.IsPriceForBlock == true ? colors.colorLightBlue : '#B5B5B5', marginHorizontal: 15, fontWeight: 'bold', padding: 10, }} keyboardType={'numbers-and-punctuation'} editable={product.IsPriceForBlock == true ? true : false} value={product.BlockOfTimeToUseService ? currencyToString(product.BlockOfTimeToUseService) : null} onChangeText={(text) => { setProduct({ ...product, BlockOfTimeToUseService: onChangeTextInput(text) }) }}></TextInput>
                                                <Text style={product.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>{I18n.t('so_block_gio_dau_tien')}</Text>
                                                <TextInput style={{ color: product.IsPriceForBlock == true ? colors.colorLightBlue : '#B5B5B5', marginHorizontal: 15, fontWeight: 'bold', padding: 10, }} keyboardType={'numbers-and-punctuation'} editable={product.IsPriceForBlock == true ? true : false} value={priceConfig && priceConfig.Block ? priceConfig.Block + '' : null} onChangeText={(text) => setPriceConfig({ ...priceConfig, Block: onChangeTextInput(text) })}></TextInput>
                                                <Text style={product.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>{I18n.t('gia')} {priceConfig && priceConfig.Block ? priceConfig.Block : 0} {I18n.t('block_dau_tien')}</Text>
                                                <TextInput style={{ color: product.IsPriceForBlock == true ? colors.colorLightBlue : '#B5B5B5', marginHorizontal: 15, fontWeight: 'bold', padding: 10, }} keyboardType={'numbers-and-punctuation'} editable={product.IsPriceForBlock == true ? true : false} value={priceConfig && priceConfig.Value ? currencyToString(priceConfig.Value) : null} onChangeText={(text) => { setPriceConfig({ ...priceConfig, Value: onChangeTextInput(text) }) }}></TextInput>
                                            </View> : null}
                                    </View>
                                    : product ? product.ProductType == 3 ?
                                        <View>
                                            <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10, marginBottom: 10 }}></View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={styles.titleBold}>{I18n.t('thanh_phan_combo')}</Text>
                                                <TouchableOpacity onPress={() => chooseProduct()}>
                                                    <Ionicons name={'right'} size={24} style={{ paddingRight: 15 }} color={'#4a4a4a'} />
                                                </TouchableOpacity>
                                            </View>

                                            {listItemFomular.length > 0 ?
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.titleHint} >{countFormular} {I18n.t('san_pham')}</Text>
                                                    <FlatList
                                                        data={listItemFomular}
                                                        renderItem={({ item, index }) => renderFormular(item, index)}
                                                        keyExtractor={(item, index) => index.toString()}
                                                        //horizontal={true}
                                                        numColumns={2}
                                                        showsHorizontalScrollIndicator={false}
                                                    />
                                                </View>
                                                :
                                                <View>
                                                    <Text style={styles.titleHint}>{I18n.t('chua_co')}</Text>
                                                    <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]} onPress={() => chooseProduct()}>
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
                                        <TextInput style={[styles.textInput, { color: colors.colorLightBlue, fontWeight: 'bold', textAlign: 'center' }]} keyboardType={'numbers-and-punctuation'} value={cost ? currencyToString(cost) : 0 + ''} onChangeText={(text) => setCost(onChangeTextInput(text))}></TextInput>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.title} >{I18n.t('gia')}</Text>
                                        <TextInput style={[styles.textInput, { color: colors.colorLightBlue, fontWeight: 'bold', textAlign: 'center' }]} keyboardType={'numbers-and-punctuation'} value={product && product.Price ? currencyToString(product.Price) : 0 + ''} onChangeText={(text) => setProduct({ ...product, Price: onChangeTextInput(text) })}></TextInput>
                                    </View>
                                </View>
                                {product && product.IsTimer == true ?
                                    <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]} onPress={() => { typeModal.current = 5, setOnShowModal(true) }}>
                                        <Text style={[styles.titleButton]}>{I18n.t("thiet_lap_khung_gio_dac_biet")}</Text>
                                    </TouchableOpacity>
                                    : product.ProductType == 1 ?
                                        <View>
                                            <Text style={styles.title}>{I18n.t('ton_kho')}</Text>
                                            <TextInput style={[styles.textInput, { fontWeight: 'bold', color: colors.colorLightBlue, textAlign: 'center' }]} keyboardType={'numbers-and-punctuation'} value={onHand ? onHand + '' : null} onChangeText={(text) => setOnHand(text)}></TextInput>
                                        </View> : null
                                }

                                <View>
                                    <Text style={styles.title}>{I18n.t('don_vi_tinh')}</Text>
                                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: colors.colorLightBlue }]} value={product ? product.Unit : null} onChangeText={(text) => setProduct({ ...product, Unit: text })}></TextInput>
                                </View>
                                {product && product.ProductType != 2 || product.IsTimer == false ?
                                    <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]} onPress={() => { typeModal.current = 4; setOnShowModal(true) }}>
                                        <Text style={[styles.titleButton]}>{I18n.t("don_vi_tinh_lon_va_cac_thong_so_khac")}</Text>
                                    </TouchableOpacity> : null
                                }
                            </View>
                            <View style={{ padding: 3, backgroundColor: '#f2f2f2', marginTop: 10, }}></View>
                            {product && isFNB == true ?
                                <PrintCook productOl={product} config={priceConfig} printer={printer} countPrint={countPrint.current} outPutPrint={outPutPrinter}></PrintCook> : null}
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#f2f2f2', padding: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            {product.Id ?
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, paddingHorizontal: 7, paddingVertical: 10, justifyContent: 'center', margin: 2, alignItems: 'center', borderRadius: 10 }} onPress={() => { onClickDelete() }}>
                                        <Icon name={'trash-can'} size={24} color={'#fff'} />
                                    </TouchableOpacity>
                                </View> : null
                            }
                            <View style={{ flex: product.Id ? 1 : 0.9 }}>
                                <TouchableOpacity style={{ backgroundColor: colors.colorLightBlue, paddingHorizontal: 7, paddingVertical: 10, justifyContent: 'center', margin: 2, alignItems: 'center', borderRadius: 10 }} onPress={() => { typeModal.current = 7, setOnShowModal(true) }}>
                                    <Icon name={'barcode-scan'} size={24} color={'#fff'} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', flex: deviceType == Constant.PHONE ? 5 : 7 }}>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.colorLightBlue, paddingHorizontal: 2, paddingVertical: 10, justifyContent: 'center', margin: 2, alignItems: 'center', borderRadius: 10 }} onPress={() => { isCoppy.current = true, onClickSave() }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('luu_va_sao_chep')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.colorLightBlue, paddingHorizontal: 2, paddingVertical: 10, justifyContent: 'center', margin: 2, alignItems: 'center', borderRadius: 10 }} onPress={() => { isCoppy.current = false, onClickSave() }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('luu')}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </KeyboardAwareScrollView>
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
                    <View style={[{ width: Metrics.screenWidth * 0.8 }, { marginBottom: Platform.OS == 'ios' ? marginModal : 0 }]}>
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
        color: colors.colorLightBlue,
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
        color: colors.colorLightBlue
    },
    styleButton: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 15, backgroundColor: '#f2f2f2'
    },
    styleButtonOn: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 0.5, padding: 15, backgroundColor: 'white', borderColor: colors.colorLightBlue
    },
    textInput: { backgroundColor: '#f2f2f2', fontSize: 14, marginTop: 5, marginLeft: 15, marginRight: 15, height: 40, borderRadius: 15, height: 50, padding: 10, borderWidth: 0.25, borderColor: 'silver', color: colors.colorLightBlue },
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
    },
    styleBtn: {
        backgroundColor: '#f2f2f2', paddingHorizontal: Metrics.screenWidth * 0.2, borderRadius: 10, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 5, borderWidth: 0.5, borderColor: '#bbbbbb'
    }
})