import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import realmStore from '../../../../data/realm/RealmStore';
import ProductsItem from './ProductsItem';
import { Constant } from '../../../../common/Constant';
import I18n from '../../../../common/language/i18n';
import { change_alias } from '../../../../common/Utils';
import useDebounce from '../../../../customHook/useDebounce';
import { Colors, Metrics, Images } from '../../../../theme'
import { useSelector } from 'react-redux';

export default (props) => {
  const [isLoadMore, setIsLoadMore] = useState(false)
  const [hasProducts, setHasProducts] = useState(false)
  const [category, setCategory] = useState([])
  const [product, setProduct] = useState([])
  const [skip, setSkip] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [listCateId, setListCateId] = useState([-1])
  const [listProducts, setListProducts] = useState(() => props.listProducts)
  const [valueSearch, setValueSearch] = useState(() => props.valueSearch)
  const count = useRef(0)
  const debouncedVal = useDebounce(valueSearch)

  const { already } = useSelector(state => {
    return state.Common
  });

  useEffect(() => {
    const getSearchResult = async () => {

      if (debouncedVal != '') {
        setHasProducts(false)
        setIsSearching(true)
        count.current = 0
        let valueSearchLatin = change_alias(debouncedVal)
        let results = await realmStore.queryProducts()
        let searchResult = results.filtered(`NameLatin CONTAINS "${valueSearchLatin}" OR Code CONTAINS "${valueSearchLatin}"`)
        searchResult = JSON.parse(JSON.stringify(searchResult))
        searchResult = Object.values(searchResult)
        searchResult.forEach(item => {
          item.Quantity = 0
          listProducts.forEach(elm => {
            if (item.ProductId == elm.ProductId) {
              item.Quantity += elm.Quantity
            }
          })
        })
        setProduct(searchResult)
        setHasProducts(true)
      } else {
        onClickCate({ Id: -1, Name: I18n.t('tat_ca') })
        setIsSearching(false)
      }
    }
    getSearchResult()

  }, [debouncedVal])

  useEffect(() => {
    setValueSearch(props.valueSearch)
  }, [props.valueSearch])


  useEffect(() => {
    console.log(props.listProducts, 'selectProds props.listProducts');
    setListProducts(props.listProducts)
  }, [props.listProducts])

  useEffect(() => {
    if (already) {
      const getCategories = async () => {
        let newCategories = [];
        let results = await realmStore.queryCategories()
        let allProducts = await realmStore.queryProducts()
        results.forEach(item => {
          let numberProduct = allProducts.filtered(`CategoryId == ${item.Id}`).length
          newCategories.push({ ...JSON.parse(JSON.stringify(item)), numberProduct })
        })
        setCategory(newCategories)
        

      }
      getCategories()
      
    }
  }, [already])

  const getProducts = useCallback(async () => {
    if (already) {

      let results = await realmStore.queryProducts()
      // results = results.sorted('Name')
      if (listCateId[0] != -1) {
        results = results.filtered(`CategoryId == ${listCateId[0]}`)
      }
      let productsRes = results.slice(skip, skip + Constant.LOAD_LIMIT)
      productsRes = JSON.parse(JSON.stringify(productsRes))
      console.log('getProductsproductsRes',productsRes);
      count.current = productsRes.length
      setProduct([...product, ...productsRes])
      setHasProducts(true)
      setIsLoadMore(false)
    }
    return () => {
      count.current = 0
    }
  }, [skip, listCateId, already])


  useEffect(() => {
    getProducts()
  }, [getProducts])


  const onClickCate = async (item, index) => {
    if (item.Id == listCateId[0] && item.Id != -1) return
    setHasProducts(false)
    resetState()
    setListCateId([item.Id])
  }

  const resetState = () => {
    console.log('reset');
    setProduct([])
    setSkip(0)
  }

  const onClickProduct = (item, index) => {
    let newProduct = { ...item }
    newProduct.Description = getDescription(newProduct)
    newProduct.Quantity = getQuantity(newProduct)
    newProduct.ProductImages = []
    newProduct.index = undefined
    props.outputSelectedProduct(newProduct)
    console.log('onClickProduct :: ', newProduct);
  }

  const getQuantityProduct = (arrItem) => {
    let Quantity = 0
    listProducts.forEach(item => {
      if (item.ProductId == arrItem.ProductId || item.ItemId ==  arrItem.ProductId) {
        Quantity += item.Quantity
      }
    })
    return Quantity
  }

  const getDescription = (item) => {
    let Description = ''
    if (item.ProductType == 2 && item.IsTimer) {
      let date = new Date()
      let [day, month, hour, minute] = [
        (date.getDate() < 10 ? "0" : "") + (date.getDate()),
        ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1),
        date.getHours(),
        date.getMinutes()
      ]
      Description = `${day}/${month} ${hour}:${minute}=>${day}/${month} ${hour}:${minute} (0 ${I18n.t('phut')})`
    }
    return Description
  }

  const getQuantity = (item) => {
    let Quantity = 1
    if (item.IsPriceForBlock || (item.ProductType == 2 && item.IsTimer)) {
      Quantity = item.BlockOfTimeToUseService / 60
    }
    return Quantity
  }

  const loadMore = (info) => {
    console.log(info, 'loadMore');
    if (count.current > 0) {
      setIsLoadMore(true)
      setSkip((prevSkip) => prevSkip + Constant.LOAD_LIMIT);
    }
  }


  const renderCateItem = (item, index) => {
    return (
      <View style={{}}>
        <TouchableOpacity onPress={() => onClickCate(item, index)} key={index} style={[styles.renderCateItem, { flex: 1, backgroundColor: item.Id == listCateId[0] ? Colors.colorLightBlue : "white", borderBottomWidth: 0.5, paddingVertical: 20, borderColor: 'gray' }]}>
          <View style={{ backgroundColor: item.Id != listCateId[0] ? Colors.colorLightBlue : "white", flex: 1, padding: 7, borderRadius: 50, marginHorizontal: 5 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center", color: item.Id != listCateId[0] ? "white" : Colors.colorLightBlue, fontSize: 12 }}>{item.numberProduct}</Text>
          </View>
          <Text numberOfLines={2} style={[styles.textRenderCateItem, { flex: 6, color: item.Id == listCateId[0] ? "white" : Colors.colorLightBlue }]}>{item.Name}</Text>
        </TouchableOpacity>
      </View>

    );
  }

  const onClickAll = () => {
    setHasProducts(false)
    resetState()
    setListCateId([-1])
  }

  return (
    <View style={{ flex: 1, flexDirection: "row", }}>
      {
        isSearching ?
          null
          :
          <View style={{ width: "24%", backgroundColor: 'white', paddingVertical: 5 }}>
            <View style={{ flex: 1, marginHorizontal: 5, paddingBottom: 5 }}>
              <TouchableOpacity onPress={() => onClickAll()} style={[styles.renderCateItem, { backgroundColor: "white", backgroundColor: -1 == listCateId[0] ? Colors.colorLightBlue : "white", borderBottomWidth: 0.5, paddingVertical: 20, borderColor: 'gray'}]}>
                <View style={{ backgroundColor: -1 == listCateId[0] ? Colors.colorLightBlue : "white", flex: 1, padding: 7, borderRadius: 50, marginHorizontal: 5 }}>
                  <Text style={{ fontWeight: "bold", textAlign: "center", color: -1 == listCateId[0] ? "white" : Colors.colorLightBlue, fontSize: 12 }}></Text>
                </View>
                <Text numberOfLines={2} style={[styles.textRenderCateItem, { flex: 6, color: -1 == listCateId[0] ? "white" : Colors.colorLightBlue }]}>ALL</Text>
              </TouchableOpacity>
              <FlatList
                extraData={listCateId}
                showsVerticalScrollIndicator={false}
                data={category}
                renderItem={({ item, index }) => renderCateItem(item, index)}
                keyExtractor={(item, index) => '' + index}
              // ItemSeparatorComponent={() => <View style={{ width: 14 }}></View>}
              />
            </View>
          </View>
      }

      <View style={{ flex: 1, }}>
        <View style={{ flex: 1, justifyContent: "center", paddingVertical: 5 }}>
          {hasProducts ?
            product.length > 0 ?
              <FlatList
                keyboardShouldPersistTaps="always"
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                data={product}
                key={props.numColumns}
                numColumns={props.numColumns}
                renderItem={({ item, index }) => {
                  return (<ProductsItem
                    numColumns={props.numColumns}
                    getQuantityProduct={getQuantityProduct(item)}
                    item={item}
                    index={index}
                    onClickProduct={onClickProduct}
                  />)

                }}
                keyExtractor={(item, index) => '' + index}
                extraData={product.Quantity}
                onEndReached={(info) => { loadMore(info) }}
                ListFooterComponent={isLoadMore ? <ActivityIndicator color={Colors.colorchinh} /> : null}
                ItemSeparatorComponent={() => <View style={{ height: 14 }}></View>}
              />
              :
              <Text style={{ textAlign: "center" }}>{I18n.t('khong_tim_thay_san_pham_nao_phu_hop')}</Text>
            :
            <ActivityIndicator size="large" style={{}} color={Colors.colorchinh} />}
        </View>
      </View>
      {/* {isLoadMore ? <ActivityIndicator style={{ position: "absolute", right: 5, bottom: 5 }} color={Colors.colorchinh} /> : null} */}
    </View>
  );
}

const styles = StyleSheet.create({
  renderCateItem: { flexDirection: "row", paddingVertical: 20, alignItems: "center", marginBottom: 5,borderRadius:5  },
  textRenderCateItem: { fontWeight: "bold", textTransform: "uppercase", lineHeight: 20, textAlign: "left" },
  button: { borderWidth: 1, padding: 20, borderRadius: 10 },
});
