import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { currencyToString, dateToString } from '../../common/Utils';
import I18n from "../../common/language/i18n";
import images from '../../theme/Images';
import { ceil } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../../theme/Colors';
import { Metrics, Images } from '../../theme';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { Constant } from '../../common/Constant';

export default (props) => {
    return (
        <View style={{ backgroundColor: '#fff', borderRadius: 10 }}>
            <View style={{ paddingVertical: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopEndRadius: 10 }}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>{I18n.t('loc')}</Text>
            </View>
            <View style={{ paddingVertical: 10, backgroundColor: '#f2f2f2',borderBottomLeftRadius:10,borderBottomRightRadius:10 }}>
                <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                    <View style={{ flex: 1, paddingVertical: 10, marginRight: 5 }}>
                        <Text>{I18n.t('tu')}</Text>
                        <TouchableOpacity style={styles.background}>
                            <Text></Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, paddingVertical: 10, marginLeft: 5 }}>
                        <Text>{I18n.t('den')}</Text>
                        <TouchableOpacity style={styles.background}>
                            <Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('trang_thai')}</Text>
                    <TouchableOpacity style={styles.background}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text></Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20 }} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('nha_cung_cap')}</Text>
                    <TouchableOpacity style={styles.background}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text></Text>
                            <Image source={Images.icon_arrow_down} style={{ width: 20, height: 20 }} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('ma_nhap_hang')}</Text>
                    <TextInput style={styles.background}></TextInput>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                    <Text>{I18n.t('ma_hang_hoa')}</Text>
                    <TextInput style={styles.background}></TextInput>
                </View>
                <TouchableOpacity style={{backgroundColor:colors.colorLightBlue,alignItems:'center',justifyContent:'center',paddingVertical:15,borderRadius:10,marginHorizontal:10,marginVertical:10}}>
                    <Text style={{color:'#fff',fontWeight:'bold'}}>{I18n.t('ap_dung')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    background:{
        backgroundColor:'#fff',paddingHorizontal:5,paddingVertical:10,borderRadius:10,marginTop:5
    }
})