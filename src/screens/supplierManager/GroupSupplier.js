import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, FlatList, StyleSheet, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { FAB } from 'react-native-paper';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import colors from '../../theme/Colors';
import { Images } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import DetailCustomerGroup from '../customerManager/DetailCustomerGroup';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import DetailSupplierGroup from './DetailSupplierGroup';


export default (props) => {

    const [listGroup, setListGroup] = useState([])
    const [detailGroup, setDetailGroup] = useState({})
    //const [allPer, setPer] = useState(props.route.params.permission ? props.route.params.permission : {})
    const { deviceType,allPer } = useSelector(state => {
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
            props.navigation.navigate(ScreenList.DetailGroupCustomerForPhone, { detailGroup: item, _onSelect: onClickDone })
        }
    }



    const onClickAdd = () => {
        if (deviceType == Constant.TABLET) {
            setDetailGroup({ Id: 0 })
        } else {
            props.navigation.navigate(ScreenList.DetailGroupCustomerForPhone, { detailGroup: { Id: 0 }, _onSelect: onClickDone })
        }
    }

    const onClickDone = (status) => {
        if (status) getListGroup()
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