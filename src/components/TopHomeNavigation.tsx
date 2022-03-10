import React from 'react';
import {Divider, Text, TopNavigation, TopNavigationAction} from "@ui-kitten/components";
import { MenuIcon} from "../assets/Icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {View} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import {AddOverflowMenu} from '../pages/home/AddOverflowMenu';
import {HOME_DRAWER_HOME_SCREEN_NAME} from "../assets/constants/navigator";


export const TopHomeNavigation = (props) =>{
    const navigation = useNavigation();
    const renderDrawerAction = () => (
        <TopNavigationAction
            icon={MenuIcon}

            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
    );
    const NavigationTitleText = () =>(
        <View>
            <Text style={{fontSize:20}}>{HOME_DRAWER_HOME_SCREEN_NAME}</Text>
        </View>
    )

    const rightMenuAction = () => (
        <AddOverflowMenu reloadRadioGroup={props.reloadRadioGroup.bind(this)}/>
    )

    return (
        <SafeAreaView style={{width:'100%'}}>
            <TopNavigation
                title={NavigationTitleText}
                alignment="center"
                accessoryLeft={renderDrawerAction}
                accessoryRight={rightMenuAction}
            />
            <Divider/>
        </SafeAreaView>
    );
}
