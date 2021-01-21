import React, { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import realmStore from '../../../../data/realm/RealmStore';
import ProductsItemForPhone from './ProductsItemForPhone';
import { Constant } from '../../../../common/Constant';
import I18n from '../../../../common/language/i18n';
import { change_alias, dateToString, currencyToString } from '../../../../common/Utils';
import useDebounce from '../../../../customHook/useDebounce';
import { Colors, Metrics, Images } from '../../../../theme'
import ToolBarSelectProduct from '../../../../components/toolbar/ToolBarSelectProduct'
import dialogManager from '../../../../components/dialog/DialogManager'


export default (props) => {
  const [isLoadMore, setIsLoadMore] = useState(false)
  const [hasProducts, setHasProducts] = useState(false)
  const [category, setCategory] = useState([])
  const [product, setProduct] = useState([])
  const [skip, setSkip] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [listCateId, setListCateId] = useState([-1])
  const listProducts = useRef([...props.route.params.listProducts])
  const [valueSearch, setValueSearch] = useState('')
  const count = useRef(0)
  const debouncedVal = useDebounce(valueSearch)
  const listChangeText = useRef([])


  useEffect(() => {
    console.log('props.route.params.listProducts', props.route.params.listProducts);

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
    // results = results.sorted('Name')
    if (listCateId[0] != -1) {
      results = results.filtered(`CategoryId == ${listCateId[0]}`)
    }
    let productsRes = results.slice(skip, skip + Constant.LOAD_LIMIT)
    productsRes = JSON.parse(JSON.stringify(productsRes))
    console.log('productsRes', productsRes);
    productsRes.forEach((item, index) => {
      item.Quantity = 0
      listProducts.current.forEach(elm => {
        if (item.ProductId == elm.ProductId) {
          item.Quantity += +elm.Quantity
        }
      })
    })
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
          listProducts.current.forEach(elm => {
            if (item.Id == elm.Id) {
              item.Quantity += +elm.Quantity
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
    console.log('onClickProduct', item);
    item.index = undefined
    item.Description = getDescription(item)
    let pos = listProducts.current.map(elm => elm.Id).indexOf(item.Id);
    let pos_2 = listChangeText.current.map(elm => elm.Id).indexOf(item.Id);
    if (pos == -1 && pos_2 == -1) {
      item.Quantity = getQuantity(item)
      listProducts.current.unshift({ ...item })
    } else {
      item.Quantity = 0
      listProducts.current = listProducts.current.filter(elm => elm.Id != item.Id)
      listChangeText.current = listChangeText.current.filter(elm => elm.Id != item.Id)
    }
    console.log('onClickProduct listProducts ', listProducts.current);
    setProduct([...product])
  }

  const getQuantity = (item) => {
    let Quantity = 1
    if (item.IsPriceForBlock) {
      Quantity = item.BlockOfTimeToUseService / 60
    }
    return Quantity
  }

  const getDescription = (item) => {
    let Description = ''
    if (item.ProductType == 2 && item.IsTimer) {
      // let date = new Date()
      // let [day, month, hour, minute] = [
      //   (date.getDate() < 10 ? "0" : "") + (date.getDate()),
      //   ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1),
      //   date.getHours(),
      //   date.getMinutes()
      // ]
      // Description = `${day}/${month} ${hour}:${minute}=>${day}/${month} ${hour}:${minute} (0 ${I18n.t('phut')})`

      let checkIn = new Date();
      Description = `${dateToString(checkIn, "DD/MM HH:mm")}=>${dateToString(checkIn, "DD/MM HH:mm")} () ${I18n.t('mot_gio_dau_tien')} = ${currencyToString(item.Price)}.`;
    }
    return Description
  }

  const handleButtonIncrease = (item, index) => {
    console.log('handleButtonIncrease', item, index);
    let qtt = getQuantity(item)

    if (item.SplitForSalesOrder || (item.ProductType == 2 && item.IsTimer)) {
      listProducts.current.unshift({ ...item, Quantity: qtt })
    } else {
      let pos = listProducts.current.map(elm => elm.Id).indexOf(item.Id);
      let pos_2 = listChangeText.current.map(elm => elm.Id).indexOf(item.Id);
      if (pos == -1) {
        listChangeText.current[pos_2].Quantity += qtt
      } else {
        listProducts.current[pos].Quantity += qtt
      }

    }
    setProduct([...product])
  }

  const handleButtonDecrease = (item, index) => {
    let qtt = getQuantity(item)
    let pos = listProducts.current.map(elm => elm.Id).indexOf(item.Id);
    let pos_2 = listChangeText.current.map(elm => elm.Id).indexOf(item.Id);
    if (pos > -1) {
      if (item.SplitForSalesOrder || (item.ProductType == 2 && item.IsTimer)) {
        if (listProducts.current[pos].Quantity >= qtt) {
          listProducts.current[pos].Quantity -= qtt
        } else {
          listProducts.current.splice(pos, 1)
        }
      } else {
        if (listProducts.current[pos].Quantity >= qtt) {
          listProducts.current[pos].Quantity -= qtt
        } else {
          listProducts.current = listProducts.current.filter(elm => elm.Id != item.Id)
        }
      }
    } else {
      if (listChangeText.current[pos_2].Quantity > 0) {
        listChangeText.current[pos_2].Quantity -= qtt
      }
      if (listChangeText.current[pos_2].Quantity == 0) {
        listChangeText.current = listChangeText.current.filter(elm => elm.Id != item.Id)
      }
    }

    setProduct([...product])
  }

  const onChangeText = (numb, item) => {
    console.log('listChangeText numb ', numb);
    numb = +numb
    if (numb <= 0) numb = 0
    let exist = false
    console.log('listChangeText numb2 ', numb);
    listProducts.current = listProducts.current.filter(elm => elm.Id != item.Id)
    // listProducts.current.unshift({ ...item, Quantity: numb, Sid: Date.now() })
    listChangeText.current.forEach(elm => {
      if (elm.Id == item.Id) {
        elm.Quantity = numb
        exist = true
      }
    })
    console.log('listChangeText numb3 ', numb);
    if (!exist) {
      listChangeText.current.push({ ...item, Quantity: numb, })
    }
    console.log('listProducts.current', listProducts.current);

  }


  const onClickDone = () => {
    props.navigation.pop();
    listChangeText.current.forEach((elm, idx, arr) => {
      if ((elm.SplitForSalesOrder || (elm.ProductType == 2 && elm.IsTimer))) {
        console.log('onClickDone elm.Quantity', elm.Quantity);
        arr.splice(idx, 1)
        let qtt = getQuantity(elm)
        for (let i = 0; i < elm.Quantity; i++) {
          arr.splice(idx, 0, { ...elm, Quantity: qtt, })
        }
      }
    })
    listProducts.current = [...listProducts.current, ...listChangeText.current].filter(item => item.Quantity > 0)
    console.log('onClickDone listProducts', listProducts.current);
    props.route.params._onSelect(listProducts.current, 1);
  }

  const clickLeftIcon = () => {
    if (JSON.stringify(props.route.params.listProducts) != JSON.stringify(listProducts.current)) {
      dialogManager.showPopupTwoButton(I18n.t('ban_co_muon_luu'), I18n.t('thong_bao'), (value) => {
        if (value == 1) {
          onClickDone()
        } else {
          props.navigation.goBack();
        }
      })
    } else {
      props.navigation.goBack();
    }
  }

  const loadMore = (info) => {
    console.log(info, 'loadMore');
    if (count.current > 0) {
      setIsLoadMore(true)
      setSkip((prevSkip) => prevSkip + Constant.LOAD_LIMIT);
    }
  }

  const outputTextSearch = (text) => {
    setValueSearch(text)
  }


  const renderCateItem = (item, index) => {
    return (
      <TouchableOpacity onPress={() => onClickCate(item, index)} key={index} style={[styles.renderCateItem, { backgroundColor: item.Id == listCateId[0] ? Colors.colorchinh : "white" }]}>
        <Text numberOfLines={2} style={[styles.textRenderCateItem, { color: item.Id == listCateId[0] ? "white" : Colors.colorchinh }]}>{item.Name}</Text>
      </TouchableOpacity>
    );
  }


  return (
    <View style={{ flex: 1 }}>
      <ToolBarSelectProduct
        leftIcon="keyboard-backspace"
        clickLeftIcon={clickLeftIcon}
        onClickDone={onClickDone}
        title={I18n.t('chon_mon')}
        outputTextSearch={outputTextSearch} />
      {
        isSearching ?
          null
          :
          <View style={{ flex: 0.5, flexDirection: "row", marginVertical: 5, marginHorizontal: 2 }}>
            <View style={{ flex: 1 }}>
              <FlatList
                extraData={listCateId}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={category}
                renderItem={({ item, index }) => renderCateItem(item, index)}
                keyExtractor={(item, index) => '' + index}
              />
            </View>
          </View>
      }

      <View style={{ flex: 5, }}>
        <View style={{ flex: 1, justifyContent: "center", }}>
          {hasProducts ?
            <FlatList
              removeClippedSubviews={true}
              showsVerticalScrollIndicator={false}
              data={product}
              renderItem={({ item, index }) =>
                <ProductsItemForPhone
                  onChangeText={onChangeText}
                  item={item}
                  index={index}
                  getQuantity={getQuantity}
                  onClickProduct={onClickProduct}
                  handleButtonDecrease={handleButtonDecrease}
                  handleButtonIncrease={handleButtonIncrease}
                />
              }
              keyExtractor={(item, index) => '' + index}
              extraData={product.Quantity}
              onEndReached={(info) => { loadMore(info) }}
              ListFooterComponent={isLoadMore ? <ActivityIndicator color={Colors.colorchinh} /> : null}
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
  renderCateItem: { justifyContent: "center", alignItems: "center", paddingHorizontal: 5, marginLeft: 5, width: 150 },
  textRenderCateItem: { fontWeight: "bold", textTransform: "uppercase", textAlign: "center", },
  button: { borderWidth: 1, padding: 20, borderRadius: 10 },
});
