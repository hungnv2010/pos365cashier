import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';


interface ButtonTempProps {

    /**
     * @description
     * Sử dụng kiểu cho từng nút
     * ok: Nút Đồng Ý
     * cancel : Nút Huỷ
     * underline : "Dành cho nút gạch dứoi"
     * @example
     * type={"ok"}
     */

    type?: 'ok' | 'cancel' | 'underline';

    /**
     * @description
     * Background màu cho nút 
     */

    color?: string;

    /**
     * Style cho content trong nút
     */
    contentStyle?: StyleProp<ViewStyle>;

    /**
     * Style toàn bộ view của nút
     */
    style?: StyleProp<ViewStyle>;


    /**
     * @description
     * Tắt nút hoặc không
     */
    disable?: boolean,

    /**
     * @description
     * Nhập title cho nút 
     */
    text?: String,


    /**
     * @description
     * Thêm icon cho nút
     */
    icon?: String

    /**
     * @description
     * Sự kiện click
     */
    onPress?: Function


}
export default class ButtonTemp extends React.Component<ButtonTempProps>{ }
