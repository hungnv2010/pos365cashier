import React, { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import I18n from '../../common/language/i18n';
import { FlatList } from 'react-native-gesture-handler';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import dialogManager from '../../components/dialog/DialogManager';
import { useSelector } from 'react-redux';

export default (props)=>{
    const [roomHistoryData,setRoomHistoryData] = useState([])
    const [roomHistoryItem,setHistoryItem] = useState()
    const {deviceType} = useSelector(state => {
        return state.Common
    })
    const roomHistoryRef = useRef(null)
    useEffect(()=>{
        getRoomHistoryData()
    },[])

    const getRoomHistoryData = async()=>{
        let res = {}
        await new HTTPService().setPath(ApiPath.ROOM_HISTORY).GET()
        console.log("res history",res);
        setRoomHistoryData(res.results)
        
    }
    useEffect(()=>{
        console.log("history",roomHistoryData);
    },[roomHistoryData])
    const renderListItem =(item,index)=>{
        return(
            <TouchableOpacity key={index.toString()}>
                <View style={{flex:1, flexDirection:"row",justifyContent:'space-between',alignItems:'center',marginBottom:10,borderBottomWidth:1,borderBottomColor:'silver'}}>
                    <View style={{flex:1}}>
                        <Text style={{fontSize:18, fontWeight:'bold',marginLeft:15}}>{item.Product}</Text>
                        <Text style={{fontSize:16,marginLeft:15,color:'#4F4F4F'}}>{item.Room}[{item.Pos}]</Text>
                        <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center', marginLeft:15}}>
                            <Text style={{fontSize:16, color:'#4F4F4F'}}>Số Lượng:</Text>
                            <Text style={{fontSize:16, color:'#4F4F4F'}}>{item.Quantity}</Text>
                        </View>
                    </View>
                    <View style={{flex:1, justifyContent:'flex-end',alignItems:'flex-end', marginRight:10}}>
                        <Text style={{fontSize:16, color:'#FF0000', fontStyle:'italic'}}>{item.Description}</Text>
                        <Text style={{fontSize:16, color:'#4F4F4F'}}>{item.CreatedDate}</Text>
                        <Text style={{fontSize:16, fontWeight:'bold',color:'#1E90FF', fontFamily:'tahoma'}}>{item.Price}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    return(
        <View style={{flex:1}}>
            <FlatList
                        data={roomHistoryData}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                        ref={refs => roomHistoryRef.current = refs}
                    />
        </View>
    )
}