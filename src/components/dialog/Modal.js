

import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Text, Modal, StatusBar, TouchableOpacity } from 'react-native';
import { Metrics, Fonts, Colors } from '../../theme';
import ButtonTemp from '../templates/ButtonTemp';
import I18n from '../../common/language/i18n'
import PropTypes from 'prop-types';
import color from 'color';

export default class ModalTemplate extends React.Component {

    componentDidMount() {

    }

    render() {
        console.log("ModalTemplate ", this.props);
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.props.visible}
                onRequestClose={() => {
                }}>
                <StatusBar animated barStyle="light-content" backgroundColor={color(Colors.colorchinh).darken(0.5).rgb().string()} />
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => this.props.onPress()}
                        style={styles.ovelap}>
                        <View style={[styles.ovelap, { backgroundColor: 'rgba(0,0,0,0.5)' }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 20,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <Text style={{ color: "#000", fontSize: Fonts.size.covua, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>{this.props.title ? this.props.title : I18n.t('app_name')}</Text>
                            {
                                this.props?.viewChild && this.props?.viewChild != null ?
                                    this.props.viewChild
                                    : null
                            }
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    buttonLabel: PropTypes.string,
    onPress: PropTypes.func
};

const defaultProps = {
    onPress: () => { }
};

ModalTemplate.propTypes = propTypes;
ModalTemplate.defaultProps = defaultProps;

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
    }
})