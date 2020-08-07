import React, { Component } from 'react'
import FadeInView from '../animate/FadeInView'
import { Colors, Fonts, Metrics } from '../../theme'
import {
    StyleSheet, View, TouchableWithoutFeedback, Text, StatusBar
} from 'react-native'
import I18n from '../../common/language/i18n'
import { Paragraph, Dialog, Button, Subheading } from 'react-native-paper';
import color from 'color';


export default function HopThoai(props) {


    const handleClickOutside = () => {

        props.dismissOnTouchOutside ? props.dismiss() : null
    }

    const handleClickOk = () => {
        if (props.callback) {
            props.callback(1)
        }

        props.dismiss()

    }
    const handleClickCancle = () => {
        if (props.callback) {
            props.callback(0)
        }
        props.dismiss()
    }



        return (

            <FadeInView style={[styles.container, styles.ovelap]}>
                <StatusBar animated barStyle="light-content" backgroundColor={color(Colors.colorchinh).darken(0.5).rgb().string()} />
                <TouchableWithoutFeedback
                    onPress={handleClickOutside}
                    style={styles.ovelap}>
                    <View style={[styles.ovelap, { backgroundColor: '#000', opacity: .5 }]}></View>

                </TouchableWithoutFeedback>

                <View style={{
                    backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 24,
                    minWidth: Metrics.screenWidth * 0.7
                }}>

                    <Dialog.Title>
                        {props.title ? props.title : I18n.t('thong_bao')}
                    </Dialog.Title>

                    <Dialog.Content>
                        <Paragraph style={{
                            // fontSize: Fonts.size.covuanhohon,
                            letterSpacing: 0.15, lineHeight: 24
                        }}>
                            {props.content}
                        </Paragraph>
                    </Dialog.Content>

                    <Dialog.Actions>
                        {/* <Icon name='close'/> */}
                        {!props.one ?
                            <Button
                                color={Colors.text}
                                onPress={handleClickCancle}
                            >
                                <Text style={{
                                    fontSize: Fonts.size.mainSize,
                                }}>
                                    {props.label1 ?
                                        props.label1.toUpperCase()
                                        :
                                        I18n.t('huy').toUpperCase()
                                    }
                                </Text>
                            </Button>
                            : null
                        }
                        <Button
                            color={Colors.colorBlueText}
                            onPress={handleClickOk}
                        >
                            <Text style={{ fontSize: Fonts.size.mainSize }}>
                                {props.label2 ?
                                    props.label2.toUpperCase()
                                    :
                                    I18n.t('dong_y').toUpperCase()
                                }
                            </Text>
                        </Button>
                    </Dialog.Actions>

                </View>


            </FadeInView>
        )
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',

    },
    ovelap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    titleTextStyle: {
        fontSize: Fonts.size.colon,
        color: Colors.colorPopupTitle,
        // fontFamily: Fonts.style.medium,
    },
    contentText: {
        paddingVertical: 24,
        fontSize: Fonts.size.covua,
        color: Colors.mainTextColor
    },
    buttonText: {
        margin: 0,
        minWidth: 60,
    },
    touchButton: {
        width: 80, height: 40,
        borderColor: Colors.mainTextColor, justifyContent: 'center', alignItems: 'center'
    }

})
