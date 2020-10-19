import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback } from "react-native";
import { Snackbar, Surface, Checkbox } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import { ScreenList } from '../../common/ScreenList';
import { currencyToString, momentToStringDateLocal, dateToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import moment from 'moment';
import DateTime from '../../components/filter/DateTime';
import DateRangePicker from 'react-native-daterange-picker';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import dialogManager from '../../components/dialog/DialogManager';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';


export default (props) => {

    const [customerDetail, setCustomerDetail] = useState({...props.route.params.item})
    const [listGroup, setListGroup] = useState([])
    const [dateTimePicker, setDateTimePicker] = useState({
        startDate: null,
        endDate: null,
        displayedDate: moment(),
    })
    const [showToast, setShowToast] = useState(false);

    const [showModal, setShowModal] = useState(false)
    const typeModal = useRef(null)
    const toastDescription = useRef('')

    useEffect(() => {
        const getListGroup = async () => {
            let params = { type: 1 }
            try {
                let res = await new HTTPService().setPath(ApiPath.GROUP_CUSTOMER).GET(params)
                console.log('getListGroup res', res);
                if (res) {
                    res.forEach(element => {
                        element.status = false
                    });
                    setListGroup([...res])
                }
            } catch (error) {
                console.log('error', error);
            }
        }
        getListGroup()
    }, [])

    // useEffect(() => {
    //     console.log('customeretail props', props, listGroup);
    //     let customerDetail = props.route.params.item
    //     if (customerDetail.Id == - 1) {
    //         resetCustomer()
    //         return
    //     }
    //     listGroup.forEach(item => {
    //         item.status = false // reset listGroup
    //         customerDetail.PartnerGroupMembers.forEach(elm => {
    //             if (item.Id == elm.GroupId) {
    //                 item.status = true
    //             }
    //         })
    //     })
    //     setListGroup([...listGroup])
    //     setCustomerDetail({ ...props.route.params.item })
    // }, [props.route.params.item])

    // useEffect(() => {
    //     getListGroupByCustomer()
    // }, [getListGroupByCustomer])

    const getListGroupByCustomer = useCallback(() => {
        console.log();
        listGroup.forEach(item => {
            item.status = false // reset listGroup
            customerDetail.PartnerGroupMembers.forEach(elm => {
                if (item.Id == elm.GroupId) {
                    item.status = true
                }
            })
        })
        setListGroup([...listGroup])
    }, [customerDetail])

    const setDates = (dates) => {
        console.log('setDates', dates);
        setDateTimePicker({ ...dateTimePicker, ...dates })
    }

    const resetCustomer = () => {
        setCustomerDetail({
            ...customerDetail,
            Code: "",
            Name: "",
            Phone: "",
            DOB: "",
            Gender: 1,
            Email: "",
            PartnerGroupMembers: [],
            Address: "",
            Province: "",
            TotalDebt: 0,
            Point: 0,
            Description: ""
        })
    }

    const renderGender = (item) => {
        console.log('renderGender', item);
        return (
            <View style={{ padding: 15 }}>
                <Text style={{ paddingBottom: 10 }}>Sex</Text>
                <View style={{ height: 50, flexDirection: "row", borderWidth: 1, borderColor: colors.colorchinh, borderRadius: 5 }}>
                    <TouchableOpacity onPress={() => {
                        setCustomerDetail({ ...customerDetail, Gender: 2 })
                    }} style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, item == 2 ? { backgroundColor: colors.colorchinh } : null]}>
                        <Text style={item == 2 ? { color: "#fff" } : null}>{I18n.t('nu')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setCustomerDetail({ ...customerDetail, Gender: 0 })
                    }} style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, item == 0 ? { backgroundColor: colors.colorchinh } : null]}>
                        <Text style={item == 0 ? { color: "#fff" } : null}>{I18n.t('khac')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setCustomerDetail({ ...customerDetail, Gender: 1 })
                    }} style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, item == 1 ? { backgroundColor: colors.colorchinh } : null]}>
                        <Text style={item == 1 ? { color: "#fff" } : null}>{I18n.t('nam')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const onChangeText = (text, type) => {
        switch (type) {
            case 0:
                setCustomerDetail({ ...customerDetail, Code: text })
                break
            case 1: //onChangeText name
                setCustomerDetail({ ...customerDetail, Name: text })
                break;
            case 2:
                setCustomerDetail({ ...customerDetail, Phone: text })
                break;
            case 3:
                setCustomerDetail({ ...customerDetail, DOB: text })
                break;
            case 4:
                setCustomerDetail({ ...customerDetail, Email: text })
                break;
            case 5:
                setCustomerDetail({ ...customerDetail })
                break;
            case 6:
                setCustomerDetail({ ...customerDetail, Address: text })
                break;
            case 7:
                setCustomerDetail({ ...customerDetail, Province: text })
                break;
            case 8:
                text = text.replace(/,/g, "");
                text = Number(text);
                setCustomerDetail({ ...customerDetail, TotalDebt: text })
                break;
            case 9:
                text = text.replace(/,/g, "");
                text = Number(text);
                setCustomerDetail({ ...customerDetail, Point: text })
                break;
            case 10:
                setCustomerDetail({ ...customerDetail, Description: text })
                break;
            default:
                setCustomerDetail({ ...customerDetail })
                break;
        }
    }

    const renderModalContent = () => {
        return typeModal.current == 1 ?
            <View style={{
                alignItems: "center",
                justifyContent: "center",
            }}>
                <DateRangePicker
                    visible={true}
                    onChange={(dates) => setDates(dates)}
                    endDate={dateTimePicker.endDate}
                    startDate={dateTimePicker.startDate}
                    displayedDate={dateTimePicker.displayedDate}
                    maxDate={moment()}
                    range

                >
                </DateRangePicker>
            </View>
            :
            typeModal.current == 2 ?
                <View style={{
                    backgroundColor: "#fff", borderRadius: 4,
                    justifyContent: 'center', alignItems: 'center',
                    height: Metrics.screenHeight * 0.6
                }}>
                    <View style={{ paddingVertical: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 15, color: colors.colorLightBlue }}>{I18n.t('chon_tinh_thanh')}</Text>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                        >
                            {
                                Constant.LIST_PROVICE.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => onClickChooseProvice(item)}
                                            key={index} style={{ paddingVertical: 15, }}>
                                            <Text style={{ textAlign: "center" }}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </View>
                :
                <View style={{
                    backgroundColor: "#fff", borderRadius: 4, padding: 20
                }}>
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 10, color: colors.colorLightBlue }}>{I18n.t('chon_nhom')}</Text>
                        {
                            listGroup.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        style={{ flexDirection: "row", alignItems: "center", paddingBottom: 10 }}
                                        onPress={() => {
                                            listGroup[index].status = !listGroup[index].status
                                            setListGroup([...listGroup])
                                        }}
                                        key={index}>
                                        <Checkbox.Android
                                            color={colors.colorchinh}
                                            status={item.status ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                listGroup[index].status = !listGroup[index].status
                                                setListGroup([...listGroup])
                                            }}
                                        />
                                        <Text style={{ textAlign: "center" }}>{item.Name}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                        <View style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center", justifyContent: "flex-end" }}>
                            <TouchableOpacity onPress={onClickCancelGroupName} style={{ paddingHorizontal: 20 }}>
                                <Text style={{ fontSize: 16, color: "red", fontWeight: "bold" }}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClickOkGroupName}>
                                <Text style={{ fontSize: 16, color: colors.colorLightBlue, fontWeight: "bold" }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
    }

    const onClickOkGroupName = () => {
        let PartnerGroupMembers = []
        listGroup.forEach(item => {
            if (item.status) {
                PartnerGroupMembers.push({ GroupId: item.Id })
            }
        })
        setCustomerDetail({ ...customerDetail, PartnerGroupMembers })
        setShowModal(false)
    }

    const onClickCancelGroupName = () => {
        // getListGroupByCustomer()
        setShowModal(false)
    }

    const onClickChooseProvice = (item) => {
        console.log('onClickChooseProvice', onClickChooseProvice);
        setCustomerDetail({ ...customerDetail, Province: item.name })
        setShowModal(false)
    }


    const getGroupName = (data) => {
        console.log('getGroupName', customerDetail, listGroup);
        let value = [];

        if (data && data.length > 0) {
            data.forEach(item => {
                let itemGroupName = listGroup.filter((elm, idx) => item.GroupId == elm.Id)
                if (itemGroupName.length > 0) {
                    value.push(itemGroupName[0].Name)
                }
            })
        }
        return value.toString()
    }

    const onClickDone = () => {
        if (customerDetail.Name == '') {
            toastDescription.current = I18n.t("vui_long_nhap_day_du_thong_tin_truoc_khi_luu")
            setShowToast(true)
            return
        }
        let PartnerGroupMembers = []
        listGroup.forEach(item => {
            if (item.status) {
                PartnerGroupMembers.push({ GroupId: item.Id })
            }
        })
        let params = {
            CompareDebt: 0,
            ComparePoint: 0,
            Debt: customerDetail.TotalDebt,
            Partner: {
                Code: customerDetail.Code,
                Name: customerDetail.Name,
                Phone: customerDetail.Phone,
                DOB: customerDetail.DOB,
                Gender: customerDetail.Gender,
                Email: customerDetail.Email,
                PartnerGroupMembers: PartnerGroupMembers,
                Address: customerDetail.Address,
                Province: customerDetail.Province,
                Point: 0,
                Description: customerDetail.Description,
            }
        }
        if (props.route.params.item.Id == -1) {
            console.log('add');
            dialogManager.showLoading()
            new HTTPService().setPath(ApiPath.CUSTOMER).POST(params)
                .then(res => {
                    console.log('onClickDone res', res);
                    if (res) {
                        props.route.params.onCallBack('add')
                        resetCustomer()
                    }
                    dialogManager.hiddenLoading()
                })
                .catch(err => {
                    dialogManager.hiddenLoading()
                    console.log('onClickDone err', err);
                })
        } else {
            console.log('update');
            params.Partner = { ...customerDetail }
            dialogManager.showLoading()
            new HTTPService().setPath(ApiPath.CUSTOMER).POST(params)
                .then(res => {
                    console.log('onClickDone res', res);
                    if (res) {
                        props.route.params.onCallBack('update')
                        resetCustomer()
                    }
                    dialogManager.hiddenLoading()
                })
                .catch(err => {
                    dialogManager.hiddenLoading()
                    console.log('onClickDone err', err);
                })
        }
    }


    const onClickDelete = () => {
        new HTTPService().setPath(`${ApiPath.CUSTOMER}/${customerDetail.Id}`).DELETE()
            .then(res => {
                console.log('onClickDelete', res)
                if (res) props.route.params.onCallBack('delete')
            })
            .catch(err => console.log('onClickDelete err', err))
    }

    const onClickPrint = () => {

    }

    return (
        <View style={{ flex: 1 }}>
            {/* <View style={{ backgroundColor: colors.colorchinh, marginLeft: 15, paddingVertical: 10 }}>
                <Text style={{ textAlign: "center", color: "white", fontSize: 15, textTransform: "uppercase" }}>{props.route.params.item && props.route.params.item.Id == -1 ? 'Add customer' : 'Update Customer'}</Text>
            </View> */}
            <ToolBarDefault
                {...props}
                title={props.route.params.item.Id == -1 ? 'Add customer' : 'Update Customer'} />
            <ScrollView style={{ flex: 1, padding: 10 }}>
                <Surface style={styles.surface}>
                    <View style={{ height: Metrics.screenHeight / 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15 }}>
                        <View style={{ flex: 1, marginRight: 20 }}>
                            <View style={{ flex: 1, borderRadius: 100, backgroundColor: "red" }}></View>
                        </View>
                        <View style={{ flex: 2, }}>
                            <Text style={{ fontWeight: "bold" }}>Customer Code</Text>
                            <View style={{ paddingVertical: 20 }}>
                                <TextInput
                                    value={customerDetail.Code}
                                    style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                                    onChangeText={(text) => { onChangeText(text, 0) }}
                                />
                            </View>
                        </View>
                    </View>
                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Name <Text style={{ color: "red" }}>*</Text></Text>
                        <TextInput
                            value={customerDetail.Name}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 1) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Phone</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={customerDetail.Phone}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 2) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Birthday</Text>
                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <TextInput
                                    value={customerDetail.DOB}
                                    style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1 }}
                                    onChangeText={(text) => { onChangeText(text, 3) }}
                                />
                                <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20, position: "absolute", right: 15 }} />
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    typeModal.current = 1
                                    setShowModal(true)
                                }}
                                style={{ marginLeft: 20, justifyContent: "center", backgroundColor: colors.colorLightBlue, borderRadius: 5 }}>
                                <Text style={{ textAlign: "center" }}>button</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        renderGender(customerDetail.Gender)
                    }
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Email</Text>
                        <TextInput
                            value={customerDetail.Email}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 4) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Group name</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TextInput
                                value={getGroupName(customerDetail.PartnerGroupMembers)}
                                editable={false}
                                onTouchStart={() => {
                                    typeModal.current = 3
                                    setShowModal(true)
                                }
                                }
                                style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1 }}
                            />
                            <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20, position: "absolute", right: 15 }} />
                        </View>
                    </View>

                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Address</Text>
                        <TextInput
                            value={customerDetail.Address}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 6) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>City</Text>
                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <TextInput
                                    value={customerDetail.Province}
                                    style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1 }}
                                    onChangeText={(text) => { onChangeText(text, 7) }}
                                />
                                <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20, position: "absolute", right: 15 }} />
                            </View>
                            <TouchableOpacity onPress={() => {
                                typeModal.current = 2
                                setShowModal(true)
                            }} style={{ marginLeft: 20, justifyContent: "center", backgroundColor: colors.colorLightBlue, borderRadius: 5 }}>
                                <Text style={{ textAlign: "center" }}>button</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Debt</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={currencyToString(customerDetail.TotalDebt)}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 8) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Reward point</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={currencyToString(customerDetail.Point)}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 9) }}
                        />
                    </View>

                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>Note</Text>
                        <TextInput
                            value={customerDetail.Description}
                            style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, height: 70 }}
                            onChangeText={(text) => { onChangeText(text, 10) }}
                            multiline={true}
                            numberOfLines={3}
                        />
                    </View>
                </Surface>
            </ScrollView>
            <View style={{ flexDirection: "row", margin: 10, }}>
                {
                    props.route.params.item.Id == -1 ?
                        null
                        :
                        <>
                            <TouchableOpacity onPress={onClickDelete} style={{ flex: 1, flexDirection: "row", marginTop: 0, borderRadius: 5, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 10 }}>
                                <IconAntDesign name={"delete"} size={25} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClickPrint} style={{ flex: 1, flexDirection: "row", marginLeft: 10, borderRadius: 5, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 10 }}>
                                <IconAntDesign name={"printer"} size={25} color="white" />
                            </TouchableOpacity>
                        </>
                }
                <TouchableOpacity onPress={onClickDone} style={{ flex: 8, flexDirection: "row", marginLeft: 10, marginTop: 0, borderRadius: 5, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 15 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>{I18n.t('ap_dung')}</Text>
                </TouchableOpacity>
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
                    <View style={{ width: Metrics.screenWidth * 0.6, }}>
                        {renderModalContent()}
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
                {toastDescription.current}
            </Snackbar>
        </View >
    )
}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    }
})