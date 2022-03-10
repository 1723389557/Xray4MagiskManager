import {
    Drawer,
    DrawerItem,
    IndexPath,
    Layout,
    StyleService,
    Text,
    useStyleSheet,
} from '@ui-kitten/components';


import React, {useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../pages/home/home'
import {HOME_DRAWER_TITLE1, HOME_DRAWER_TITLE2, HOME_DRAWER_TOP_TITLE} from "../assets/constants/Title";
import {HomeIcon, InfoIcon} from "../assets/Icons";
import {HOME_DRAWER_ABOUT_SCREEN_NAME, HOME_DRAWER_HOME_SCREEN_NAME} from "../assets/constants/navigator";
import {AboutScreen} from "../pages/About";
import {TopBackNavigation} from "../components/TopBackNavigation";
const { Navigator, Screen } = createDrawerNavigator();

const DrawerContent = ({ navigation, state }) => {
    const styles = useStyleSheet(themedStyles);

    const Header = () => (
        <Layout style={styles.header}>
            <View style={styles.profileContainer}>
                <Text style={styles.profileName} category="h6">
                 {HOME_DRAWER_TOP_TITLE}
                </Text>
            </View>
        </Layout>
    );

    return (
        <SafeAreaView>
            <Drawer
                header={Header}
                selectedIndex={new IndexPath(state.index)}
                onSelect={(index) => {
                    navigation.navigate(state.routeNames[index.row]);
                }}
            >
                <DrawerItem title={HOME_DRAWER_TITLE1} accessoryLeft={HomeIcon}/>
                <DrawerItem title={HOME_DRAWER_TITLE2} accessoryLeft={InfoIcon}/>
            </Drawer>
        </SafeAreaView>
    )
};



export const HomeDrawerNavigator = () => {

    return(
        <Navigator drawerContent={props => <DrawerContent {...props}/>} >
            <Screen
                name={HOME_DRAWER_HOME_SCREEN_NAME}
                component={HomeScreen}
                options={{headerShown: false}}
            />
            <Screen
                name={HOME_DRAWER_ABOUT_SCREEN_NAME}
                component={AboutScreen}
                options={{header: props1=><TopBackNavigation navigation={props1.navigation} options={props1.options} route={props1.route}/>}}
            />


        </Navigator>

    )
}

const themedStyles = StyleService.create({
    header: {
        height: 128,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileName: {
        marginHorizontal: 16,
    },

    icon: {
        width: 22,
        height: 22,
        marginRight: 8,
    },
});
