import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import realmStore from '../../../../data/realm/RealmStore';
import ProductsItem from './ProductsItem';
import { Constant } from '../../../../common/Constant';
import I18n from '../../../../common/language/i18n';
import { change_alias } from '../../../../common/Utils';
import useDebounce from '../../../../customHook/useDebounce';
import { Colors, Metrics, Images } from '../../../../theme'
import { Subject } from 'rxjs';

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
  const subject = useRef(new Subject())

  useEffect(() => {
    const getSearchResult = async () => {
      
      if (debouncedVal) {
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
    const getCategories = async () => {
      let newCategories = [{ Id: -1, Name: I18n.t('tat_ca') }];
      let results = await realmStore.queryCategories()
      // results = results.sorted('Name')
      results.forEach(item => {
        newCategories.push(item)
      })
      setCategory(newCategories)
      
    }
    getCategories()
  }, [])

  const getProducts = useCallback(async () => {
    console.log('getProducts');
    
    let results = await realmStore.queryProducts()
    results = results.sorted('Name')
    if (listCateId[0] != -1) {
      results = results.filtered(`CategoryId == ${listCateId[0]}`)
    }
    let productsRes = results.slice(skip, skip + Constant.LOAD_LIMIT)
    productsRes = JSON.parse(JSON.stringify(productsRes))
    count.current = productsRes.length
    setProduct([...product, ...productsRes])
    setHasProducts(true)
    setIsLoadMore(false)
    return () => {
      count.current = 0
    }
  }, [skip, listCateId])


  useEffect(() => {
    getProducts()
  }, [getProducts])


  const onClickCate = async (item, index) => {
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
    let newProduct = {...item}
    newProduct.Description = getDescription(newProduct)
    newProduct.Quantity = getQuantity(newProduct)
    newProduct.ProductImages = []
    newProduct.index = undefined
    props.outputSelectedProduct(newProduct)
    console.log('onClickProduct', newProduct);
  }

  const getQuantityProduct = (arrItem) => {
    let Quantity = 0
    listProducts.forEach(item => {
      if (item.ProductId == arrItem.ProductId) {
        Quantity = item.Quantity
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
    if (item.IsPriceForBlock) {
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
      <View style={[styles.renderCateItem, { backgroundColor: item.Id == listCateId[0] ? Colors.colorchinh : "white" }]}>
        <TouchableOpacity onPress={() => onClickCate(item, index)} key={index} style={{}}>
          <Text numberOfLines={2} style={[styles.textRenderCateItem, { color: item.Id == listCateId[0] ? "white" : Colors.colorchinh }]}>{item.Name}</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={{ flex: 1 }}>
      {
        isSearching ?
          null
          :
          <View style={{ height: 65, flexDirection: "row", marginBottom: 14, marginTop: 7 }}>
            <View style={{ flex: 1, marginHorizontal: 7 }}>
              <FlatList
                extraData={listCateId}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={category}
                renderItem={({ item, index }) => renderCateItem(item, index)}
                keyExtractor={(item, index) => '' + index}
                ItemSeparatorComponent={() => <View style={{ width: 14 }}></View>}
              />
            </View>
          </View>
      }

      <View style={{ flex: 1, }}>
        <View style={{ flex: 1, justifyContent: "center", }}>
          {hasProducts ?
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
            <ActivityIndicator size="large" style={{}} color={Colors.colorchinh} />}
        </View>
      </View>
      {/* {isLoadMore ? <ActivityIndicator style={{ position: "absolute", right: 5, bottom: 5 }} color={Colors.colorchinh} /> : null} */}
    </View>
  );
}

const styles = StyleSheet.create({
  renderCateItem: { justifyContent: "center", alignItems: "center", paddingHorizontal: 5, width: 136, },
  textRenderCateItem: { fontWeight: "bold", textTransform: "uppercase", textAlign: "center", },
  button: { borderWidth: 1, padding: 20, borderRadius: 10 },
});
