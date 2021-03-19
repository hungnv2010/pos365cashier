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
            let res = await new HTTPService().setPath(ApiPath.GROUP_CUSTOMER).GET(params)
            console.log('getListGroup res', res);
            if (res) {
                // res.forEach(element => {
                //     element.status = false
                // });
                setListGroup([...res])
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    const onClickItem = (item) => {
        setDetailGroup(item)
    }

    const onClickAdd = () => {
        setDetailGroup({ Id: 0 })
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
                        <Text style={{ paddingVertical: 5 }}>{item.Code}</Text>
                        {/* <Text style={{}}>{I18n.t('diem_thuong')}: {currencyToString(item.Point)}</Text> */}
                    </View>
                    {/* <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 10 }}>
                            <Icon name="phone" size={24} color={colors.colorchinh} style={{ marginRight: 10 }} />
                            <Text>{item.Phone ? item.Phone : I18n.t('chua_cap_nhat')}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <Icon name="home" size={24} color={colors.colorchinh} style={{ marginRight: 10 }} />
                            <TextTicker>{item.Address ? item.Address : I18n.t('chua_cap_nhat')}</TextTicker>
                        </View>
                    </View> */}
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