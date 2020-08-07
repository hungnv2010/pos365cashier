// import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
// import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
// import { Images, Colors, Metrics } from '../../theme';
// import { WebView } from 'react-native-webview';
// import useDidMountEffect from '../../customHook/useDidMountEffect';
// import dialogManager from '../../components/dialog/DialogManager';
// import { HTTPService } from '../../data/services/HttpService';
// import { ApiPath } from '../../data/services/ApiPath';
// import ToolBarPreviewHtml from '../../components/toolbar/ToolBarPreviewHtml';
// import JsonContent1 from '../../data/json/data_print_demo'
// import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
// import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
// import { Constant } from '../../common/Constant';
// import { useSelector } from 'react-redux';
// import { Snackbar } from 'react-native-paper';
// import printService from '../../data/html/PrintService';
// const { Print } = NativeModules;
// import HtmlDefault from '../../data/html/htmlDefault';
// import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
// import HTML from 'react-native-render-html';
// import AutoHeightWebView from 'react-native-autoheight-webview'
// const FOOTER_HEIGHT = 21;
// const PADDING = 16;
// const BOTTOM_MARGIN_FOR_WATERMARK = FOOTER_HEIGHT * PADDING;




// export default function ModulePrint(data) {

//     const[uriImg, setUriImg ] = useState("")

//     useEffect(()=>{
//         console.log("ModulePrint data ",data);

//         setTimeout(() => {
//             captureRef(childRef, {
//                 // snapshotContentContainer: true,
//             }).then(
//                 uri => {
//                     console.log('Snapshot uri', uri);
//                     setUriImg(uri);
//                     data.callback(uri)
    
//                 },
//                 error => console.error('Oops, snapshot failed', error)
//             );
//         }, 2000);
//     },[])

    
//     const childRef = useRef();
//     return (
//         <View style={{}}>
//             {/* <TouchableOpacity style={{backgroundColor:"red", padding: 20,}} onPress={handleClick}><Text>Click</Text></TouchableOpacity> */}
//             <View style={{ opacity: 0 }}>
//                 <ScrollView>
//                     <View
//                         ref={childRef}
//                         style={{
//                             flex: 1, alignItems: "center"
//                         }}>
//                         <AutoHeightWebView
//                             scrollEnabled={false}
//                             style={{ width: Dimensions.get('window').width }}
//                             // customScript={`document.body.style.background = 'red';`}

//                             // onSizeUpdated={({size => console.log(size.height)})},
//                             files={[{
//                                 href: 'cssfileaddress',
//                                 type: 'text/css',
//                                 rel: 'stylesheet'
//                             }]}
//                             source={{ html: data.html }}
//                             scalesPageToFit={true}
//                         />
//                     </View>
//                 </ScrollView>
//             </View>
//             {/* <TouchableOpacity style={{backgroundColor:"red", padding: 20, flex: 1}} onPress={() => data.callback("ClickHung")}><Text>Click</Text></TouchableOpacity> */}
//             {/* <Image source={{ uri: uriImg }} resizeMode="contain" style={{ position: "absolute", top: 50, width: 100, height: 100, flex: 1 }} /> */}
//         </View>
//     )

// }

// const styles = StyleSheet.create({

// })
