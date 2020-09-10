import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Animated, Image, View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import MainToolBar from '../main/MainToolBar';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import { Images, Metrics } from '../../theme';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import { Chip, Snackbar } from 'react-native-paper';
import colors from '../../theme/Colors';

var HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 70 : 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default (props) => {



    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [rooms, setRooms] = useState([])
    const [heightTab, setHeightTab] = useState(200)
    const [update, setUpdate] = useState(0)
    const heightTab2 = useRef(0);
    const [statescrollY, setScrollY] = useState(new Animated.Value(
        Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
    ))

    useEffect(() => {

        console.log("Room props rooms ", props.route.params.rooms);
        console.log("Room props roomGroups ", props.route.params.roomGroups);

        handlerData = () => {
            var outputList = [];
            props.route.params.roomGroups.map(item => {
                console.log("handlerData item ", item);
                let object = { Id: item.Id, Name: item.Name, list: [] }
                props.route.params.rooms.map(child => {
                    if (item.Id == child.RoomGroupId) {
                        object.list.push(JSON.parse(JSON.stringify(child)))
                    }
                })
                outputList.push(object);
            })
            console.log("handerData outputList test ", outputList);
            setRooms(outputList)

            setTimeout(() => {
                // alert( heightTab2.current)
                setUpdate(1)
            }, 1000);
        }

        handlerData();

    }, [])

    useEffect(() => {
        setUpdate(1)
    }, [heightTab])

    const _renderScrollViewContent = () => {
        return (
            <ScrollView
                onScroll={(event) => {
                    if (event.nativeEvent.contentOffset.y < 30) {
                        setHeightTab(200)
                    } else {
                        setHeightTab(100)
                    }
                }}
            >
                {
                    rooms.map((item, index) => {
                        return (
                            <View style={{ flex: 1 }}>
                                {
                                    item.list.length > 0 ?
                                        <View style={{}}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#eeeeee", }}>
                                                <Text style={{ textTransform: "uppercase", fontWeight: "bold", padding: 15 }}>{item.Name}</Text>
                                                <Text style={{ padding: 15 }}>{item.list.length} bàn</Text>
                                            </View>

                                            {
                                                item.list.map((el, indexEl) => {
                                                    return (
                                                        <TouchableOpacity style={{ backgroundColor: "#fff", padding: 15, flexDirection: "column" }}>
                                                            <Text style={{ textTransform: "uppercase", fontWeight: "bold" }}>{el.Name}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                        : null
                                }
                            </View>
                        )
                    })
                }
            </ScrollView>
        );
    }

    const scrollY = Animated.add(
        statescrollY,
        Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
    );
    const headerTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -HEADER_SCROLL_DISTANCE],
        extrapolate: 'clamp',
    });

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });
    const imageTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 100],
        extrapolate: 'clamp',
    });

    const titleScale = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 1, 0.8],
        extrapolate: 'clamp',
    });
    const titleTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 0, -8],
        extrapolate: 'clamp',
    });

    return (
        // <View style={styles.conatiner}>
        //     <ToolBarDefault
        //         navigation={props.navigation}
        //         title={I18n.t('danh_sach_phong_ban')}
        //     />
        //     <View
        //         style={{
        //             height: heightTab > 0 && heightTab,
        //             // width: Metrics.screenWidth * 1.5,
        //             flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 0.5, borderBottomColor: colors.colorchinh
        //         }}>
        //         {
        //             rooms.map((item, index) => {
        //                 return (
        //                     <View style={{
        //                         margin: 10,
        //                     }}>
        //                         <Text>{item.Name}</Text>
        //                     </View>
        //                 );
        //             })}
        //     </View>

        //     <ScrollView
        //         onScroll={(event) => {
        //             if (event.nativeEvent.contentOffset.y < 30) {
        //                 setHeightTab(200)
        //             } else {
        //                 setHeightTab(100)
        //             }
        //         }}
        //     >
        //         {
        //             rooms.map((item, index) => {
        //                 return (
        //                     <View style={{ flex: 1 }}>
        //                         {
        //                             item.list.length > 0 ?
        //                                 <View style={{}}>
        //                                     <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#eeeeee", }}>
        //                                         <Text style={{ textTransform: "uppercase", fontWeight: "bold", padding: 15 }}>{item.Name}</Text>
        //                                         <Text style={{ padding: 15 }}>{item.list.length} bàn</Text>
        //                                     </View>

        //                                     {
        //                                         item.list.map((el, indexEl) => {
        //                                             return (
        //                                                 <TouchableOpacity style={{ backgroundColor: "#fff", padding: 15, flexDirection: "column" }}>
        //                                                     <Text style={{ textTransform: "uppercase", fontWeight: "bold" }}>{el.Name}</Text>
        //                                                 </TouchableOpacity>
        //                                             )
        //                                         })
        //                                     }
        //                                 </View>
        //                                 : null
        //                         }
        //                     </View>
        //                 )
        //             })
        //         }
        //     </ScrollView>
        //     <Snackbar
        //         duration={5000}
        //         visible={showToast}
        //         onDismiss={() =>
        //             setShowToast(false)
        //         }
        //     >
        //         {toastDescription}
        //     </Snackbar>
        // </View>

        <View style={styles.fill}>
            <ToolBarDefault
                navigation={props.navigation}
                title={I18n.t('danh_sach_phong_ban')}
            />
            <View
                onLayout={(event) => {
                    var { x, y, width, height } = event.nativeEvent.layout;
                    // heightTab2.current = height;
                    // HEADER_MAX_HEIGHT = height;
                    // setHeightTab(height)
                }}
                style={{
                    flexShrink: heightTab < 200 ? 2 : 0,
                    // height: heightTab,
                    // width: Metrics.screenWidth * 1.5,
                    flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 0, borderBottomColor: colors.colorchinh
                }}>
                {
                    rooms.map((item, index) => {
                        return (
                            <View style={{
                                margin: 10,
                            }}>
                                <Text>{item.Name}</Text>
                            </View>
                        );
                    })}
            </View>
            {_renderScrollViewContent()}
            {/* <Animated.ScrollView
                style={{}}
                scrollEventThrottle={1}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: statescrollY } } }],
                    { useNativeDriver: true },
                )}

                // iOS offset for RefreshControl
                contentInset={{
                    top: HEADER_MAX_HEIGHT,
                }}
                contentOffset={{
                    y: -HEADER_MAX_HEIGHT,
                }}
            >
                {_renderScrollViewContent()}
            </Animated.ScrollView> */}
            {/* <Animated.View
                pointerEvents="none"
                style={[
                    styles.header,
                    { transform: [{ translateY: headerTranslate }] },
                ]}
            >
                <View
                    onLayout={(event) => {
                        var {x, y, width, height} = event.nativeEvent.layout;
                        // heightTab2.current = height;
                        // HEADER_MAX_HEIGHT = height;
                        // setHeightTab(height)
                      }}
                    style={{
                        // height: "100%",
                        // width: Metrics.screenWidth * 1.5,
                        flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 0, borderBottomColor: colors.colorchinh
                    }}>
                    {
                        rooms.map((item, index) => {
                            return (
                                <View style={{
                                    margin: 10,
                                }}>
                                    <Text>{item.Name}</Text>
                                </View>
                            );
                        })}
                </View>
            </Animated.View> */}
            {/* <Animated.View
                style={[
                    styles.bar,
                    {
                        transform: [
                            { scale: titleScale },
                            { translateY: titleTranslate },
                        ],
                    },
                ]}
            >
            </Animated.View> */}
        </View>

    );

}

const styles = StyleSheet.create({
    conatiner: { flex: 1, backgroundColor: "#eeeeee" },
    fill: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#03A9F4',
        overflow: 'hidden',
        // height: HEADER_MAX_HEIGHT,
    },
    bar: {
        backgroundColor: 'transparent',
        // marginTop: Platform.OS === 'ios' ? 28 : 38,
        // height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    title: {
        color: 'white',
        fontSize: 18,
    },
    scrollViewContent: {
        // iOS uses content inset, which acts like padding.
        paddingTop: Platform.OS !== 'ios' ? HEADER_MAX_HEIGHT : 0,
    },
    row: {
        height: 40,
        margin: 16,
        backgroundColor: '#D3D3D3',
        alignItems: 'center',
        justifyContent: 'center',
    },
})