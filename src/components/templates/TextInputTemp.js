

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView, TextInput
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Divider } from "react-native-paper";
import Fonts from '../../theme/Fonts';

export default class TextInputTemp extends Component {

    constructor(props) {
        super(props);
        this.state = { value: "" };
    }

    onChangeText(text) {
        this.setState({ value: text })
        this.props.onChangeText(text);
    }

    render() {
        return (
            <TextInput
                value={this.state.value}
                keyboardType={this.props.keyboardType ? this.props.keyboardType : "default"}
                style={[styles.inputtext, this.props.style]}
                onChangeText={(text) => this.onChangeText(text)}
                placeholder={this.props.placeholder}
                placeholderTextColor="#808080"
                secureTextEntry={this.props.password}/>
        )
    }
}

const styles = StyleSheet.create({
    inputtext: {
        backgroundColor: "#FFA951", color: "#000",
        margin: 10, padding: 10, borderColor: Colors.colorchinh, borderRadius: 5, borderWidth: 1, height: 50, width: Metrics.screenWidth - 50
    }
})
