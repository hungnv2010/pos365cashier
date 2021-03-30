import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Modal, TouchableWithoutFeedback } from "react-native";
import { Snackbar, Surface, Checkbox } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import { Images, Metrics } from '../../theme';
import { currencyToString, momentToStringDateLocal, dateToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import moment from 'moment';
// import DateRangePicker from 'react-native-daterange-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import dialogManager from '../../components/dialog/DialogManager';
import DatePicker from 'react-native-date-picker';

export default (props) => {

    const [customerDetail, setCustomerDetail] = useState({})
    const [listGroup, setListGroup] = useState([])
    const [date, setDate] = useState(new Date());
    const [showToast, setShowToast] = useState(false);

    const [showModal, setShowModal] = useState(false)
    const typeModal = useRef(null)
    const toastDescription = useRef('')
    const dateTmp = useRef()

    useEffect(() => {
        const getListGroup = async () => {
            let params = { type: 2 }
            try {
                let res = await new HTTPService().setPath(ApiPath.GROUP_SUPPLIER).GET(params)
                console.log('getListGroup res', res);
                if (res) {
                    res.forEach((element, index, arr) => {
                        element.status = false
                        if (element.selected) arr.splice(index, 1)
                    });
                    setListGroup([...res])
                }
            } catch (error) {
                console.log('error', error);
            }
        }
        getListGroup()
    }, [])

    useEffect(() => {
        console.log('customeretail props', props.customerDetail);
        if (props.customerDetail.Id == 0) {
            resetCustomer()
            return
        }
        setCustomerDetail({ ...props.customerDetail })
    }, [props.customerDetail])

    useEffect(() => {
        getListGroupByCustomer()
    }, [customerDetail])

    const getListGroupByCustomer = () => {
        console.log('getListGroupByCustomer', listGroup, customerDetail);
        listGroup.forEach(item => {
            item.status = false // reset listGroup
            customerDetail.PartnerGroupMembers.forEach(elm => {
                if (item.id == elm.GroupId) {
                    item.status = true
                }
            })
        })
        setListGroup([...listGroup])
    }


    const resetCustomer = () => {
        setCustomerDetail({
            ...customerDetail,
            Code: "",
            Name: "",
            Phone: "",
            DOB: "",
            Gender: 1,
            TaxCode: "",
            PartnerGroupMembers: [],
            Address: "",
            Province: "",
            TotalDebt: 0,
            Point: 0,
            Description: ""
        })
    }

    const renderGender = (item) => {
        return (
            <View style={{ padding: 15 }}>
                <Text style={{ paddingBottom: 10 }}>{I18n.t('gioi_tinh')}</Text>
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
                text = moment(text).format('DD-MM-YYYY')
                console.log(text);
                break;
            case 4:
                setCustomerDetail({ ...customerDetail, TaxCode: text })
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

    const onCancel = () => {
        setShowModal(false)
    }

    const onDone = () => {
        const currentDate = momentToStringDateLocal(dateTmp.current ? dateTmp.current : new Date())
        setCustomerDetail({ ...customerDetail, DOB: currentDate })
        setShowModal(false)
    }

    const onChange = (selectedDate) => {
        dateTmp.current = selectedDate;
    }

    const renderModalContent = () => {
        return typeModal.current == 1 ?
            <View style={{ backgroundColor: "#fff", borderRadius: 4, alignItems: "center" }}>
                {/* <DateTimePicker
                    value={new Date()}
                    mode={'date'}
                    display="default"
                    locale="vi-VN"
                    onChange={onChange}
                /> */}
                <DatePicker date={new Date()}
                    onDateChange={onChange}
                    mode={'date'}
                    display="default"
                    locale="vi-VN" />
                <View style={[styles.viewBottomFilter, { padding: 7, paddingTop: 0 }]}>
                    <TouchableOpacity style={styles.viewButtonCancel} onPress={onCancel}>
                        <Text style={styles.textButtonCancel}>{I18n.t("huy")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.viewButtonOk} onPress={onDone}>
                        <Text style={styles.textButtonOk}>{I18n.t("dong_y")}</Text>
                    </TouchableOpacity>
                </View>
            </View >
            :
            typeModal.current == 2 ?
                <View style={{
                    backgroundColor: "#fff", borderRadius: 4,
                    justifyContent: 'center', alignItems: 'center',
                    height: Metrics.screenHeight * 0.6
                }}>
                    <View style={{ paddingVertical: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 15, color: colors.colorLightBlue }}>{I18n.t('chon_tinh_thanh')}</Text>
                        <ScrollView>
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
                    backgroundColor: "#fff", borderRadius: 4,
                    maxHeight: Metrics.screenHeight * 0.6
                }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", paddingVertical: 15, color: colors.colorLightBlue, textTransform: "uppercase" }}>{I18n.t('chon_nhom')}</Text>
                    <ScrollView
                        contentContainerStyle={{ paddingLeft: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
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
                                        <Text style={{ textAlign: "center" }}>{item.text}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                    <View style={{ flexDirection: "row", paddingVertical: 15, justifyContent: "flex-end" }}>
                        <TouchableOpacity onPress={onClickCancelGroupName} style={{ paddingHorizontal: 20 }}>
                            <Text style={{ fontSize: 16, color: "red", fontWeight: "bold" }}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClickOkGroupName} style={{ paddingHorizontal: 20 }}>
                            <Text style={{ fontSize: 16, color: colors.colorLightBlue, fontWeight: "bold" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
    }

    const onClickOkGroupName = () => {
        let PartnerGroupMembers = []
        listGroup.forEach(item => {
            if (item.status) {
                PartnerGroupMembers.push({ GroupId: item.id })
            }
        })
        setCustomerDetail({ ...customerDetail, PartnerGroupMembers })
        setShowModal(false)
    }

    const onClickCancelGroupName = () => {
        getListGroupByCustomer()
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
                let itemGroupName = listGroup.filter((elm, idx) => item.GroupId == elm.id)
                if (itemGroupName.length > 0) {
                    value.push(itemGroupName[0].text)
                }
            })
        }
        return value.join(', ')
    }

    const onClickApply = () => {
        let dateRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
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
            // ComparePoint: 0,
            Debt: customerDetail.TotalDebt,
            Partner: {
                Type: 2,
                Code: customerDetail.Code,
                Name: customerDetail.Name,
                Phone: customerDetail.Phone,
                DOB: customerDetail.DOB,
                Gender: customerDetail.Gender,
                TaxCode: customerDetail.TaxCode,
                PartnerGroupMembers: PartnerGroupMembers,
                Address: customerDetail.Address,
                Province: customerDetail.Province,
                // Point: 0,
                Description: customerDetail.Description,
            }
        }
        if (props.customerDetail.Id == 0) {
            console.log('add');
            dialogManager.showLoading()
            new HTTPService().setPath(ApiPath.CUSTOMER).POST(params)
                .then(res => {
                    console.log('onClickApply res', res);
                    if (res && res.ResponseStatus && res.ResponseStatus.Message) {
                        dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                            dialogManager.destroy();
                        }, null, null, I18n.t('dong'))
                    } else {
                        props.handleSuccess('them')
                        resetCustomer()
                    }
                    dialogManager.hiddenLoading()
                })
                .catch(err => {
                    dialogManager.hiddenLoading()
                    console.log('onClickApply err', err);
                })
        } else {
            console.log('update');
            params.Partner = { ...customerDetail }
            dialogManager.showLoading()
            new HTTPService().setPath(ApiPath.CUSTOMER).POST(params)
                .then(res => {
                    console.log('onClickApply res', res);
                    if (res && res.ResponseStatus && res.ResponseStatus.Message) {
                        dialogManager.showPopupOneButton(res.ResponseStatus.Message, I18n.t('thong_bao'), () => {
                            dialogManager.destroy();
                        }, null, null, I18n.t('dong'))
                    } else {
                        props.handleSuccess('sua')
                        // resetCustomer()
                    }
                    dialogManager.hiddenLoading()
                })
                .catch(err => {
                    dialogManager.hiddenLoading()
                    console.log('onClickApply err', err);
                })
        }
    }


    const onClickDelete = () => {
        dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_chan_muon_xoa_nha_cung_cap'), I18n.t("thong_bao"), res => {
            if (res == 1) {
                new HTTPService().setPath(`${ApiPath.CUSTOMER}/${customerDetail.Id}`).DELETE()
                    .then(res => {
                        console.log('onClickDelete', res)
                        if (res) props.handleSuccess('xoa')
                    })
                    .catch(err => console.log('onClickDelete err', err))
            }
        })

    }

    const onClickPrint = () => {

    }

    const getIcon = (Gender, Image) => {
        if (Image) {
            return { uri: Image };
        } else {
            switch (Gender) {
                case 2:
                    return Images.icon_woman;
                    break;
                case 1:
                    return Images.icon_male;
                    break;

                default:
                    return Images.icon_avatar;
                    break;
            }
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: 'white', marginLeft: 5, paddingVertical: 10 }}>
                <Text style={{ textAlign: "center", color: colors.colorchinh, fontSize: 15, textTransform: "uppercase", fontWeight: "bold" }}>{props.customerDetail.Id == 0 ? I18n.t('them_nha_cung_cap') : I18n.t('cap_nhat_nha_cung_cap')}</Text>
            </View>
            <KeyboardAwareScrollView style={{ flexGrow: 1 }}>
                <Surface style={styles.surface}>
                    <View style={{ height: Metrics.screenHeight / 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15 }}>
                        <View style={{ flex: 1, marginRight: 20, borderRadius: 20 }}>
                            <Image source={getIcon(customerDetail.Gender, customerDetail.Image)} style={{ height: 100, width: 100, alignSelf: "center" }} />
                        </View>
                        <View style={{ flex: 2, }}>
                            <Text style={{ fontWeight: "bold" }}>{I18n.t('ma_nha_cung_cap')}</Text>
                            <View style={{ paddingVertical: 20 }}>
                                <TextInput
                                    placeholder={I18n.t('tu_dong_tao_ma')}
                                    placeholderTextColor="#808080"
                                    value={customerDetail.Code}
                                    style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                                    onChangeText={(text) => { onChangeText(text, 0) }}
                                />
                            </View>
                        </View>
                    </View>
                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('ten')}<Text style={{ color: "red" }}>*</Text></Text>
                        <TextInput
                            placeholder={I18n.t('ten')}
                            placeholderTextColor="#808080"
                            value={customerDetail.Name}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 1) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('dien_thoai')}</Text>
                        <TextInput
                            returnKeyType='done'
                            placeholder={I18n.t('dien_thoai')}
                            placeholderTextColor="#808080"
                            keyboardType="numbers-and-punctuation"
                            value={customerDetail.Phone}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 2) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('ngay_thanh_lap')}</Text>
                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <TouchableOpacity onPress={() => {
                                typeModal.current = 1
                                setShowModal(true)
                            }} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <Text style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1, color: dateToString(customerDetail.DOB) ? null : "#CECCCB" }}>{dateToString(customerDetail.DOB) ? dateToString(customerDetail.DOB) : 'dd/mm/yyyy'}</Text>
                                {/* <TextInput
                                    editable={false}
                                    value={dateToString(customerDetail.DOB)}
                                    onTouchStart={() => {
                                        typeModal.current = 1
                                        setShowModal(true)
                                    }}
                                    placeholder='dd/mm/yyyy'
                                    // value={dateToString(customerDetail.DOB)}
                                    style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1 }}
                                // onChangeText={(text) => { onChangeText(text, 3) }}
                                /> */}
                                <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20, position: "absolute", right: 15 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        renderGender(customerDetail.Gender)
                    }
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('ma_so_thue')}</Text>
                        <TextInput
                            keyboardType="numbers-and-punctuation"
                            placeholder={I18n.t('ma_so_thue')}
                            value={customerDetail.TaxCode}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 4) }}
                        />
                    </View>
                    {
                        props.customerDetail.Id == 0 ?
                            null
                            :
                            <View style={{ padding: 15 }}>
                                <Text style={{ paddingBottom: 10 }}>{I18n.t('ten_nhom')}</Text>
                                <TouchableOpacity onPress={() => {
                                    typeModal.current = 3
                                    setShowModal(true)
                                }} style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1, color: getGroupName(customerDetail.PartnerGroupMembers) ? null : "#CECCCB" }}>{getGroupName(customerDetail.PartnerGroupMembers) ? getGroupName(customerDetail.PartnerGroupMembers) : I18n.t('ten_nhom')}</Text>
                                    {/* <TextInput
                                placeholder={I18n.t('ten_nhom')}
                                value={getGroupName(customerDetail.PartnerGroupMembers)}
                                editable={false}
                                onTouchStart={() => {
                                    typeModal.current = 3
                                    setShowModal(true)
                                }
                                }
                                style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1 }}
                            /> */}
                                    <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20, position: "absolute", right: 15 }} />
                                </TouchableOpacity>
                            </View>
                    }

                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('dia_chi')}</Text>
                        <TextInput
                            placeholder={I18n.t('dia_chi')}
                            placeholderTextColor="#808080"
                            value={customerDetail.Address}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 6) }}
                        />
                    </View>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('tinh_thanh')}</Text>
                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <TouchableOpacity onPress={() => {
                                typeModal.current = 2
                                setShowModal(true)
                            }} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <Text style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1, color: customerDetail.Province ? null : "#CECCCB" }}>{customerDetail.Province ? customerDetail.Province : I18n.t('tinh_thanh')}</Text>
                                {/* <TextInput
                                    placeholder={I18n.t('tinh_thanh')} 
                                    value={customerDetail.Province}
                                    editable={false}
                                    style={{ borderWidth: 0.5, padding: 10, borderRadius: 5, flex: 1 }}
                                    // onChangeText={(text) => { onChangeText(text, 7) }}
                                    onTouchStart={() => {
                                        typeModal.current = 2
                                        setShowModal(true)
                                    }}
                                /> */}
                                <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20, position: "absolute", right: 15 }} />
                            </TouchableOpacity>

                        </View>
                    </View>

                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('du_no')}</Text>
                        <TextInput
                            returnKeyType='done'
                            placeholder={I18n.t('du_no')}
                            placeholderTextColor="#808080"
                            keyboardType="numbers-and-punctuation"
                            value={currencyToString(customerDetail.TotalDebt)}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 8) }}
                        />
                    </View>
                    {/* <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('diem_thuong')}</Text>
                        <TextInput
                            returnKeyType='done'
                            placeholder={I18n.t('diem_thuong')}
                            placeholderTextColor="#808080"
                            keyboardType="numeric"
                            value={currencyToString(customerDetail.Point)}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5 }}
                            onChangeText={(text) => { onChangeText(text, 9) }}
                        />
                    </View> */}

                </Surface>
                <Surface style={styles.surface}>
                    <View style={{ padding: 15 }}>
                        <Text style={{ paddingBottom: 10 }}>{I18n.t('ghi_chu')}</Text>
                        <TextInput
                            placeholder={I18n.t('ghi_chu')}
                            placeholderTextColor="#808080"
                            value={customerDetail.Description}
                            style={{ borderWidth: 0.5, color: "#000", padding: 10, borderRadius: 5, height: 70 }}
                            onChangeText={(text) => { onChangeText(text, 10) }}
                            multiline={true}
                            numberOfLines={3}
                        />
                    </View>
                </Surface>
            </KeyboardAwareScrollView>
            <View style={{ flexDirection: "row", margin: 10, }}>
                {
                    props.customerDetail.Id == 0 ?
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
                <TouchableOpacity onPress={onClickApply} style={{ flex: 8, flexDirection: "row", marginLeft: 10, marginTop: 0, borderRadius: 5, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center", padding: 15 }}>
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
    },
    viewBottomFilter: { justifyContent: "center", flexDirection: "row", paddingTop: 10 },
    viewButtonCancel: { flex: 1, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: colors.colorchinh, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" },
    textButtonCancel: { textAlign: "center", color: "#000" },
    viewButtonOk: { marginLeft: 10, flex: 1, backgroundColor: colors.colorchinh, borderRadius: 4, paddingHorizontal: 20, paddingVertical: 10, justifyContent: "flex-end" },
    textButtonOk: { textAlign: "center", color: "#fff" },

})