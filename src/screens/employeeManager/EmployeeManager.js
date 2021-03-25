import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { FlatList, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { change_alias } from '../../common/Utils';
import useDebounce from '../../customHook/useDebounce';
import { Chip, Snackbar, FAB } from 'react-native-paper';
import colors from '../../theme/Colors';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import EmployeeDetails from '../../screens/employeeManager/EmployeeDetails'
import { ScreenList } from '../../common/ScreenList';
import Images from '../../theme/Images';



export default (props) => {
    const [listUsers, setListUsers] = useState([])
    const listData = useRef()
    const [textSearch, setTextSearch] = useState("")
    const debounceTextSearch = useDebounce(textSearch)
    const [user, setUser] = useState({})

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });

    useEffect(() => {
        const getListUsers = async () => {
            let res = await new HTTPService().setPath(ApiPath.USERS).GET()
            console.log("abc", res);
            if (res != null) {
                setListUsers([...res.results])
                console.log("abc", res);
                listData.current = res.results
            } else {

            }
        }
        getListUsers()
    }, [])
    useEffect(()=>{
        const searchUser = () =>{
            if(debounceTextSearch != ''){
                let list = listData.current.filter(item=>change_alias(item.Name).indexOf(change_alias(debounceTextSearch))>-1)
                setListUsers(list)
            }
        }
        searchUser()

    },[debounceTextSearch])
    const onChangeText = (text) => {
        console.log('onChangeText', text);
        setTextSearch(text)
    }

    useEffect(() => {
        console.log("list users", listUsers);
    }, [listUsers])
     const onClickItem = (el) =>{
         if(deviceType == Constant.PHONE){
            props.navigation.navigate(ScreenList.EmployeeDetails, { user:el })
         }else{
             setUser(el)
         }

     }

    const renderUsers = (item, index) => {
        return (
            <View style={{ backgroundColor: '#fff', marginVertical: 5 ,borderRadius:10,paddingVertical:10}}>
                <TouchableOpacity onPress={()=>onClickItem(item)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>{item.UserName}</Text>
                        <Text style={{ color: item.IsActive == true ? '#00c75f' : '#f21e3c',fontWeight:'bold' }}>{item.IsActive == true ? I18n.t('hoat_dong') : I18n.t('khoa')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5 }}>
                        <Text style={style.styleTitle}>{I18n.t('ten_nhan_vien')}</Text>
                        <Text style={{ fontWeight: 'bold' }}>{item.Name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5 }}>
                        <Text style={style.styleTitle}>{I18n.t('dia_chi')}</Text>
                        <Text>{item.Address ? item.Address : ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 10 }}>
                        <Text style={style.styleTitle}>{I18n.t('so_dien_thoai')}</Text>
                        <Text>{item.Phone ? item.Phone : ''}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ flex: 1, }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('quan_ly_nhan_vien')}
                outPutTextSearch={() => { }}
            />
            <View style={{flexDirection:'row',flex:1}}>
            <View style={{ flex: 1, marginBottom: 10}}>
                <View style={{ backgroundColor: "white", height: 40,  borderRadius: 10, flexDirection: "row", alignItems: "center", marginHorizontal: 10, marginVertical:5}}>
                    <Ionicons name="md-search" size={20} color="black" style={{ marginRight: 20,marginLeft:10 }} />
                    <TextInput
                        style={{ flex: 1, color: "#000", height: 35 }}
                        value={textSearch}
                        onChangeText={text => onChangeText(text)}
                        placeholder={I18n.t('tim_kiem_nhan_vien')}
                        placeholderTextColor="#808080"
                    />
                </View>
                <View style={{marginHorizontal:10}}>
                <FlatList data={listUsers}
                    renderItem={({ item, index }) => renderUsers(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                />
                </View>
                <FAB
                        style={style.fab}
                        icon='plus'
                        color="#fff"
                        onPress={() => {
                            onClickItem({})
                        }}
                    />
            </View>
            {
                deviceType == Constant.TABLET?
                <View style={{flex:1}}>
                    {user != {}?
                    <EmployeeDetails userData={user} />:null}
                </View>:
                null

            }
            </View>
        </View>
    )
}
const style = StyleSheet.create({
    styleTitle: {
        color: '#bbbbbb'
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.colorLightBlue
    }
})
