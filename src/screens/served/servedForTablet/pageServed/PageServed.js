import React, { useEffect, useState, useRef } from 'react';
import { NativeModules, Image, View, StyleSheet, Picker, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Modal } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import MenuConfirm from './MenuConfirm';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import I18n from '../../../../common/language/i18n';
import { Snackbar } from 'react-native-paper';
import signalRManager from '../../../../common/SignalR';
import { useSelector } from 'react-redux';
import ViewPrint from '../../../more/ViewPrint';
// const { Print } = NativeModules;

export default (props) => {



    // const [data, setData] = useState("");
    const [tab, setTab] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState('A')
    const [vendor, setVendor] = useState({})
    const [textNotify, setTextNotify] = useState("")
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [listPosition, setListPosition] = useState([
        { name: "A", status: false },
        { name: "B", status: false },
        { name: "C", status: false },
        { name: "D", status: false },
    ])
    const printProvisional = useRef(false)
    const orientaition = useSelector(state => {
        console.log("useSelector state ", state.Common.orientaition);
        return state.Common.orientaition
    });

    useEffect(() => {
        return () => {
            printProvisional.current = false
        }
    }, [])

    useEffect(() => {
        if (tab != 1 && !printProvisional.current) {
            setTab(1)
        }
    }, [props.listProducts])

    const selectPosition = (position) => {
        setPosition(position)
        setShowModal(false);
    }

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = (position) => {
        _menu.hide();
        selectPosition(position)
    };

    const showMenu = () => {
        _menu.show();
    };

    const outputSendNotify = async (type) => {
        if (type == 1) {
            setTimeout(() => {
                signalRManager.sendMessageOrder(props.route.params.room.Name + ": " + I18n.t('yeu_cau_thanh_toan'))
            }, 100);
        } else {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            data = JSON.parse(data)
            setVendor(data)
            setTimeout(() => {
                setTextNotify(props.route.params.room.Name + ` <${I18n.t('tu')}: ` + data.CurrentUser.Name + "> ")
                setShowModal(true)
            }, 500);
        }
    }

    const outputListPos = (listPos) => {
        setListPosition(listPos)
    }


    const onClickSendNotify = () => {
        setShowModal(false)
        signalRManager.sendMessageOrder(textNotify)
    }

    const onClickProvisional = (res) => {
        printProvisional.current = true
        // if (res && res != "") {
        //     let html = data.replace("width: 76mm", "")
        //     setData(res)
        // }
        // setTimeout(() => {
        //     viewPrintRef.current.clickCaptureRef();
        // }, 500);
        props.onClickProvisional(res);
    }

    // const viewPrintRef = useRef();
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* <ViewPrint
                ref={viewPrintRef}
                html={data}
                callback={(uri) => {
                    console.log("callback uri ", uri)
                    Print.printImageFromClient([uri + ""])
                }
                }
            /> */}
            <View style={{ backgroundColor: Colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderTopColor: "#EAECEE", borderTopWidth: 1.5, height: 35 }}>
                <View style={{ flex: 1, justifyContent: "center", }}>
                    <Text style={{ paddingLeft: 20, textTransform: "uppercase", color: "white", fontWeight: "bold" }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                </View>
                <TouchableOpacity onPress={showMenu} style={{ flex: 1, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                    <Menu
                        style={{ width: 50 }}
                        ref={setMenuRef}
                        button={<Text style={{ color: "white", fontWeight: "bold" }} onPress={showMenu}>{position}</Text>}
                    >
                        {
                            listPosition.map(item => <MenuItem key={item.name} onPress={() => hideMenu(item.name)}>{item.name} {item.status ? <Text style={{ color: Colors.colorchinh }}>*</Text> : null}</MenuItem>)
                        }
                    </Menu>
                    <Icon style={{}} name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderColor: Colors.colorchinh, borderWidth: 0.5 }}>
                <TouchableOpacity onPress={() => setTab(1)} style={{ height: 32, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tab == 1 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text style={{ color: tab == 1 ? "white" : Colors.colorchinh, fontWeight: "bold", fontSize: orientaition == Constant.PORTRAIT ? 11 : null }}>{I18n.t('thuc_don_da_goi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab(2)} style={{ height: 32, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tab == 2 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text style={{ color: tab == 2 ? "white" : Colors.colorchinh, fontWeight: "bold", fontWeight: "bold", fontSize: orientaition == Constant.PORTRAIT ? 11 : null }}>{I18n.t('mon_da_xac_nhan')}</Text>
                </TouchableOpacity>
            </View>
            {tab == 1 ?
                <CustomerOrder
                    Position={position} {...props}
                    outputSendNotify={outputSendNotify} />
                :
                <MenuConfirm Position={position} {...props}
                    onClickProvisional={(res) => onClickProvisional(res)}
                    outputSendNotify={outputSendNotify}
                    outputListPos={outputListPos} />
            }
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => setShowModal(false)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }, { backgroundColor: 'rgba(0,0,0,0.5)' }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <TouchableOpacity onPress={() => selectPosition("A")}>
                                <Text style={{ margin: 10, fontSize: 16, fontWeight: "bold" }}>{I18n.t('gui_tin_nhan')}</Text>
                            </TouchableOpacity>
                            <View style={{ padding: 0, height: 40, borderRadius: 3, borderColor: Colors.colorchinh, borderWidth: 1, backgroundColor: "#fff", flexDirection: "row", margin: 10 }}>
                                <TextInput value={textNotify} style={{ width: "100%", height: "100%" }}
                                    autoFocus={true}
                                    onChangeText={(text) => setTextNotify(text)}
                                />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Text style={{ margin: 10, fontSize: 16 }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onClickSendNotify()}>
                                    <Text style={{ margin: 10, fontSize: 16 }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
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
        </View >
    );
}


const styles = StyleSheet.create({

});