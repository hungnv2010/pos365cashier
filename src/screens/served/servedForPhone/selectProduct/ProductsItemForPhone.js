import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { currencyToString } from '../../../../common/Utils';
import { Colors, Images, Metrics } from '../../../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const ProductsItemForPhone = ({ item, index, onClickProduct, handleButtonDecrease, handleButtonIncrease, onChangeText }) => {

    const onClickItem = () => {
        onClickProduct(item, index)
    }

    return (
        <TouchableOpacity key={index} onPress={onClickItem} style={[styles.item, { backgroundColor: item.Quantity > 0 ? "#EED6A7" : "white", }]}>
            <Image
                style={{ height: 70, width: 70, borderRadius: 50 }}
                source={JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
            />
            <View style={styles.wrapNameItem}>
                <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold" }}>{item.Name}</Text>
                <Text style={{ paddingVertical: 5, fontStyle: "italic" }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.LargeUnit != '' ? `/${item.LargeUnit}` : item.Unit != '' ? `/${item.Unit}` : ''}</Text></Text>
            </View>
            <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", marginRight: 25 }}>

                {item.Quantity > 0 ?
                    <>
                        <TouchableOpacity onPress={() => { handleButtonDecrease(item, index) }}>
                            <Icon name="minus-box" size={40} color={Colors.colorchinh} />
                        </TouchableOpacity>
                        <TextInput
                            keyboardType="numeric"
                            textAlign="center"
                            onChangeText={(numb) => {
                                if (!Number.isInteger(+numb)) return
                                onChangeText(numb, item)
                            }}
                            style={{ width: 50, borderBottomWidth: .5, paddingVertical: 5, paddingTop: 10, marginBottom: 5 }}>{Math.round(item.Quantity * 1000) / 1000}
                        </TextInput>
                        <TouchableOpacity onPress={() => { handleButtonIncrease(item, index) }}>
                            <Icon name="plus-box" size={40} color={Colors.colorchinh} />
                        </TouchableOpacity>
                    </> :
                    null
                }

            </View>
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
        borderRadius: 10
    },
    wrapNameItem: {
        flexDirection: "column",
        flex: 2,
        marginLeft: 10,
        justifyContent: "center"
    },
})

export default React.memo(ProductsItemForPhone);
