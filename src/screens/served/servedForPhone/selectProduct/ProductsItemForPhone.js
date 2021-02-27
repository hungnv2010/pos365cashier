import React, { useState } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { currencyToString } from '../../../../common/Utils';
import { Colors, Images, Metrics } from '../../../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const ProductsItemForPhone = ({ item, index, onClickProduct, handleButtonDecrease, handleButtonIncrease, onChangeText, getQuantity }) => {

    const [value, setValue] = useState(item.Quantity)

    const onClickItem = () => {
        setValue(getQuantity(item))
        onClickProduct(item, index)
    }

    return (
        <TouchableOpacity key={index} onPress={onClickItem} style={[styles.item, { backgroundColor: item.Quantity > 0 ? "#EED6A7" : "white", }]}>
            <Image
                style={{ height: 70, width: 70, borderRadius: 20,marginLeft:5 }}
                source={JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
            />
            <View style={styles.viewInfo}>
                <View style={styles.wrapNameItem}>
                    <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold" }}>{item.Name}</Text>
                    <Text style={{ paddingVertical: 5, fontStyle: "italic" }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.IsLargeUnit ? item.LargeUnit ? `/${item.LargeUnit}` : '' : item.Unit ? `/${item.Unit}` : ''}</Text></Text>
                </View>
                {/* {item.Quantity <= 0 ?
                    <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold", paddingRight: 10, color: Colors.colorchinh }}>{item.ProductType == 1 ? (item.OnHand >= 0 ? item.OnHand : "") : "---"}</Text>
                    : null} */}
            </View>
            {item.Quantity > 0 ?
                <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", marginRight: 25 }}>

                    <TouchableOpacity onPress={() => {
                        if (value > 0) {
                            let tmp = +value - 1;
                            setValue(tmp)
                            handleButtonDecrease(item, index)
                        }
                    }}>
                        <Icon name="minus-box" size={40} color={Colors.colorchinh} />
                    </TouchableOpacity>
                    <TextInput
                        returnKeyType='done'
                        keyboardType="numeric"
                        textAlign="center"
                        value={"" + Math.round(value * 1000) / 1000}
                        onChangeText={(numb) => {
                            if (isNaN(numb) || +numb.length > 4) return
                            if (item.SplitForSalesOrder || (item.ProductType == 2 && item.IsTimer)) {
                                numb = Math.round(+numb)
                            }
                            setValue(numb)
                            onChangeText(numb, item)
                        }}
                        style={{ width: 50, borderBottomWidth: .5, paddingVertical: 5, paddingTop: 10, marginBottom: 5, color: "#000" }}>
                    </TextInput>
                    <TouchableOpacity onPress={() => {
                        if (value < 1000) {
                            let tmp = +value + 1;
                            setValue(tmp)
                            handleButtonIncrease(item, index)
                        }
                    }}>
                        <Icon name="plus-box" size={40} color={Colors.colorchinh} />
                    </TouchableOpacity>
                </View> :
                null
            }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 5,
        marginBottom: 3,
        marginHorizontal: 5,
        borderRadius: 10,
    },
    wrapNameItem: {
        flexDirection: "column",
        flex: 2,
        marginLeft: 10,
        justifyContent: "center",
    },
    viewInfo: {
        flexDirection: "row",
        flex: 2,
        justifyContent: "space-between",
        alignItems: "center"
    }
})

export default React.memo(ProductsItemForPhone);
