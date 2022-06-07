import React, { useState } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProvisionManager from 'react-native-espressif-provisionmanager';
import AppContext from './Context';
import { DetectBleDevice, ConfigureBleDeviceWifi } from './screens';

const Stack = createStackNavigator();

const App = () => {
  const [provManager, setProvManager] = useState(undefined);
  if (!provManager) {
    setProvManager(ProvisionManager.getInstance());
  }

  const header = (title) => {
    return {
      headerShown: false,
      title,
    };
  };

  return (
    <AppContext.Provider value={{ provManager }}>
      <Text>Welcome</Text>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="SetUpBleDevice"
            screenOptions={{ ...TransitionPresets.SlideFromRightIOS }}
          >
            <Stack.Screen
              name="DetectBleDevice"
              component={DetectBleDevice}
              options={header('DetectBleDevice')}
            />
            <Stack.Screen
              name="ConfigureBleDeviceWifi"
              component={ConfigureBleDeviceWifi}
              options={header('ConfigureBleDeviceWifi')}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
};

export default App;
