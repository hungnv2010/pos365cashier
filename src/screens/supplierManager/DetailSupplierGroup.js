import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, FlatList, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, TextInput, Keyboard, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import colors from '../../theme/Colors';
import { Images, Metrics } from '../../theme';
import { Checkbox } from 'react-native-paper';
import { currencyToString, dateToStringFormatUTC } from '../../common/Utils';
import moment from 'moment';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { ApiPath } from '../../data/services/ApiPath';
import { HTTPService } from '../../data/services/HttpService';
import dialogManager from '../../components/dialog/DialogManager';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';



export default (props) => {

    const [detailGroup, setDetailGroup] = useState({})
    const [listMember, setListMember] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [margin, setMargin] = useState(0)
    const ModifiedBy = useRef()
    const backupDetailGroup = useRef()

    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    })

    useEffect(() => {
        console.log('DetailSupplierGroup allPer ', allPer);
        if (deviceType == Constant.PHONE) {
            getDataForPhone(props.route.params)
        }
    }, [])

    useEffect(() => {
        if (deviceType == Constant.TABLET) {

            console.log('detailGroup props', props.detailGroup);
            setDetailGroup(props.detailGroup)
            backupDetailGroup.current = props.detailGroup
            const getVendorSession = async () => {
                let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true)
                vendorSession = JSON.parse(vendorSession)
                if (vendorSession && vendorSession.CurrentUser && vendorSession.CurrentUser.Id) ModifiedBy.current = vendorSession.CurrentUser.Id
            }
            getVendorSession()
        }
    }, [props.detailGroup])

    useEffect(() => {
        if (detailGroup.Id === 0) setShowModal(true)
        listMember.length = 0 //reset list member
        const getListMember = async () => {
            let branchId = await getBranchId()
            let paramsForPartner = {
                GroupId: -1,
                Type: 2,
                BranchId: branchId
            }
            let customer = await new HTTPService().setPath(ApiPath.CUSTOMER).GET(paramsForPartner)
            if (customer && customer.results && customer.results.length > 0) {
                customer.results.forEach(element => {
                    element.PartnerGroupMembers.forEach(item => {
                        if (item.GroupId == detailGroup.id) {
                            listMember.push(element)
                        }
                    })
                });
            }
            console.log('listMember', listMember);
            setListMember([...listMember])
        }
        getListMember()
    }, [detailGroup])
    const getDataForPhone = (param) => {
        let data = JSON.parse(JSON.stringify(param.detailGroup))
        console.log("data", data);
        setDetailGroup(data)
    }

    const getBranchId = async () => {
        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        if (branch) {
            return (JSON.parse(branch)).Id
        }
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

    const renderListMember = (item, index) => {
        return (
            <View key={index.toString()}
                style={{ flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "white", marginBottom: 5, borderRadius: 10 }}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                    <View style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center", backgroundColor: index % 2 == 0 ? colors.colorPhu : colors.colorLightBlue, borderRadius: 30, marginRight: 10 }}>
                        <Text style={{ color: "#fff", fontSize: 24, textTransform: "uppercase" }}>{item.Name[0]}</Text>
                    </View>
                    <View style={{ flex: 1.3 }}>
                        <Text
                            numberOfLines={1}
                            style={{ fontSize: 15, fontWeight: "bold", }}>{item.Name}</Text>
                        <Text style={{ paddingVertical: 5 }}>{item.Code}</Text>
                        <Text style={{}}>{I18n.t('diem_thuong')}: {currencyToString(item.Point)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 10 }}>
                            <Icon name="phone" size={24} color={colors.colorchinh} style={{ marginRight: 10 }} />
                            <Text>{item.Phone ? item.Phone : I18n.t('chua_cap_nhat')}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <Icon name="home" size={24} color={colors.colorchinh} style={{ marginRight: 10 }} />
                            <TextTicker>{item.Address ? item.Address : I18n.t('chua_cap_nhat')}</TextTicker>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const onChangeText = (text, type) => {
        switch (type) {
            case 1:
                setDetailGroup({ ...detailGroup, text: text })
                break;
            // case 2:
            //     text = text.replace(/,/g, "");
            //     if (isNaN(text)) return
            //     setDetailGroup({ ...detailGroup, DiscountRatio: text })
            //     break;
            // case 3:
            //     text = text.replace(/,/g, "");
            //     if (isNaN(text)) return
            //     setDetailGroup({ ...detailGroup, FromRevenue: text })
            //     break;
            // case 4:
            //     text = text.replace(/,/g, "");
            //     if (isNaN(text)) return
            //     setDetailGroup({ ...detailGroup, ToRevenue: text })
            //     break;
            default:
                break;
        }
    }

    const onClickDelete = async () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_nhom_nha_cung_cap'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(`${ApiPath.GROUP_CUSTOMER}/${detailGroup.id}`).DELETE()
                    .then(res => {
                        if (res){
                            if (deviceType == Constant.TABLET) {
                                props.onClickDone(true)
                            }else{
                                props.route.params. _onSelect(true)
                                props.navigation.pop()
                            }
                        }
                         
                    })
                    .catch(err => console.log('onClickDelete err', err))
            }
        })
    }

    const onClickDone = async () => {
        let PartnerGroup = { ...detailGroup }
        PartnerGroup.Discount = null
        PartnerGroup.Type = 2
        PartnerGroup.Name = PartnerGroup.text
        delete PartnerGroup.text
        if (detailGroup.Id !== 0) {
            PartnerGroup.ModifiedBy = ModifiedBy.current
            PartnerGroup.ModifiedDate = moment()
        }
        let params = {}
        params.PartnerGroup = PartnerGroup
        try {
            let res = await new HTTPService().setPath(ApiPath.GROUP_CUSTOMER).POST(params)
            console.log('onClickDone res', res);
            if (res) props.onClickDone(true)
        } catch (error) {
            console.log('onClickDone err', error);
        }
        setShowModal(false)
    }

    const renderModal = () => {
        return (
            <View style={{ backgroundColor: "white", borderRadius: 20 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ flex: 1, textAlign: "center", padding: 15, color: "black", fontWeight: "bold", fontSize: 24 }}>{detailGroup.Id !== 0 ? I18n.t('cap_nhat_nhom') : I18n.t('them_moi_nhom')}</Text>
                    <TouchableOpacity onPress={() => {
                        // setDetailGroup(backupDetailGroup.current)
                        setShowModal(false)
                    }}>
                        <Image source={Images.ic_remove} style={{ margin: 20, width: 20, height: 20 }} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20, paddingTop: 10, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <Image source={Images.new_construction} style={{ marginBottom: 20, width: 60, height: 60 }} />
                    <View style={{ width: "100%", flexDirection: "column", marginBottom: 20, alignItems: "center" }}>
                        <Text style={{ width: "100%", paddingBottom: 15 }}>{I18n.t('ten_nhom')}</Text>
                        <TextInput
                            style={{ width: "100%", borderWidth: 0.5, padding: 15, borderRadius: 4, borderColor: colors.colorLightBlue, color:'#000' }}
                            value={detailGroup.text}
                            onChangeText={text => { onChangeText(text, 1) }}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ width: "100%", borderWidth: 0.5, padding: 15, borderRadius: 4, borderColor: colors.colorLightBlue, backgroundColor: detailGroup.text && detailGroup.text != "" ? colors.colorLightBlue : "#fff", alignItems: "center" }}
                        onPress={onClickDone}
                    >
                        <Text style={{ color: detailGroup.text && detailGroup.text != "" ? "white" : "gray", fontWeight: "bold" }}>{I18n.t('tao_nhom')}</Text>
                    </TouchableOpacity>
                    {/* <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        {
                            detailGroup.Id !== 0 ?
                                <TouchableOpacity
                                    style={{ paddingVertical: 7, paddingHorizontal: 15, backgroundColor: "#e84e40", borderRadius: 5 }}
                                    onPress={onClickDelete}
                                >
                                    <Text style={{ color: "white", fontWeight: "bold" }}>{I18n.t('xoa')}</Text>
                                </TouchableOpacity>
                                :
                                null
                        }
                        <View style={{ flexDirection: "row", }}>
                            <TouchableOpacity
                                style={{ marginRight: 20, borderRadius: 5, paddingVertical: 7, paddingHorizontal: 15, backgroundColor: "#ffc107" }}
                                onPress={onClickDone}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>{I18n.t('luu')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ borderRadius: 5, paddingVertical: 7, paddingHorizontal: 15, backgroundColor: "#0072bc" }}
                                onPress={() => {
                                    setDetailGroup(backupDetailGroup.current)
                                    setShowModal(false)
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>{I18n.t('huy')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View> */}
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, borderLeftWidth: 0.5 }}>
            {deviceType == Constant.PHONE ?
                <ToolBarDefault
                    {...props}
                    title={detailGroup.Id == 0 ? I18n.t('them_moi_nhom') : I18n.t('cap_nhat_nhom')}
                />
                : null
            }
            <View style={{ flex: 2, backgroundColor: "white", }}>
                <View style={{ flex: 1, backgroundColor: "#f2f2f2", borderRadius: 30, marginHorizontal: 30, marginVertical: 20, alignItems: "center", justifyContent: "center" }}>
                    <Image style={{ width: 60, height: 60, marginBottom: 20 }} source={Images.ic_nhomkhachhang} />
                    <Text style={{ fontSize: 20, color: colors.colorLightBlue, fontWeight: "bold" }}>{detailGroup.text}</Text>
                </View>
                <View style={{ flexDirection: "row", margin: 20, alignSelf: "center" }}>
                    {
                        allPer.Partner_Update || allPer.IsAdmin ?
                            <TouchableOpacity
                                style={{ flexDirection: "row", marginRight: 15, backgroundColor: "#fde7d2", borderRadius: 10 }}
                                onPress={() => { setShowModal(true) }}>
                                <Text style={{ color: colors.colorchinh, padding: 15, fontWeight: "bold" }}>{I18n.t('chinh_sua')}</Text>
                            </TouchableOpacity>
                            :
                            null
                    }
                    {
                        allPer.Partner_Delete || allPer.IsAdmin ?
                            <TouchableOpacity
                                style={{ flexDirection: "row", marginLeft: 15, backgroundColor: "#F7DCDC", borderRadius: 10 }}
                                onPress={onClickDelete}
                            >
                                <Text style={{ color: "#f21e3c", paddingVertical: 15, paddingHorizontal: 30, fontWeight: "bold" }}>{I18n.t('xoa')}</Text>
                            </TouchableOpacity>
                            :
                            null
                    }
                </View>
            </View>
            <View style={{ flex: 3, }}>
                <View style={{ flexDirection: "row", padding: 10, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold", color: "#c3c3c3" }}>{I18n.t('thanh_vien_trong_nhom')}</Text>
                    <Text style={{ fontWeight: "bold", color: "#c3c3c3" }}>{listMember.length}</Text>
                </View>
                <FlatList
                    data={listMember}
                    renderItem={({ item, index }) => renderListMember(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>

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
                            setShowModal(false)
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
                    <View style={[{ width: Metrics.screenWidth * 0.8 },{ marginBottom: Platform.OS == 'ios' ? margin : 0 }]}>
                        {renderModal()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}
