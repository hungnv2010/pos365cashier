import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images } from '../../theme';
import IconFeather from 'react-native-vector-icons/Feather';
import { ScreenList } from '../../common/ScreenList';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../common/Utils';
import colors from '../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../common/Constant';
import PointVoucher from './pointVoucher';

let specialChar = ['/', '*', '-', '+', '.']

export default (props) => {

    const [method, setMethod] = useState(props.method)
    const [results, setResults] = useState("")

    useEffect(() => {
        setMethod(props.method)
        setResults("")
    }, [props.method])

    useEffect(() => {
        console.log("results === ", results);
        if (results != undefined && results != "" && results != "0") {
            console.log("results ===:: ok");
            let number = results.replace(/,/g, '');
            props.outputResult(Number(number))
        } else {
            console.log("results ===::: not ok");
            props.outputResult(0)
        }
    }, [results])

    const onClickButton = (button) => {
        switch (button) {
            case 'clear':
                setDataResult('')
                break;

            case 'remove':
                setDataResult(results.slice(0, results.length - 1))
                break;

            case '/':
            case '*':
            case '-':
            case '+':
                var lastChar = results.slice(results.length - 1)
                if (specialChar.includes(lastChar)) {
                    setDataResult((results.slice(0, results.length - 1) + button))
                } else {
                    let newResult = results + button
                    setDataResult(newResult)
                }
                break;

            case '.':
                var lastChar = results.slice(results.length - 1)
                console.log("lastChar ", lastChar);
                console.log("specialChar ", specialChar);
                console.log("specialChar.includes(lastChar) ", specialChar.includes(lastChar));
                if (specialChar.includes(lastChar)) {
                    console.log("(results.slice(0, results.length - 1) + button) ", (results.slice(0, results.length - 1) + button));
                    setDataResult((results.slice(0, results.length - 1) + button))
                    return
                }

                let lastIndex = results.lastIndexOf('.')
                console.log("lastIndex ", lastIndex);

                if (lastIndex != -1) {
                    let rightString = results.slice(lastIndex + 1, results.length)
                    console.log("rightString ", rightString);
                    console.log("!rightString.includes('+') ", !rightString.includes('+'));
                    console.log("!rightString.includes('-') ", !rightString.includes('-'));
                    if (!rightString.includes('+') && !rightString.includes('-') && !rightString.includes('*') && !rightString.includes('/')) {
                        return
                    }
                }
                console.log("results ", results);
                console.log("button ", button);
                setDataResult((results + button))
                break;

            case '500000':
            case '200000':
            case '100000':
            case '50000':
                var lastChar = results.slice(results.length - 1)
                if (specialChar.includes(lastChar) || results == 0) {
                    setDataResult((results + button))
                } else {
                    let newResult = (results).toString().replace(/,/g, '');
                    let oldResult = eval(newResult)
                    newResult = +button + oldResult
                    console.log('oldResult', oldResult, newResult, results);
                    newResult = newResult.toString().replace(/(\d)(?=(\d{3})+\b)/g, '$&,');
                    setResults("" + newResult)
                }
                break;

            default:
                setDataResult((results + button))
                break;
        }
    }

    const setDataResult = (results) => {
        console.log("setDataResult result === :: ", results);
        if (results == '') {
            setResults('0')
        } else {
            let newResult = (results).toString().replace(/,/g, '');
            console.log("setDataResult result === ::: ", newResult);
            newResult = newResult.toString().replace(/(\d)(?=(\d{3})+\b)/g, '$&,');
            console.log("setDataResult result === :::: ", newResult);
            setResults(newResult)
        }
    }

    const getFinalResults = () => {
        try {
            let res = results.replace(/,/g, '');
            res = res ? res : 0
            res = eval(res);
            res = res.toString().replace(/(\d)(?=(\d{3})+\b)/g, '$&,');
            setResults("" + res)
        } catch (error) {
            console.log('getFinalResults err', error);
            let newRes = results.slice(0, results.length - 1)
            let res = newRes.replace(/,/g, '');
            res = eval(res);
            res = res.toString().replace(/(\d)(?=(\d{3})+\b)/g, '$&,');
            setResults("" + res)
        }
    }



    return (
        <View style={{ flex: 1 }}>
            {/* <Surface style={styles.surface}>
                <View style={{ height: 50, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", }}>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Image source={Images.icon_bell_blue} style={{ height: 30, width: 30 }} />
                        <Text>Print bill</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Image source={Images.icon_bell_blue} style={{ height: 30, width: 30 }} />
                        <Text>Print 2 bill</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Image source={Images.icon_bell_blue} style={{ height: 30, width: 30 }} />
                        <Text>Print temp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Image source={Images.icon_bell_blue} style={{ height: 30, width: 30 }} />
                        <Text>Not print 0 price</Text>
                    </TouchableOpacity>
                </View>
            </Surface> */}
            {
                !props.choosePoint ?
                    <>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textTransform: "uppercase", textAlign: "center", paddingVertical: 20, fontWeight: "500", fontSize: 25 }}>{I18n.t('may_tinh')}</Text>
                            <Text style={{ color: colors.colorchinh, textAlign: "center", paddingVertical: 30, fontWeight: "bold", fontSize: 18 }}>{method && method.name ? I18n.t(method.name) : ""}</Text>
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                <Text style={[styles.textButton, { fontSize: 35 }]}>{results != '' || results == '0' ? results : '0'}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: "row", marginTop: 5 }}>
                                <TouchableOpacity onPress={() => { onClickButton('clear') }} style={[styles.button, { flex: 2 }]}>
                                    <Text style={[styles.textButton, { color: colors.colorchinh }]}>CLEAR</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('/') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>/</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('*') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>x</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('remove') }} style={[styles.button, { flex: 1 }]}>
                                    <IconFeather name="delete" size={30} color={colors.colorchinh} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row", }}>
                                <TouchableOpacity onPress={() => { onClickButton('500000') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>500K</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('7') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>7</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('8') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>8</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('9') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>9</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('-') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>-</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row" }}>
                                <TouchableOpacity onPress={() => { onClickButton('200000') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>200K</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('4') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>4</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('5') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>5</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('6') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>6</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { onClickButton('+') }} style={[styles.button, { flex: 1 }]}>
                                    <Text style={styles.textButton}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 2, flexDirection: "row" }}>
                                <View style={{ flex: 4 }}>
                                    <View style={{ flex: 1, flexDirection: "row" }}>
                                        <TouchableOpacity onPress={() => { onClickButton('100000') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>100K</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onClickButton('1') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onClickButton('2') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>2</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onClickButton('3') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>3</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: "row" }}>
                                        <TouchableOpacity onPress={() => { onClickButton('50000') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>50K</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onClickButton('0') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>0</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onClickButton('000') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>000</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onClickButton('.') }} style={[styles.button, { flex: 1 }]}>
                                            <Text style={styles.textButton}>.</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity onPress={getFinalResults} style={[styles.button, { flex: 2, backgroundColor: colors.colorchinh }]}>
                                        <Text style={[styles.textButton, { color: "white" }]}>=</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                    :
                    <PointVoucher />}
        </View>
    )
}


const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    },
    button: { alignItems: "center", justifyContent: "center", borderWidth: 0.5, borderColor: "#ccc", margin: 2 },
    textButton: { fontWeight: "bold", textAlign: "center" }
})
