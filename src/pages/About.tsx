import { Divider, Layout, Text, TopNavigation, TopNavigationAction } from '@ui-kitten/components';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {BackIcon} from "../assets/constants/Icons";
import {Box, Link} from "native-base";

export const AboutScreen = ({ navigation }) => {
    const navigateBack = () => {
        navigation.goBack();
    };

    const BackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={navigateBack}/>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/*<TopNavigation title='Story' alignment='center' accessoryLeft={BackAction}/>*/}
            <Divider/>
            <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Box alignItems="center">
                    <Link href="https://github.com/1723389557/Xray4MagiskManager">
                        <Text category='h3'>APP开源是开源的，点我进入</Text>
                    </Link>
                </Box>
            </Layout>
        </SafeAreaView>
    );
};
