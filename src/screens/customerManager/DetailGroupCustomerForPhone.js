import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, FlatList, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, TextInput, NativeEventEmitter, NativeModules, Platform, Keyboard } from 'react-native';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TextTicker from 'react-native-text-ticker';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Fontisto';



export default (props) => {

    const [detailGroup, setDetailGroup] = useState({})
    const [listMember, setListMember] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [marginModal, setMargin] = useState(0)
    const ModifiedBy = useRef()
    const backupDetailGroup = useRef()
    const allPer = useSelector(state => {
        return state.Common.allPer
    })


    useEffect(() => {
        var keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
        var keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    useEffect(() => {
        console.log('detailGroup props', props);
        setDetailGroup(props.route.params.detailGroup)
        backupDetailGroup.current = props.route.params.detailGroup
        const getVendorSession = async () => {
            let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true)
            vendorSession = JSON.parse(vendorSession)
            if (vendorSession && vendorSession.CurrentUser && vendorSession.CurrentUser.Id) ModifiedBy.current = vendorSession.CurrentUser.Id
        }
        getVendorSession()
    }, [props.route.params.detailGroup])

    useEffect(() => {
        if (detailGroup.Id === 0) setShowModal(true)
        listMember.length = 0 // reset list member
        const getListMember = async () => {
            let customer = await new HTTPService().setPath(ApiPath.SYNC_PARTNERS).GET()
            if (customer && customer.Data && customer.Data.length > 0) {
                customer.Data.forEach(element => {
                    element.PartnerGroupMembers.forEach(item => {
                        if (item.GroupId == detailGroup.Id) {
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


    const _keyboardDidHide = () => {
        setMargin(0)
    }

    const _keyboardDidShow = () => {
        setMargin(Metrics.screenWidth / 1.5)
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
                setDetailGroup({ ...detailGroup, Name: text })
                break;
            case 2:
                text = text.replace(/,/g, "");
                if (isNaN(text)) return
                setDetailGroup({ ...detailGroup, DiscountRatio: text })
                break;
            case 3:
                text = text.replace(/,/g, "");
                if (isNaN(text)) return
                setDetailGroup({ ...detailGroup, FromRevenue: text })
                break;
            case 4:
                text = text.replace(/,/g, "");
                if (isNaN(text)) return
                setDetailGroup({ ...detailGroup, ToRevenue: text })
                break;
            default:
                break;
        }
    }

    const onClickDelete = async () => {
        // setShowModal(!showModal)
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_nhom_khach_hang'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(`${ApiPath.GROUP_CUSTOMER}/${detailGroup.Id}`).DELETE()
                    .then(res => {
                        if (res) props.route.params._onSelect(true)
                        props.navigation.goBack()
                    })
                    .catch(err => console.log('onClickDelete err', err))
            }
        })
    }

    const onClickDone = async () => {
        let PartnerGroup = { ...detailGroup }
        PartnerGroup.Discount = null
        PartnerGroup.Type = 1
        if (detailGroup.Id !== 0) {
            PartnerGroup.ModifiedBy = ModifiedBy.current
            PartnerGroup.ModifiedDate = moment()
        }
        let params = {}
        params.PartnerGroup = PartnerGroup
        try {
            let res = await new HTTPService().setPath(ApiPath.GROUP_CUSTOMER).POST(params)
            console.log('onClickDone res', res);
            if (res) {
                props.route.params._onSelect(true)
            }
            props.navigation.goBack()
        } catch (error) {
            console.log('onClickDone err', error);
            props.navigation.goBack()
        }
        setShowModal(false)
    }

    const renderModal = () => {
        return (
            <View style={{ backgroundColor: "white", }}>
                <View style={{ backgroundColor: colors.colorchinh, }}>
                    <Text style={{ padding: 15, color: "white", fontWeight: "bold" }}>{detailGroup.Id !== 0 ? I18n.t('cap_nhat_nhom') : I18n.t('them_moi_nhom')}</Text>
                </View>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: "row", marginBottom: 20, alignItems: "center" }}>
                        <Text style={{ flex: 3 }}>{I18n.t('ten_nhom')}</Text>
                        <TextInput
                            style={{ flex: 7, borderWidth: 0.5, padding: 7, borderRadius: 4, backgroundColor: "#D5D8DC", color: "black" }}
                            value={detailGroup.Name}
                            onChangeText={text => { onChangeText(text, 1) }}
                        />
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 20, alignItems: "center" }}>
                        <Text style={{ flex: 3 }}>{I18n.t('chiet_khau')}</Text>
                        <View style={{ flex: 7, flexDirection: "row" }}>
                            <TextInput
                                style={{ flex: 1, borderWidth: 0.5, padding: 7, borderRadius: 4, backgroundColor: "#D5D8DC", color: "black" }}
                                value={detailGroup.DiscountRatio ? currencyToString(detailGroup.DiscountRatio) : "0"}
                                onChangeText={text => { onChangeText(text, 2) }}
                            />
                            <Icon name="percent" size={20} style={{ position: "absolute", right: 0, top: 6 }} color="grey" />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 10, alignItems: "center", }}>
                        <Checkbox.Android
                            status={detailGroup.AutomaticallyAddMembers ? "checked" : "unchecked"}
                            color={colors.colorchinh}
                            onPress={() => {
                                setDetailGroup({ ...detailGroup, AutomaticallyAddMembers: !detailGroup.AutomaticallyAddMembers })
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{}}>{I18n.t('tu_dong_them_doi_tac_vao_nhom')}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 15 }}>
                        <View style={{ marginRight: 10, flex: 1, }}>
                            <Text style={{ marginBottom: 10, marginLeft: 5 }}>{I18n.t('tu')}</Text>
                            <TextInput
                                editable={detailGroup.AutomaticallyAddMembers === true}
                                style={{ borderWidth: 0.5, padding: 7, borderRadius: 4, backgroundColor: "#D5D8DC", color: "black" }}
                                value={detailGroup.FromRevenue ? currencyToString(detailGroup.FromRevenue) : "0"}
                                onChangeText={text => { onChangeText(text, 3) }}
                            />
                        </View>
                        <View style={{ flex: 1, }}>
                            <Text style={{ marginBottom: 10, marginLeft: 5 }}>{I18n.t('den')}</Text>
                            <TextInput
                                editable={detailGroup.AutomaticallyAddMembers === true}
                                style={{ borderWidth: 0.5, padding: 7, borderRadius: 4, backgroundColor: "#D5D8DC", color: "black" }}
                                value={detailGroup.ToRevenue ? currencyToString(detailGroup.ToRevenue) : "0"}
                                onChangeText={text => { onChangeText(text, 4) }}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>

                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <TouchableOpacity
                                style={{ marginRight: 20, borderRadius: 5, paddingVertical: 7, paddingHorizontal: 15, backgroundColor: colors.colorLightBlue, flex: 1 }}
                                onPress={onClickDone}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{I18n.t('luu')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ borderRadius: 5, paddingVertical: 7, paddingHorizontal: 15, backgroundColor: "grey", flex: 1 }}
                                onPress={() => {
                                    setDetailGroup(backupDetailGroup.current)
                                    setShowModal(false)
                                    props.navigation.goBack()
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>{I18n.t('huy')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, borderLeftWidth: 0.5 }}>
            <ToolBarDefault
                navigation={props.navigation}
                title={detailGroup.Id !== 0 ? I18n.t('cap_nhat_nhom') : I18n.t('them_moi_nhom')}
            />
            {
                detailGroup.Id == 0 ?
                    null
                    :
                    <>
                        <View style={{ flex: 2, backgroundColor: "white", }}>
                            <View style={{ flex: 1, backgroundColor: "#f2f2f2", borderRadius: 30, marginHorizontal: 20, marginVertical: 20, alignItems: "center", justifyContent: "center" }}>
                                <View style={{ padding: 15 }}>
                                    <Image style={{ width: 40, height: 40, }} source={Images.ic_khachhang} />
                                </View>
                                <Text style={{ fontSize: 20, color: colors.colorLightBlue, fontWeight: "bold" }}>{detailGroup.Name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center",marginBottom:20 }}>
                                {allPer.Partner_Update || allPer.IsAdmin ?
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", marginRight: 5, backgroundColor: "#fde7d2", borderRadius: 20, alignItems: 'center', paddingHorizontal: 10, width: (Metrics.screenWidth / 2) - 25,justifyContent:'center' }}
                                        onPress={() => { setShowModal(true) }}>
                                        <Image source={Images.icon_edit} style={{ width: 16, height: 16 }} />
                                        <Text style={{ color: colors.colorchinh, padding: 15, fontWeight: "bold" }}>{I18n.t('chinh_sua')}</Text>
                                    </TouchableOpacity>
                                    : null
                                }
                                {allPer.Partner_Delete || allPer.IsAdmin ?
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", marginLeft: 5, backgroundColor: "#F7DCDC", borderRadius: 20, alignItems: 'center', paddingHorizontal: 10, width: (Metrics.screenWidth / 2) - 25,justifyContent:'center' }}
                                        onPress={onClickDelete}
                                    >
                                        <Ionicons name={'trash'} size={17} color={'#f21e3c'} />
                                        <Text style={{ color: "#f21e3c", paddingVertical: 15, paddingHorizontal: 30, fontWeight: "bold" }}>{I18n.t('xoa')}</Text>
                                    </TouchableOpacity>
                                    : null
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
                    </>
            }

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
                    <View style={{
                        width: Metrics.screenWidth * 0.8,
                        marginBottom: Platform.OS == 'ios' ? marginModal : 0
                    }}>
                        {renderModal()}
                    </View>
                </View>
            </Modal>
        </View>
    )
}
