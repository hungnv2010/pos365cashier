import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules, Modal, TouchableWithoutFeedback } from 'react-native';
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
import dialogManager from '../../../components/dialog/DialogManager';
import DialogSelectProduct from '../../../components/dialog/DialogSelectProduct';
import { height } from 'react-native-daterange-picker/src/modules';
import ExtraDetails from '../extratoppig/ExtraDetails'
import realmStore from '../../../data/realm/RealmStore';
import dataManager from '../../../data/DataManager';
import NetInfo from "@react-native-community/netinfo";

export default (props) => {
    const [listExtra, setListExtra] = useState([])
    const [category, setCategory] = useState([I18n.t('tat_ca')])
    const defaultCate = useRef(I18n.t('tat_ca'))
    const [cateClick, setCateClick] = useState(I18n.t('tat_ca'))
    const extraTmp = useRef([])
    const [showModal, setOnShowModal] = useState(false)
    const [iExtra, setIExtra] = useState({})
    const [iCate, setICate] = useState([])
    const { deviceType, allPer } = useSelector(state => {
        return state.Common
    });

    useEffect(() => {
        getExtraTopping()
    }, [])
    const getExtraTopping = async () => {
        extraTmp.current = await realmStore.queryTopping()
        setListExtra(extraTmp.current)
    }
    useEffect(() => {
        defaultCate.current = I18n.t('tat_ca')
        let listcate = [I18n.t('tat_ca')]
        extraTmp.current.forEach((item) => {
            if (item.ExtraGroup && change_alias(item.ExtraGroup).indexOf(change_alias(defaultCate.current)) == -1 && listcate.indexOf(item.ExtraGroup) == -1) {
                listcate.push(item.ExtraGroup)
                defaultCate.current = item.ExtraGroup
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
        setOnShowModal(true)
    }
    const onClickExtra = (item) => {
        if (deviceType == Constant.PHONE) {
            props.navigation.navigate(ScreenList.ExtraDetails, { extra: item, categoryExtra: category, onCallBack: handleSuccess })
        } else {
            setIExtra(item)
            setICate(category)
        }
    }
    const handleSuccess = async (type) => {
        dialogManager.showLoading()
        try {
            if (type == 'xoa') {
                if (deviceType == Constant.TABLET) {
                    setIExtra({})
                }
                await realmStore.deleteTopping()
            }
            await dataManager.syncTopping()
            getExtraTopping()
            dialogManager.showPopupOneButton(`${I18n.t(type)} ${I18n.t('thanh_cong')}`, I18n.t('thong_bao'))
            dialogManager.hiddenLoading()
        } catch (error) {
            console.log('handleSuccess err', error);
            dialogManager.hiddenLoading()
        }
    }
    const outputAddExtra = async (data) => {
        setOnShowModal(false)
        let state = await NetInfo.fetch()
        if (state.isConnected == true && state.isInternetReachable == true) {
            await dataManager.syncTopping()
            dialogManager.showPopupOneButton(`${data.Message}`, I18n.t('thong_bao'))
            getExtraTopping()
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_internet'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }

    }
    const renderExtra = (item, index) => {
        return (
            <TouchableOpacity onPress={() => onClickExtra(item)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: iExtra && iExtra.Id == item.Id ? '#FFE5B4' : '#FFF', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5, marginVertical: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 4, paddingRight: 20 }}>
                        <Icon name={'extension'} size={30} color={colors.colorchinh} />
                        <Text style={{ marginLeft: 10, textTransform: 'uppercase' }}>{item.Name}</Text>
                    </View>
                    <View style={{ flex: 1.6, marginLeft: 15, alignItems: 'flex-end' }}>
                        <Text>{currencyToString(item.Price)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    const renderExtraGroup = (item, index) => {
        return (
            <TouchableOpacity onPress={() => onClickCate(item)}>
                <View style={{ backgroundColor: item == cateClick ? colors.colorLightBlue : '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: cateClick == item ? 10 : 0 }}>
                    <Text style={{ fontWeight: 'bold', color: item == cateClick ? '#fff' : '#000' }}>{item}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flex: 1 }}>
                <ToolBarExtraTopping
                    {...props}
                    title={I18n.t('danh_sach_extra_topping')}
                />
                <View style={{ flex: 1 }}>
                    <View style={{ paddingVertical: 10, paddingHorizontal: 5, backgroundColor: '#fff', marginBottom: 2 }}>
                        <FlatList
                            data={category}
                            renderItem={({ item, index }) => renderExtraGroup(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal={true}
                        />
                    </View>
                    {listExtra.length > 0 ?
                        <FlatList
                            data={listExtra}
                            renderItem={({ item, index }) => renderExtra(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                        /> :
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 0.3 }}>
                            <Image source={Images.logo_365_long_color} style={{ alignItems: 'center', justifyContent: 'center' }}></Image>
                        </View>
                    }
                    {allPer.Product_Create || allPer.Product_Update || allPer.IsAdmin ?
                        <FAB
                            style={styles.fab}
                            icon='plus'
                            color="#fff"
                            onPress={() => {
                                onClickAdd({})
                            }}
                        /> : null
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
                        <View style={{ width: Metrics.screenWidth * 0.8, height: Metrics.screenHeight * 0.6, alignItems: 'center', justifyContent: 'center' }}>
                            <DialogSelectProduct outPut={outputAddExtra} />
                        </View>
                    </View>
                </Modal>

            </View>{
                deviceType == Constant.TABLET ?
                    <View style={{ flex: 1 }}>
                        {listExtra.length > 0 && iExtra.Id ?
                            <ExtraDetails data={iExtra} handleSuccessTab={handleSuccess} cate={iCate} />
                            :
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 0.3 }}>
                                <Image source={Images.logo_365_long_color} style={{ alignItems: 'center', justifyContent: 'center' }}></Image>
                            </View>
                        }
                    </View>
                    : null
            }
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