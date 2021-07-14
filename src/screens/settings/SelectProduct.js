import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import realmStore from '../../data/realm/RealmStore';
import ProductsItem from '../served/servedForTablet/selectProduct/ProductsItem';
import { Constant } from '../../common/Constant';
import I18n from '../../common/language/i18n';
import { change_alias } from '../../common/Utils';
import { Colors, Metrics, Images } from '../../theme'
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import { ScrollView } from 'react-native-gesture-handler';
import { currencyToString } from '../../common/Utils';
//import SortableGrid from 'react-native-sort-grid'
import { DragSortableView, AutoDragSortableView } from 'react-native-drag-sort'

export default (props) => {
  const [widthParent, setWidthParent] = useState(props.widthParent)
  const [numColumn, setNumColumn] = useState(props.numColumn ? props.numColumn : 3)
  const [listProduct, setListProduct] = useState(props.listProducts)
  const { already, deviceType } = useSelector(state => {
    return state.Common
  });

  useEffect(() => {
    setNumColumn(props.numColumn)
  }, [props.numColumn])
  useEffect(() => {
    setListProduct(props.listProducts)
  }, props.listProducts)
  useEffect(() => {
    setWidthParent(props.widthParent)
  }, [props.widthParent])

  const onClickProduct = () => {
    setIsDrag(true)
  }
  return (
    <View style={{ flex: 1 }}>
      {/* <FlatList
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          data={listProduct}
          key={numColumn}
          numColumns={numColumn}
          renderItem={({ item, index }) => {
            return (<ProductsItem
              numColumns={numColumn}
              //getQuantityProduct={getQuantityProduct(item)}
              item={item}
              index={index}
            onClickProduct={onClickProduct}
            />)

          }}
          keyExtractor={(item, index) => '' + index}
        // extraData={product.Quantity}
        // onEndReached={(info) => { loadMore(info) }}
        // onEndReachedThreshold={0}
        // ListFooterComponent={isLoadMore ? <ActivityIndicator color={Colors.colorchinh} /> : null}
        // ItemSeparatorComponent={() => <View style={{ height: 14 }}></View>}
        /> */}
      {/* <SortableGridView
          numPerRow={numColumn}
          style={{}}
          useScrollView={true}
          data={listProduct}
          gapWidth={5}
          //itemWidth={10}
          //dragActivationTreshold={100}
          //aspectRatio={numColumn != 4 ? 1 : 1.2}
          padding={5}
          //sensitivity={1000}
          onDragStart={() => {
            console.log('CustomLayout onDragStart');
          }}
          onDragRelease={(data) => {
            console.log('CustomLayout onDragRelease', data);
            //setPosition(data)
            //setListProducts(data)
          }}
          renderItem={(item, index) => {
            return (
              <View uniqueKey={item.Id} style={{ backgroundColor: "#fff", borderRadius: 5, marginVertical: 10, marginHorizontal: 5 }}>
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
                      <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold", paddingVertical: 5, fontSize: 11 }}>{item.Name.trim()}</Text>
                      <Text style={{ fontStyle: "italic", paddingBottom: 5 }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.IsLargeUnit ? item.LargeUnit ? `/${item.LargeUnit}` : '' : item.Unit ? `/${item.Unit}` : ''}</Text></Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          }}
        /> */}
      <AutoDragSortableView
        dataSource={listProduct}
        parentWidth={widthParent}
        childrenWidth={(widthParent - 20 * numColumn) / (numColumn)}
        childrenHeight={(Metrics.screenWidth / 5)}
        keyExtractor={(item, index) => item.id}
        marginChildrenLeft={10}
        marginChildrenRight={10}
        marginChildrenBottom={10}
        marginChildrenTop={10}
        onDataChange={(data) => {
          console.log(data);
          props.outputDataChange(data)
        }
        }
        renderItem={(item, index) => {
          return (
            <>
              {deviceType == Constant.TABLET ?
                <View style={{ backgroundColor: "#fff", borderRadius: 5, width: (widthParent - 20 * numColumn) / (numColumn) }}>
                  <View style={{}}>
                    <Image
                      style={{ height: 100, width: "100%", borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                      source={JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
                    />
                    <View style={{
                      marginHorizontal: 10,
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <View style={{
                        flexDirection: "column",
                        flex: 2,
                        justifyContent: "space-between",
                      }}>
                        <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold", paddingVertical: 5, fontSize: 11 }}>{item.Name.trim()}</Text>
                        <Text style={{ fontStyle: "italic", paddingBottom: 5 }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.IsLargeUnit ? item.LargeUnit ? `/${item.LargeUnit}` : '' : item.Unit ? `/${item.Unit}` : ''}</Text></Text>
                      </View>
                    </View>
                  </View>
                </View> :

                <View style={{ flexDirection: 'row', backgroundColor: '#fff', flex: 1, padding: 10, width: widthParent,borderRadius:10 }}>
                  <Image
                    style={{ height: 70, width: 70, borderRadius: 20, marginLeft: 5 }}
                    source={JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
                  />
                  <View style={{}}>
                    <View style={{}}>
                      <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold" }}>{item.Name}</Text>
                      <Text style={{ paddingVertical: 5, fontStyle: "italic" }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.IsLargeUnit ? item.LargeUnit ? `/${item.LargeUnit}` : '' : item.Unit ? `/${item.Unit}` : ''}</Text></Text>
                    </View>
                    {/* {item.Quantity <= 0 ?
                    <Text numberOfLines={2} style={{ textTransform: "uppercase", fontWeight: "bold", paddingRight: 10, color: Colors.colorchinh }}>{item.ProductType == 1 ? (item.OnHand >= 0 ? item.OnHand : "") : "---"}</Text>
                    : null} */}
                  </View>
                </View>}
            </>
          )
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  renderCateItem: { flexDirection: "row", paddingVertical: 20, alignItems: "center", marginBottom: 5, borderRadius: 5 },
  textRenderCateItem: { fontWeight: "bold", textTransform: "uppercase", lineHeight: 20, textAlign: "left" },
  button: { borderWidth: 1, padding: 20, borderRadius: 10 },
});

