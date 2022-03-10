import {
    Avatar,
    Drawer,
    DrawerItem, Icon,
    IndexPath,
    Layout,
    StyleService,
    Text,
    useStyleSheet,
} from '@ui-kitten/components';


import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../pages/home/home'
const { Navigator, Screen } = createDrawerNavigator();

const DrawerContent = ({ navigation, state }) => {
    const styles = useStyleSheet(themedStyles);

    const Header = () => (
        <Layout style={styles.header}>
            <View style={styles.profileContainer}>
                <Text style={styles.profileName} category="h6">
                    Rocktech
                </Text>
            </View>
        </Layout>
    );
    const HomeIcon = (style) => <Icon {...style} name="home" />;

    return (
        <SafeAreaView>
            <Drawer
                header={Header}
                selectedIndex={new IndexPath(state.index)}
                onSelect={(index) => {navigation.navigate(state.routeNames[index.row]);
                    console.log(index)}}>
                <DrawerItem title='Home' accessoryLeft={HomeIcon}/>
                <DrawerItem title='About' accessoryLeft={HomeIcon}/>
            </Drawer>
        </SafeAreaView>
    )
};
const Test = () => {
    return(
        <Text>2222222222</Text>
    )
}
const Test2 = () => {
    return(
        <Text>111111111</Text>
    )
}
export const HomeDrawerNavigator = () => (
    <Navigator drawerContent={props => <DrawerContent {...props}/>}>
        <Screen name='Home' component={Test}/>
        <Screen name='About' component={HomeScreen}/>
        {/*<Screen name='Login' component={LoginScreen}/>*/}
        {/*<Screen name='Register' component={RegisterScreen}/>*/}


    </Navigator>
);

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
