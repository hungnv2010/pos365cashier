import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity, Keyboard, Linking, ScrollView, NativeEventEmitter, NativeModules, Modal, TouchableWithoutFeedback } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { FAB } from 'react-native-paper';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import colors from '../../theme/Colors';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import DetailCustomerGroup from '../customerManager/DetailCustomerGroup';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import DetailSupplierGroup from './DetailSupplierGroup';
import { useFocusEffect } from '@react-navigation/native';


export default (props) => {

    const [listGroup, setListGroup] = useState([])
    const [detailGroup, setDetailGroup] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [margin, setMargin] = useState(0)
    const ModifiedBy = useRef()
    //const [allPer, setPer] = useState(props.route.params.permission ? props.route.params.permission : {})
    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        getListGroup()
    }, [])

    useEffect(() => {
        if (listGroup.length > 0) {
            setDetailGroup(listGroup[0])
        }
    }, [listGroup])
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

    const getBranchId = async () => {
        let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
        if (branch) {
            return (JSON.parse(branch)).Id
        }
    }

    const getListGroup = async () => {
        let branchId = await getBranchId()
        let params = { type: 2 }
        let paramsForPartner = {
            GroupId: -1,
            Type: 2,
            BranchId: branchId
        }
        try {
            let allList = await new HTTPService().setPath(ApiPath.GROUP_SUPPLIER).GET(params)
            let allPartner = await new HTTPService().setPath(ApiPath.CUSTOMER).GET(paramsForPartner)
            console.log('getListGroup res', allList, allPartner);
            if (allList.length > 0) {
                allList = allList.filter(item => !item.selected)
                if (allPartner && allPartner.results && allPartner.results.length > 0) {
                    allList.forEach(element => {
                        element.totalMember = 0
                        allPartner.results.forEach(cus => {
                            cus.PartnerGroupMembers.forEach(item => {
                                if (item.GroupId == element.id) {
                                    element.totalMember += 1
                                }
                            })
                        });
                    });
                }
                setListGroup([...allList])
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    const onClickItem = (item) => {
        // setDetailGroup(item)
        if (deviceType == Constant.TABLET) {
            setDetailGroup(item)
        } else {
            props.navigation.navigate(ScreenList.DetailSupplierGroup, { detailGroup: item, _onSelect: onClickDone })
        }
    }



    const onClickAdd = () => {
        if (deviceType == Constant.TABLET) {
            setDetailGroup({ Id: 0 })
        } else {
            setDetailGroup({ Id: 0 })
            setShowModal(true)
            //props.navigation.navigate(ScreenList.DetailGroupCustomerForPhone, { detailGroup: { Id: 0 }, _onSelect: onClickDone })
        }
    }

    const onClickDone = (status) => {
        if (status) getListGroup()
    }
    const onChangeText = (text, type) => {
        
        setDetailGroup({ text: text })
    }
    const onClickAddDone = async () => {
        let PartnerGroup = { ...detailGroup }
        PartnerGroup.Discount = null
        PartnerGroup.Type = 2
        PartnerGroup.Name = PartnerGroup.text
        delete PartnerGroup.text
        // if (detailGroup.Id !== 0) {
        //     PartnerGroup.ModifiedBy = ModifiedBy.current
        //     PartnerGroup.ModifiedDate = moment()
        // }
        let params = {}
        params.PartnerGroup = PartnerGroup
        try {
            let res = await new HTTPService().setPath(ApiPath.GROUP_CUSTOMER).POST(params)
            console.log('onClickDone res', res);
            if (res) onClickDone(true)
        } catch (error) {
            console.log('onClickDone err', error);
        }
        setShowModal(false)
    }

    const renderListItem = (item, index) => {
        let backgroundColor = null;
        return (
            <TouchableOpacity onPress={() => onClickItem(item)} key={index.toString()}
                style={{ flexDirection: "row", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 1, padding: 10, backgroundColor: backgroundColor }}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                    <Image style={{ width: 60, height: 60, marginRight: 20 }} source={Images.ic_nhomkhachhang} />
                    <View style={{ flex: 1.3 }}>
                        <Text
                            numberOfLines={1}
                            style={{ fontSize: 15, fontWeight: "bold", color: colors.colorLightBlue }}>{item.text}</Text>
                        <Text style={{ paddingVertical: 10, color: "grey" }}>{item.totalMember} {I18n.t('nha_cung_cap')}</Text>
                    </View>

                </View>
            </TouchableOpacity>
        )
    }
    const renderModal = () => {
        return (
            <View style={{ backgroundColor: "white", borderRadius: 20 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ flex: 1, textAlign: "center", padding: 15, color: "black", fontWeight: "bold", fontSize: 24 }}>{I18n.t('them_moi_nhom')}</Text>
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
                        onPress={onClickAddDone}
                    >
                        <Text style={{ color: detailGroup.text && detailGroup.text != "" ? "white" : "gray", fontWeight: "bold" }}>{I18n.t('tao_nhom')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('nhom_nha_cung_cap')}
            />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1, }}>
                    <FlatList
                        data={listGroup}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    {
                        allPer.IsAdmin ?
                            <FAB
                                style={styles.fab}
                                big
                                icon="plus"
                                color="#fff"
                                onPress={onClickAdd}
                            />
                            :
                            null
                    }
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <View style={{ flex: 1 }}>
                            <DetailSupplierGroup
                                allPer={allPer}
                                onClickDone={onClickDone}
                                detailGroup={detailGroup} />
                        </View>
                        :
                        null
                }
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

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    },
})