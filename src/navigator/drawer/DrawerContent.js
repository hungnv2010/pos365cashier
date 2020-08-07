import React from 'react';
import { Image, View, StyleSheet, ImageBackground, Text, TouchableOpacity } from 'react-native';
import {
    DrawerItem,
    DrawerContentScrollView,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Constant } from "../../common/Constant";
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";


const DrawerContent = props => {
    return (
        <View style={{ flex: 1 }}>
            <View>
                <Text style={{ color: "black", height: 100, backgroundColor: "yellow" }}>header</Text>
            </View>
            <DrawerContentScrollView contentContainerStyle={{ flex: 1, marginTop: -5 }}>
                <DrawerItem
                    label="Dashboard"
                    activeTintColor="red"
                    labelStyle={styles.drawerLabel}
                    style={[styles.DrawerItem,]}
                    onPress={() => {
                        console.log("Oke props ", props);
                        props.navigation.navigate('Home')
                    }}

                    icon={() =>
                        <Icon name="home" color="black" size={30} />
                    }
                />
                <DrawerItem
                    label="Messages"
                    labelStyle={styles.drawerLabel} 
                    style={styles.DrawerItem}
                    onPress={() => {
                        console.log("Oke props ", props);
                        props.navigation.navigate('Messages')
                    }}
                />
                <DrawerItem
                    label="Logout"
                    labelStyle={{}}
                    onPress={() => {
                        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                        props.navigation.navigate('Login',{param: "logout"})
                    }}
                />
            </DrawerContentScrollView>
            <View>
                <Text>Bottom</Text>
            </View>
        </View>
    );
};
export default DrawerContent;
const styles = StyleSheet.create({
    DrawerItem: { width: "100%" },
    drawerLabel: { color: "blue" }
});