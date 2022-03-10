import React from 'react';
import {Divider, Layout, Text, TopNavigation, TopNavigationAction} from "@ui-kitten/components";
import {BackIcon} from "../assets/constants/Icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {View} from "react-native";


export const TopBackNavigation = (props) =>{
    const navigateBack = () => {
        props.navigation.goBack();
    };

    const BackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={navigateBack}/>
    );
    const NavigationTitleText = () =>(
        <View>
            <Text style={{fontSize:20}}>{props.route.name}</Text>
        </View>
    )
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TopNavigation title={NavigationTitleText} alignment='center' accessoryLeft={BackAction}/>
            <Divider/>
        </SafeAreaView>
    );
}
