

import React, { Component } from 'react';
import { connect } from "react-redux";
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Divider } from "react-native-paper";
import Fonts from '../../theme/Fonts';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import { Constant } from '../../common/Constant';
import { setKeyChain, openListenerFingerScanner, resetStatusTouchId } from '../../actions/FingerprintScanner';
import { encodeBase64, decodeBase64 } from "../../common/Base64";
import * as Keychain from 'react-native-keychain';

class PinCode extends Component {

    constructor(props) {
        super(props);
        this.state = {
            code: '',
            password: '',
            success: false,
        };
        this.pinCodeInKeyChain = "";
        console.log("SmoothPinCodeInputTemp this.props ", this.props);
        if (this.props.first) {
            console.log("SmoothPinCodeInputTemp first = true kich hoạt smart otp ");
        } else
            this.getPinCodeInKeyChain();
    }

    getPinCodeInKeyChain() {
        console.log("getPinCodeToKeyChain ");
        Keychain.getGenericPassword()   // Retrieve the credentials from the keychain
            .then(credentials => {
                const { username, password } = credentials;
                let decodePass = decodeBase64(password)
                console.log("getPinCodeToKeyChain credentials ", credentials);
                console.log("getPinCodeToKeyChain decodePass ", decodePass);
                if (decodePass != '')
                    this.pinCodeInKeyChain = decodePass;
            })
            .catch(error => {
                console.log("getPinCodeToKeyChain error ", error);
            })
    }

    componentWillReceiveProps(nextProps) {
        console.log("PinCode componentWillReceiveProps nextProps ", nextProps);

    }

    componentDidMount() {

    }

    setPinCodeToKeyChain(pin) {
        let passworddata = encodeBase64(pin)
        Keychain.setGenericPassword(Constant.PIN_CODE, passworddata)
            .then(value => {
                console.log("setGenericPassword ", value);
                this.getPinCodeInKeyChain();
                this.props.checkCode(true);
            })
            .catch(error => {
            })
    }

    checkCode = (code) => {
        console.log("checkCode pinCodeInKeyChain ", this.pinCodeInKeyChain);
        console.log("checkCode code ", code);
        if (this.props.first) {
            this.pinCodeInKeyChain = code;
            this.props.reActive(true);
            this.setState({ code: '' })
            this.pinInput.focus();
        } else {
            if (code != this.pinCodeInKeyChain) {
                this.setState({ code: '' })
                this.pinInput.focus();
                this.props.checkCode(false);
            } else {
                this.handerCheckCodeTrue(code);
            }
        }
    }

    handerCheckCodeTrue(code) {
        console.log("handerCheckCodeTrue code ", code);
        this.props.checkCode(true, code);
        if (this.props.onTouchID) {
            console.log("checkCode onTouchID true");
            if (!(this.props.device_finger_scanner.statusAuthFinger && this.props.device_finger_scanner.isDeviceTouchId && this.props.device_finger_scanner.errorDeviceFinger == false))
                this.props.setKeyChain();
            else
                this.props.resetStatusTouchId();
        }
    }

    onFucus() {
        if (this.pinInput)
            this.pinInput.current.focus()
    }

    onClickTouchID() {
        openListenerFingerScanner((dataKeyChain) => {
            console.log("openListenerFingerScanner dataKeyChain: ", dataKeyChain);
            this.setState({ success: true })
            this.handerCheckCodeTrue();
        })
    }

    render() {
        const { code, password } = this.state;
        return (
            <View style={{ alignItems: 'center' }}>
                <SmoothPinCodeInput
                    autoFocus={true}
                    placeholder={<View style={{
                        width: 10,
                        height: 10,
                        borderRadius: 25,
                        opacity: this.state.success ? 1 : 0.3,
                        backgroundColor: this.state.success ? Colors.colorchinh : '#fff',
                    }}></View>}
                    mask={<View style={{
                        width: 10,
                        height: 10,
                        borderRadius: 25,
                        backgroundColor: Colors.colorchinh,
                    }}></View>}
                    filledData={"1234"}
                    // codeLength={6}
                    // cellSize={48}
                    // cellSpacing={6}
                    cellSize={72}
                    cellSpacing={12}
                    cellStyleFocused={{ borderRadius: 5, borderColor: Colors.colorchinh, borderWidth: 1 }}
                    cellStyle={{ borderRadius: 5, borderColor: "#ddd", borderWidth: 1 }}
                    password={true}
                    ref={refs => (this.pinInput = refs)}
                    value={code}
                    onTextChange={code => this.setState({ code })}
                    onFulfill={this.checkCode}
                    onBackspace={() => console.log('No more back.')}
                />
                {
                    (this.props.device_finger_scanner.statusAuthFinger && this.props.device_finger_scanner.isDeviceTouchId && this.props.device_finger_scanner.errorDeviceFinger == false) ?
                        <TouchableOpacity onPress={() => this.onClickTouchID()}>
                            {
                                this.props.device_finger_scanner.type == Constant.TOUCH_ID &&
                                <Image style={{ width: 70, height: 70, marginTop: 50 }} source={Images.icon_fingerprint} />
                            }
                            {
                                this.props.device_finger_scanner.type == Constant.FACE_ID &&
                                <Image style={{ width: 70, height: 70, marginTop: 50 }} source={Images.icon_faceid} />
                            }
                        </TouchableOpacity>
                        : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 30, paddingVertical: 15, backgroundColor: Colors.colorchinh, borderRadius: 5, borderWidth: 0
    }
})

function mapStateToProps(state) {
    return {
        device_finger_scanner: state.Common.device_finger_scanner
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setKeyChain: () => {
            dispatch(setKeyChain());
        },
        resetStatusTouchId: () => {
            dispatch(resetStatusTouchId());
        }
    };
};

export const SmoothPinCodeInputTemp = connect(
    mapStateToProps,
    mapDispatchToProps
)(PinCode);