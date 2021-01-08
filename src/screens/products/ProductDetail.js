import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Modal, Text, FlatList, Switch, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image,TouchableWithoutFeedback } from 'react-native';
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

export default (props) => {
    const [product, setProduct] = useState({})
    const [productOl, setProductOl] = useState({})
    const [category, setCategory] = useState({})
    const [displayProduct, setDisplayProduct] = useState(true)
    const [quantityOverTime, setQuantityOverTime] = useState(true)
    const [priceByBlock, setPriceByBlock] = useState(true)
    const [showModal,setOnShowModal] = useState(false)
    const typeModal = useRef()
    useEffect(() => {
        getData(props.route.params)
        console.log("Image", typeof (product.ProductImages));
    }, [])
    const getData = (param) => {
        setProduct(JSON.parse(JSON.stringify(param.product)))
        console.log("afsdfsa", product.Id);
        console.log("data product", product);
        setCategory(JSON.parse(JSON.stringify(param.category)))
    }

    const getProduct = () => {
        console.log("afsdfsa get product", product.Id)
        if (product.Code != null) {
            let paramFilter = `(substringof('${product.Code}',Code) or substringof('${product.Code}',Name) or substringof('${product.Code}',Code2) or substringof('${product.Code}',Code3) or substringof('${product.Code}',Code4) or substringof('${product.Code}',Code5))`
            new HTTPService().setPath(ApiPath.PRODUCT).GET({ ncludeSummary: true, Inlinecount: 'allpages', CategoryId: -1, PartnerId: 0, top: 20, filter: paramFilter }).then((res) => {
                if (res != null) {
                    setProductOl({ ...res.results[0] })
                    console.log("res product", res);
                }
            }).catch((e) => {
                console.log("error", e);
            })
        }

    }
    useEffect(() => {
        console.log("afsdfsa", product.Id);
        getProduct()
    }, [product.Code])
    useEffect(() => {
        console.log('product Ol', productOl);
    }, [productOl])
    const renderModal=()=>{
        return(
            <View>
                <DialogSingleChoice listItem={category} title='Chon' titleButton='Ok'></DialogSingleChoice>
            </View>
        )
    }
    return (

        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('chi_tiet_hang_hoa')}
                clickLeftIcon={() => { props.navigation.goBack() }}
            />
            <ScrollView>
                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Image style={{ width: 70, height: 70, }} source={Images.icon_product} />
                </View>
                <View style={{ padding: 3, backgroundColor: '#E8E8E8' }}></View>
                <View>
                    <Text style={styles.title}>{I18n.t('ten_hang_hoa')}</Text>
                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#00BFFF' }]} value={product.Name}></TextInput>
                </View>
                <View>
                    <Text style={styles.title}>{I18n.t('loai_hang')}</Text>
                    <TouchableOpacity style={[styles.textInput, { justifyContent: 'space-between', flexDirection: 'row' }]} onPress={()=>setOnShowModal(true)} >
                        <Text style={styles.titleButton}>{product.ProductType == 1 ? I18n.t('hang_hoa') : product.ProductType == 2 ? I18n.t('dich_vu') : I18n.t('Combo')}</Text>
                        <Image style={{ width: 20, height: 20, }} source={Images.icon_arrow_down} />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={styles.title}>Mã hàng/ SKU/ Mã vạch</Text>
                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#00BFFF' }]} value={product.Code}></TextInput>
                </View>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.title}>{I18n.t('ten_nhom')}</Text>
                        <Text style={[styles.title, { marginRight: 10, color: '#00BFFF' }]}>{I18n.t('them_moi')}</Text>
                    </View>
                    <TouchableOpacity style={[styles.textInput, { justifyContent: 'space-between', flexDirection: 'row' }]} >
                        <Text style={styles.titleButton}>{productOl.Category ? productOl.Category.Name : null}</Text>
                        <Image style={{ width: 20, height: 20, }} source={Images.icon_arrow_down} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 3, backgroundColor: '#E8E8E8', marginTop: 10 }}></View>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                        <Text style={styles.titleBold}>{I18n.t('hien_thi_hang_hoa')}</Text>
                        <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} value={displayProduct} onValueChange={() => setDisplayProduct(!displayProduct)}></Switch>
                    </View>
                    <Text style={styles.titleHint}>Hiển thị sản phẩm trên danh sách của màn hình thu ngân</Text>
                    {
                        displayProduct == true ? <View style={{ flexDirection: 'column' }}>
                            {
                                product.ProductType == 2 ?
                                    <View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                            <Text style={styles.titleBold}>{I18n.t('tinh_theo_phan_tram')}</Text>
                                            <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} ></Switch>
                                        </View>
                                        <Text style={styles.titleHint}>Giá bán được tinh theo % giá trị của đơn hàng</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                            <Text style={styles.titleBold}>{I18n.t('so_luong_theo_thoi_gian')}</Text>
                                            <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} onValueChange={() => setProductOl({ ...productOl, IsTimer: !productOl.IsTimer })} value={productOl.IsTimer}></Switch>
                                        </View>
                                        <Text style={styles.titleHint}>Số lượng của hàng hoá được tính theo thời gian sử dụng</Text>
                                        {productOl.IsTimer==true ?
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, alignItems: 'center' }}>
                                                    <Text style={styles.titleBold}>{I18n.t('thiet_lap_gia_ban_theo_block')}</Text>
                                                    <Switch style={{ transform: [{ scaleX: .6 }, { scaleY: .6 }] }} value={productOl.IsPriceForBlock} onValueChange={() => setProductOl({ ...productOl, IsPriceForBlock: !productOl.IsPriceForBlock })}></Switch>
                                                </View>
                                                <Text style={productOl.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>Block tính theo phút</Text>
                                                <TextInput style={{ color: productOl.IsPriceForBlock == true ? '#00BFFF' : '#B5B5B5', marginLeft: 5, fontWeight: 'bold', padding: 10 }} value={product.BlockOfTimeToUseService ? currencyToString(product.BlockOfTimeToUseService) : null}></TextInput>
                                                <Text style={productOl.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>Số block giờ đầu tiên</Text>
                                                <TextInput style={{ color: productOl.IsPriceForBlock == true ? '#00BFFF' : '#B5B5B5', marginLeft: 5, fontWeight: 'bold', padding: 10 }} value={product.PriceConfig ? JSON.parse(product.PriceConfig).Block + '' : null}></TextInput>
                                                <Text style={productOl.IsPriceForBlock == false ? styles.titleHint : { marginLeft: 15 }}>Giá 4 block đầu tiên</Text>
                                                <TextInput style={{ color: productOl.IsPriceForBlock == true ? '#00BFFF' : '#B5B5B5', marginLeft: 5, fontWeight: 'bold', padding: 10 }} value={product.Price ? currencyToString(product.Price) : null}></TextInput>
                                            </View> : null}
                                    </View>
                                    : null
                            }
                            <View style={{ padding: 3, backgroundColor: '#E8E8E8', marginTop: 10 }}></View>
                            <View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.title}>{I18n.t('gia_von')}</Text>
                                        <TextInput style={[styles.textInput, { color: '#00BFFF', fontWeight: 'bold' }]} value={productOl.Cost ? currencyToString(productOl.Cost) : null}></TextInput>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.title} >{I18n.t('gia')}</Text>
                                        <TextInput style={[styles.textInput, { color: '#00BFFF', fontWeight: 'bold' }]} value={product.Price ? currencyToString(product.Price) : null}></TextInput>
                                    </View>
                                </View>
                                {product.ProductType == 2 ?
                                    <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={[styles.titleButton]}>Thiết lập khung giờ đặc biệt</Text>
                                    </TouchableOpacity>
                                    :
                                    <View>
                                        <Text style={styles.title}>{I18n.t('ton_kho')}</Text>
                                        <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#00BFFF', textAlign: 'center' }]} value={productOl.OnHand ? productOl.OnHand + '' : null}></TextInput>
                                    </View>
                                }

                                <View>
                                    <Text style={styles.title}>{I18n.t('don_vi_tinh')}</Text>
                                    <TextInput style={[styles.textInput, { fontWeight: 'bold', color: '#00BFFF' }]} value={product.Unit ? product.Unit : null}></TextInput>
                                </View>
                                <TouchableOpacity style={[styles.textInput, { fontWeight: 'bold', backgroundColor: '#B0E2FF', marginTop: 10, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={[styles.titleButton]}>Đơn vị tính lớn và các thông số khác</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ padding: 3, backgroundColor: '#E8E8E8', marginTop: 10, }}></View>
                            <View style={{ marginBottom: 10 }}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 5, marginTop: 10, marginBottom: 10 }}>
                                    <Text style={styles.titleBold}>{I18n.t('bao_che_bien')}</Text>
                                    <Text style={{ color: 'silver', marginRight: 10 }}>Số máy in tối đa   /5</Text>
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity style={[styles.styleButton, { marginLeft: 15 }]}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_bep_a')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButton}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_bep_b')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButton}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_bep_c')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButton}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_bep_d')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity style={[styles.styleButton, { marginLeft: 15 }]}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_pha_che_a')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButton}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_pha_che_b')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButton}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_pha_che_c')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.styleButton}>
                                            <Text style={styles.titleButtonOff}>{I18n.t('may_in_bao_pha_che_d')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View> : null}
                </View>
                <View style={{ backgroundColor: '#E8E8E8', padding: 10 }}>
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#00AE72', padding: 10, justifyContent: 'center', margin: 7, alignItems: 'center', borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('luu_va_sao_chep')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#00BFFF', padding: 10, justifyContent: 'center', margin: 7, alignItems: 'center', borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('luu')}</Text>
                            </TouchableOpacity>
                        </View>
                        {product != {} ?
                        <View>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#FF3030', padding: 10, justifyContent: 'center', margin: 7, alignItems: 'center', borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{I18n.t('xoa')}</Text>
                            </TouchableOpacity> 
                            </View>: null
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
        color: '#00BFFF'
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
        color: '#00BFFF'
    },
    styleButton: {
        flex: 1, marginRight: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderWidth: 0.5, padding: 5, backgroundColor: '#E8E8E8', flexDirection: 'row'
    },
    textInput: { backgroundColor: '#E8E8E8', marginTop: 5, marginLeft: 15, marginRight: 15, height: 40, borderRadius: 10, padding: 10, borderWidth: 0.25, borderColor: 'silver' },
    titleHint: {
        marginLeft: 15, marginRight: 10, color: '#B5B5B5', marginBottom: 5, marginTop: 5
    },
    textHintBold: {
        marginLeft: 15, fontWeight: 'bold', marginRight: 10, color: '#B5B5B5', marginBottom: 5, marginTop: 10
    },
    titleBold:
        { fontWeight: 'bold', fontSize: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 10, textTransform: 'uppercase' },
    backgroundModal:{
        backgroundColor:'white',
        borderRadius:5
    }


})