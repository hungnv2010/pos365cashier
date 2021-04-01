import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../../theme';
import I18n from '../../../common/language/i18n';
import { useSelector } from 'react-redux';
import MainToolBar from '../../main/MainToolBar';
import colors from '../../../theme/Colors';
import { ScreenList } from '../../../common/ScreenList';
import ToolBarExtraTopping from '../../../components/toolbar/ToolBarExtraTopping';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { change_alias, currencyToString } from '../../../common/Utils';
import { FlatList } from 'react-native-gesture-handler';
import { HTTPService } from '../../../data/services/HttpService';
import { ApiPath } from '../../../data/services/ApiPath';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import { Constant } from '../../../common/Constant';

export default (props) => {
    const [listExtra, setListExtra] = useState([])
    const [category, setCategory] = useState([I18n.t('tat_ca')])
    const defaultCate = useRef(I18n.t('tat_ca'))
    const [cateClick, setCateClick] = useState(I18n.t('tat_ca'))
    const extraTmp = useRef([])
    const deviceType = useSelector(state => {
        return state.Common.deviceType
    });

    useEffect(() => {
        const getExtraTopping = async () => {
            let param = { Includes: 'Extra', inlinecount: 'allpages', top: 50 }
            let res = await new HTTPService().setPath(ApiPath.PRODUCT + '/extra').GET(param)
            if (res != null) {
                console.log("extra", res.results);
                setListExtra([...res.results])
                extraTmp.current = res.results
            }
        }
        getExtraTopping()
    }, [])
    useEffect(() => {
        defaultCate.current = I18n.t('tat_ca')
        let listcate = [I18n.t('tat_ca')]
        extraTmp.current.forEach((item) => {
            if (item.ExtraGroup && change_alias(item.ExtraGroup).indexOf(change_alias(defaultCate.current)) == -1) {
                listcate.push(item.ExtraGroup)
                defaultCate.current == item.ExtraGroup
            }
        })
        setCategory(listcate)
    }, [listExtra])

    useEffect(() => {
        console.log("list cate", category);
    })
    const onClickCate = (item) => {
        setCateClick(item)
        if (item == I18n.t('tat_ca')) {
            setListExtra(extraTmp.current)
        } else {
            let list = []
            extraTmp.current.forEach((el) => {
                if (el.ExtraGroup) {
                    if (el.ExtraGroup.indexOf(item) != -1) {
                        list.push(el)
                    }
                }
            })
            setListExtra(list)
        }
    }
    const onClickAdd = () => {

    }
    const onClickExtra = (item) =>{
        if(deviceType == Constant.PHONE){
            props.navigation.navigate(ScreenList.ExtraDetails, { extra: item, categoryExtra: category})
        }
    }
    const renderExtra = (item, index) => {
        return (
            <TouchableOpacity onPress={()=>onClickExtra(item)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5, marginVertical: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name={'extension'} size={30} color={colors.colorchinh} />
                    <Text style={{ marginLeft: 10 }}>{item.Extra.Name}</Text>
                </View>
                <Text>{currencyToString(item.Price)}</Text>
            </View>
            </TouchableOpacity>
        )
    }
    const renderExtraGroup = (item, index) => {
        return (
            <TouchableOpacity onPress={() => onClickCate(item)}>
                <View style={{ backgroundColor: item == cateClick ? colors.colorLightBlue : 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: cateClick == item ? 10 : 0 }}>
                    <Text style={{ fontWeight: 'bold', color: item == cateClick ? '#fff' : '#000' }}>{item}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <ToolBarExtraTopping
                {...props}
                title={I18n.t('danh_sach_extra_topping')}
            />
            <View style={{ flex: 1 }}>
                <View style={{ paddingVertical: 10, paddingHorizontal: 5,backgroundColor:'#fff' }}>
                    <FlatList
                        data={category}
                        renderItem={({ item, index }) => renderExtraGroup(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal={true}
                    />
                </View>
                <FlatList
                    data={listExtra}
                    renderItem={({ item, index }) => renderExtra(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
                <FAB
                    style={styles.fab}
                    icon='plus'
                    color="#fff"
                    onPress={() => {
                        onClickAdd({})
                    }}
                />

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
    }
})