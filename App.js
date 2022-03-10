
import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Layout, Text } from '@ui-kitten/components';
import {AppNavigator} from './src/navigation/AppNavigation'
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import {Provider} from "@ant-design/react-native";
import {NativeBaseProvider} from "native-base/src/core/NativeBaseProvider";

console.log("zzzzzzzzzzzzzwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww")
export default () => (
    <>
        {/*注册ICON*/}
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
            <Provider>
                <NativeBaseProvider>
                    <AppNavigator />
                </NativeBaseProvider>
            </Provider>
        </ApplicationProvider>
    </>
);














