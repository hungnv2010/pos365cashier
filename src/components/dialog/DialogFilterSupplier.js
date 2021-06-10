import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList,Modal,TouchableWithoutFeedback } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import images from '../../theme/Images';
import { ceil } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';

export default (props) =>{
    const [showModal,setOnShowModal] = useState(false)
    const [supplierGroup, setSupplierGruop] = useState([])
    const typeModal = useRef()
    const [data, setData] = useState({})

    const getSupplierGroup = async() =>{
        let param = {Type:2}
        let res = await new HTTPService().setPath(ApiPath.GROUP_SUPPLIER).GET(param)
        if(res != null){
            console.log("res",res);
            setSupplierGruop(res)
        }
    }
    useEffect(()=>{
        getSupplierGroup()
    },[])
    const onClickChooseProvice = (item) =>{
        setData({...data,provice:item.name})
        setOnShowModal(false)
    }
    const onClickChooseGroup = (item) =>{
        setData({...data,GroupId:item.id, GroupName:item.text})
        setOnShowModal(false)
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
    const onClickOk = () =>{
        props.outputFilter(data)
    }

    const renderModalContent = () =>{
        return(
            <View>
                {
                    typeModal.current == 1 ?
                <View style={{
                    backgroundColor: "#fff", borderRadius: 4,
                    justifyContent: 'center', alignItems: 'center',
                    height: Metrics.screenHeight * 0.6
                }}>
                    <View style={{ paddingVertical: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 15, color: colors.colorLightBlue }}>{I18n.t('chon_tinh_thanh')}</Text>
                        <ScrollView>
                            {
                                Constant.LIST_PROVICE.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => onClickChooseProvice(item)}
                                            key={index} style={{ paddingVertical: 15, }}>
                                            <Text style={{ textAlign: "center" }}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </View>
                :<View style={{
                    backgroundColor: "#fff", borderRadius: 4,
                    justifyContent: 'center', alignItems: 'center',
                    height: Metrics.screenHeight * 0.6
                }}>
                    <View style={{ paddingVertical: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 15, color: colors.colorLightBlue }}>{I18n.t('chon_nhom_nha_cung_cap')}</Text>
                        <ScrollView>
                            {
                                supplierGroup.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => onClickChooseGroup(item)}
                                            key={index} style={{ paddingVertical: 15, }}>
                                            <Text style={{ textAlign: "center" }}>{item.text}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </View>

                }
            </View>
        )
    }
    return(
        <View style={{borderRadius:10,backgroundColor:'#fff'}}>
        <View style={{backgroundColor:'#fff',alignItems:'center',justifyContent:'center',paddingVertical:10,borderTopLeftRadius:10,borderTopRightRadius:10}}>
            <Text>{I18n.t('loc')}</Text>
        </View>
        <ScrollView style={{backgroundColor:'#f2f2f2',borderBottomLeftRadius:10,borderBottomRightRadius:10}}>
        <View style={{paddingVertical:10,paddingHorizontal:10}}>
            <Text>{I18n.t('nhom_nha_cung_cap')}</Text>
            <TouchableOpacity style={styles.styleButton} onPress={()=>{typeModal.current = 2, setOnShowModal(true)}}>
                <Text>{data.GroupName}</Text>
                <Image source={images.icon_arrow_down} />
            </TouchableOpacity>

        </View>
        <View style={{paddingVertical:10,paddingHorizontal:10}}>
            <Text>{I18n.t('ten_nha_cung_cap')}</Text>
            <TextInput style={styles.styleTextInput} value={data.Name?data.Name:''} onChangeText={(text)=>setData({...data,Name:text})} />

        </View>
        <View style={{paddingVertical:10,paddingHorizontal:10}}>
            <Text>{I18n.t('so_dien_thoai')}</Text>
            <TextInput style={styles.styleTextInput} keyboardType={'numeric'} value={data.Phone?data.Phone:''} onChangeText={(text)=>setData({...data,Phone:text})} />

        </View>
        <View style={{paddingVertical:10,paddingHorizontal:10}}>
            <Text>{I18n.t('tinh_thanh')}</Text>
            <TouchableOpacity style={styles.styleButton} onPress={()=>{typeModal.current = 1, setOnShowModal(true)}}>
                <Text>{data.provice}</Text>
                <Image source={images.icon_arrow_down} />
            </TouchableOpacity>

        </View>
        <View style={{flexDirection:'row',paddingVertical:10,paddingHorizontal:10}}>
            <View style={{flex:1,marginRight:5}}>
                <Text>{I18n.t('du_no')} {I18n.t('tu')} (VND)</Text>
                <TextInput style={styles.styleTextInput} value={data.DebtFrom?currencyToString(data.DebtFrom):0+''} onChangeText={(text)=>{setData({...data,DebtFrom:onChangeTextInput(text)})}}/>
            </View>
            <View style={{flex:1,marginLeft:5}}>
                <Text>{I18n.t('den')} (VND)</Text>
                <TextInput style={styles.styleTextInput} value={data.DebtTo?currencyToString(data.DebtTo):0+''} onChangeText={(text)=>{setData({...data,DebtTo:onChangeTextInput(text)})}}/>
            </View>
        </View>
        </ScrollView>
        <TouchableOpacity style={{marginHorizontal:30,paddingVertical:10,marginVertical:20,backgroundColor:colors.colorLightBlue,alignItems:'center',justifyContent:'center',borderRadius:10}} onPress={()=>onClickOk()}>
            <Text style={{fontWeight:'bold',color:'#fff'}}>{I18n.t('xong')}</Text>
        </TouchableOpacity>
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
                    <View style={{ width: Metrics.screenWidth * 0.6, }}>
                        {renderModalContent()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    styleTextInput:{
        backgroundColor:'#fff',paddingVertical:10,borderRadius:10,marginTop:7,paddingHorizontal:5,color:'#000'
    },
    styleButton:{backgroundColor:'#fff',justifyContent:'space-between',alignItems:'flex-end',paddingVertical:5,borderRadius:10,flexDirection:'row',paddingHorizontal:10,marginTop:7}
})