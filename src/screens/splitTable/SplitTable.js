import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, NativeModules, Platform } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import realmStore from '../../data/realm/RealmStore';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { Checkbox, RadioButton, Snackbar } from 'react-native-paper';
import { ScreenList } from '../../common/ScreenList';
import dataManager from '../../data/DataManager';

export default (props) => {

    console.log('SplitTable data  props ====', props.route.params);
    const [listProduct, setListProduct] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [listPosition, setListPosition] = useState([
        { position: "A", checked: true },
        { position: "B", checked: false },
        { position: "C", checked: false },
        { position: "D", checked: false },
    ])

    useEffect(() => {
        console.log("props ", props);
        let list = [...props.route.params.OrderDetails]
        list.forEach(element => {
            element.CheckSplitTable = false
            element.QuantitySplit = 0
            return element;
        });
        setListProduct(list)
    }, [])

    const selectRadioButton = (item, index) => {
        console.log("selectRadioButton:: item ", item);
        listProduct.forEach((element, i) => {
            if (element.Id == item.Id && index == i) {
                let status = !element.CheckSplitTable;
                element.CheckSplitTable = status;
                element.QuantitySplit = status ? element.Quantity : 0
            }
        });
        console.log("selectRadioButton:: listProduct ", listProduct);
        setListProduct([...listProduct])
    }

    const onSplitTable = () => {
        setShowModal(!showModal)
        let positionSelect = -1;
        listPosition.forEach(element => {
            if (element.checked == true)
                positionSelect = element
        });
        if (props.route.params.Pos == positionSelect.position) {
            setToastDescription(I18n.t("ban_dang_o_dung_vi_tri_da_chon_se_khong_co_thay_doi"));
            setShowToast(true)
            return;
        }

        let listOld = []
        let listNew = []
        listProduct.forEach(element => {
            if (element.QuantitySplit > 0) {
                let object = { ...element }
                object.Quantity = object.QuantitySplit;
                if (!element.CheckSplitTable) {
                    let objectOld = { ...element }
                    objectOld.Quantity = objectOld.Quantity - objectOld.QuantitySplit;
                    delete objectOld.QuantitySplit
                    listOld.push(objectOld)
                }
                delete object.QuantitySplit
                listNew.push(object)
            } else {
                delete element.QuantitySplit
                listOld.push(element)
            }
        });
        console.log("onSplitTable listOld ", listOld);
        console.log("onSplitTable listNew ", listNew);
        dataManager.splitTable(props.route.params.RoomId, props.route.params.Pos, positionSelect.position, listOld, listNew);
        props.navigation.goBack()
    }

    const subQuantity = (item) => {
        if (item.QuantitySplit > 0) {
            if (item.QuantitySplit == 1) {
                item.CheckSplitTable = false
            }
            item.QuantitySplit--
        }
        setListProduct([...listProduct])
    }

    const addQuantity = (item) => {
        if (item.QuantitySplit < item.Quantity) {
            if (item.QuantitySplit == item.Quantity - 1) {
                item.CheckSplitTable = true
            }
            item.QuantitySplit++
        }
        setListProduct([...listProduct])
    }

    const splitInTable = () => {
        if (checkSplit())
            setShowModal(!showModal)
        else {
            setToastDescription(I18n.t("ban_chua_chon_mon_an_de_tach"));
            setShowToast(true)
        }
    }

    const checkSplit = () => {
        let status = false
        listProduct.forEach(element => {
            if (element.QuantitySplit > 0)
                status = true;
        });
        return status;
    }

    const changeTable = () => {
        if (checkSplit())
            props.navigation.navigate(ScreenList.ChangeTable, {
                FromRoomId: props.route.params.RoomId,
                FromPos: props.route.params.Pos,
                Name: props.route.params.RoomName
            });
        else {
            setToastDescription(I18n.t("ban_chua_chon_mon_an_de_tach"));
            setShowToast(true)
        }
    }

    const renderSelectPosition = () => {
        return (
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 20, paddingBottom: 20, paddingLeft: 5, fontWeight: "bold" }}>{I18n.t('chon_vi_tri')}</Text>
                {listPosition.map((item, index) => {
                    return (
                        <TouchableOpacity onPress={() => {
                            listPosition.forEach(lp => { lp.checked = false })
                            listPosition[index].checked = !listPosition[index].checked;
                            setListPosition([...listPosition])
                        }} key={index} style={{ flexDirection: "row", alignItems: "center", }}>
                            <RadioButton.Android
                                color={Colors.colorchinh}
                                status={item.checked ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    listPosition.forEach(lp => { lp.checked = false })
                                    listPosition[index].checked = !listPosition[index].checked;
                                    setListPosition([...listPosition])
                                }}
                            />
                            <Text style={{ marginLeft: 20, fontSize: 20 }}>[{item.position}]</Text>
                        </TouchableOpacity>
                    )
                })}
                <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "flex-end", padding: 0, alignItems: "center" }}>
                    <TouchableOpacity style={{ paddingRight: 20 }} onPress={() => { setShowModal(!showModal) }}>
                        <Text style={{ padding: 10, fontSize: 15 }}>{I18n.t('huy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ paddingVertical: 10, backgroundColor: Colors.colorchinh, borderRadius: 3, paddingHorizontal: 20, }} onPress={onSplitTable}>
                        <Text style={{ color: "white", fontSize: 15 }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderItem = (item, index) => {
        return (<View style={{ padding: 10, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
            <TouchableOpacity onPress={() => {
                selectRadioButton(item, index)
            }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: -10 }}>
                <View style={{ flex: 3, margin: 0, flexDirection: "row", alignItems: "center", }}>
                    <Checkbox.Android
                        color={Colors.colorchinh}
                        status={item.CheckSplitTable ? 'checked' : 'unchecked'}
                        onPress={() => {
                            selectRadioButton(item, index)
                        }}
                    />
                    <Text style={{ flex: 1 }}>{item.Name}</Text>
                </View>
                <View style={{ flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-around", }}>
                    <TouchableOpacity
                        onPress={() => subQuantity(item)}>
                        <Icon style={{ marginTop: 5 }} name="minus-box" size={40} color={Colors.colorchinh} />
                    </TouchableOpacity>
                    <View style={{
                        width: 60,
                        height: 35,
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "bold",
                            }}>{item.QuantitySplit}</Text>
                    </View>
                    <TouchableOpacity onPress={() => addQuantity(item)}>
                        <Icon style={{ marginTop: 5 }} name="plus-box" size={40} color={Colors.colorchinh} />
                    </TouchableOpacity>
                </View>
                <View style={{
                    width: 35,
                    height: 35,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "#808080",
                    borderWidth: 0.5,
                    marginLeft: 10
                }}>
                    <Text>/{item.Quantity}</Text>
                </View>
            </TouchableOpacity>
        </View>)
    }

    return (
        <View style={styles.container}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('tach_ban')}
                clickLeftIcon={() => {
                    props.navigation.goBack()
                }} />
            <View style={{ padding: 10, paddingHorizontal: 15, backgroundColor: Colors.colorchinh }}>
                <Text style={{ color: "#fff" }}>{props.route.params.RoomName}[{props.route.params.Pos}]</Text>
            </View>
            <ScrollView >
                {
                    listProduct && listProduct.length > 0 ?
                        listProduct.map((item, index) => {
                            return renderItem(item, index);
                        })
                        :
                        null
                }
            </ScrollView>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity onPress={splitInTable} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRightColor: "#fff", borderRightWidth: 1, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('tach_tai_ban')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={changeTable} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 1, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('chuyen_ban')}</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={styles.viewModal}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={styles.view_feedback}></View>
                    </TouchableWithoutFeedback>
                    <View style={[styles.viewModalContent]}>
                        <View style={styles.viewContentPopup}>
                            {renderSelectPosition()}
                        </View>
                    </View>
                </View>
            </Modal>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    view_feedback: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
    },
    viewModal: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    viewModalContent: { justifyContent: 'center', alignItems: 'center', },
    viewContentPopup: {
        padding: 0,
        backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
        width: Metrics.screenWidth * 0.8
    },
})
