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
import DetailCustomerGroup from './DetailCustomerGroup';
import { ScreenList } from '../../common/ScreenList';


export default (props) => {

    const [listGroup, setListGroup] = useState([])
    const [detailGroup, setDetailGroup] = useState({})
    const { deviceType } = useSelector(state => {
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

    const getListGroup = async () => {
        let params = { type: 1 }
        try {
            let allList = await new HTTPService().setPath(ApiPath.GROUP_CUSTOMER).GET(params)
            let customer = await new HTTPService().setPath(ApiPath.SYNC_PARTNERS).GET()
            console.log('getListGroup res', allList);
            if (allList) {
                if (customer && customer.Data && customer.Data.length > 0) {
                    allList.forEach(element => {
                        element.totalMember = 0
                        customer.Data.forEach(cus => {
                            cus.PartnerGroupMembers.forEach(item => {
                                if (item.GroupId == element.Id) {
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
                            style={{ fontSize: 15, fontWeight: "bold", color: colors.colorLightBlue }}>{item.Name}</Text>
                        <Text style={{ paddingVertical: 10, color:"grey" }}>{item.totalMember} {I18n.t('thanh_vien')}</Text>
                    </View>
                 
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('nhom_khach_hang')}
            />
            <View style={{ flexDirection: "row", flex: 1 }}>
                <View style={{ flex: 1, }}>
                    <FlatList
                        data={listGroup}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <FAB
                        style={styles.fab}
                        big
                        icon="plus"
                        color="#fff"
                        onPress={onClickAdd}
                    />
                </View>
                {
                    deviceType == Constant.TABLET ?
                        <View style={{ flex: 1 }}>
                            <DetailCustomerGroup
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