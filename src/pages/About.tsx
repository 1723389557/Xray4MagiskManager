import { Divider, Layout, Text } from '@ui-kitten/components';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Box, Link} from "native-base";

export const AboutScreen = ({ navigation }) => {

    return (
        <SafeAreaView style={{ flex: 1 }}>
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
