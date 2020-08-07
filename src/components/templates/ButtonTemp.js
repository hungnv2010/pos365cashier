

import React, { Component } from 'react';
import {
    View, StyleSheet, Animated
} from 'react-native';
import { Colors } from '../../theme'
import { Surface, withTheme, Text, TouchableRipple } from "react-native-paper";
import PropTypes from 'prop-types';
import color from 'color';


class ButtonTemp extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {
            disabled,
            icon,
            type,
            color: buttonColor,
            accessibilityLabel,
            onPress,
            style,
            theme,
            contentStyle,
            text,
        } = this.props;
        const { colors, roundness } = theme;
        const fontFamily = theme.fonts.medium;
        let backgroundColor, borderColor, textColor, borderWidth;
        if (type === 'ok') {
            if (disabled) {
                backgroundColor = color(Colors.colorchinh).alpha(0.12).rgb().string();
            } else if (buttonColor) {
                backgroundColor = buttonColor;
            } else {
                backgroundColor = Colors.colorchinh;
            }
        } else {
            backgroundColor = 'transparent';
        }

        if (type === 'cancel') {
            borderColor = color("#000").alpha(0.24).rgb().string();
            borderWidth = StyleSheet.hairlineWidth;
        } else {
            borderColor = 'transparent';
            borderWidth = 0;
        }

        if (disabled) {
            textColor = color(Colors.colorText).alpha(0.32).rgb().string();
        } else if (type === 'ok') {
            textColor = "#000";
        } else if (buttonColor) {
            textColor = buttonColor;
        } else {
            textColor = Colors.colorText;
        }
        const buttonStyle = {
            backgroundColor,
            borderColor,
            borderWidth,
            borderRadius: roundness,
        };
        const touchableStyle = { borderRadius: roundness };
        const textStyle = { color: textColor, fontFamily };
        return (
            <Surface
                style={[
                    styles.button,
                    buttonStyle,
                    style,
                ]}
            >
                <TouchableRipple
                    delayPressIn={0}
                    onPress={onPress}
                    accessibilityLabel={accessibilityLabel}
                    accessibilityComponentType="button"
                    disabled={disabled}
                    style={touchableStyle}
                    borderless
                >
                    <View style={[styles.content, contentStyle]}>
                        {icon ? (
                            <View style={styles.icon}>
                                <Icon source={icon} size={16} color={textColor} />
                            </View>
                        ) : null}
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.label,
                                textStyle,
                                { fontFamily },
                            ]}
                        >
                            {text}
                        </Text>
                    </View>
                </TouchableRipple>
            </Surface>
        )
    }
}


ButtonTemp.defaultProps = {
    type: 'ok',
    disabled: false,
    onPress: () => { },
    style: {},
    contentStyle: {}

}


ButtonTemp.propTypes = {
    type: PropTypes.oneOf(['ok', 'cancel', 'underline']),
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    style: PropTypes.object,
    contentStyle: PropTypes.object
}

const styles = StyleSheet.create({
    button: {
        // minWidth: 64,
        // borderStyle: 'solid',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 16,
        marginLeft: 12,
        marginRight: -4,
    },
    label: {
        textAlign: 'center',
        letterSpacing: 0.5,
        marginVertical: 12,
        marginHorizontal: 16,
    },
})

export default withTheme(ButtonTemp);
