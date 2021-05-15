import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { currencyToString } from '../../../../common/Utils';
import { Colors, Images, Metrics } from '../../../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TextTicker from 'react-native-text-ticker';
import colors from '../../../../theme/Colors';


const ProductsItem = ({ item, index, getQuantityProduct, numColumns, onClickProduct }) => {

    const onClickItem = () => {
        onClickProduct(item, index)
    }

    return (
        <TouchableOpacity onPress={onClickItem} key={index} style={{ backgroundColor: "white", borderRadius: 5, flex: 1 / numColumns, marginHorizontal: 7 }}>
            <View style={{}}>
                <Image
                    style={{ height: 100, width: "100%", borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                    source={JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
                />
                <View style={{
                    marginHorizontal: 10, flexDirection: "row",
                    alignItems: "center"
                }}>
                    <View style={{
                        flexDirection: "column",
                        flex: 2,
                        justifyContent: "space-between",
                    }}>
                        {/* <TextTicker
                            duration={6000}
                            marqueeDelay={500}
                            style={{ textTransform: "uppercase", fontWeight: "bold", paddingVertical: 5 }}>{item.Name.trim()}</TextTicker> */}
                        <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold", paddingVertical: 5, fontSize: 11 }}>{item.Name.trim()}</Text>
                        <Text style={{ fontStyle: "italic", paddingBottom: 5 }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.IsLargeUnit ? item.LargeUnit ? `/${item.LargeUnit}` : '' : item.Unit ? `/${item.Unit}` : ''}</Text></Text>
                    </View>
                    {/* <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold", paddingLeft: 5, color: Colors.colorchinh }}>{item.ProductType == 1 ? (item.OnHand >= 0 ? item.OnHand : "") : "---"}</Text> */}
                </View>
            </View>
            {getQuantityProduct > 0 ?
                // <Icon
                //     style={{ height: 30, width: 30, position: "absolute", top: 10, right: 10 }}
                //     name="check-circle" size={30} color={Colors.colorchinh} />
                <View style={{ position: "absolute", top: 5, right: 5, paddingHorizontal: 9.5, paddingVertical: 5, borderRadius: 50,borderColor:colors.colorchinh,borderWidth:1, backgroundColor: "#fff" }}>
                    <Text style={{ color: colors.colorchinh, fontWeight: "bold" }}>{Math.round(getQuantityProduct * 1000) / 1000}</Text>
                </View>
                :
                null}
        </TouchableOpacity>
    )
}

export default React.memo(ProductsItem);
