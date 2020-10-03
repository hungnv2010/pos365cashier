import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Snackbar, Surface } from 'react-native-paper';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore';
import { Images } from '../../../theme';
import { ScreenList } from '../../../common/ScreenList';
import ToolBarDefault from '../../../components/toolbar/ToolBarDefault';
import { currencyToString } from '../../../common/Utils';
import colors from '../../../theme/Colors';
import { useSelector } from 'react-redux';
import { Constant } from '../../../common/Constant';
import { Results } from 'realm';

export default (props) => {

    const [method, setMethod] = useState(props.method)
    const [results, setResults] = useState("ggh")

    return (
        <View style={{ flex: 1 }}>
            <Surface style={styles.surface}>
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
            </Surface>
            <View style={{ flex: 1 }}>
                <Text style={{ textTransform: "uppercase", textAlign: "center", paddingVertical: 20 }}>Calculator</Text>
                <Text style={{ color: colors.colorchinh, textAlign: "center", paddingVertical: 30 }}>{method.name}</Text>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text>{results}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: "row", marginTop: 5 }}>
                    <TouchableOpacity style={{ flex: 2, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>x</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, flexDirection: "row", }}>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                        <Text>a</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 2, flexDirection: "row" }}>
                    <View style={{ flex: 4 }}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                                <Text>a</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5, margin: 2 }}>
                            <Text>a</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    surface: {
        margin: 5,
        elevation: 4,
    }
})
