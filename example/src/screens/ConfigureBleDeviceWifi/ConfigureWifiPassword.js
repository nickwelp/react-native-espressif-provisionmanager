import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LifecycleStageOverride } from './constants';

const ConfigureWifiPassword = ({
  dataPackage: {
    updateWifiPassword,
    assignWifiPasswordToBleDevice,
    processStatus,
  } = {},
}) => {
  if (
    processStatus.includes('Error') ||
    processStatus === LifecycleStageOverride.Ready
  ) {
    return (
      <>
        <Text>{processStatus}</Text>
        <TextInput
          placeholder="Password"
          placeholderTextColor="rgba(44,44,44,0.4)"
          secureTextEntry
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(text) => updateWifiPassword(text.trim())}
        />
        <View>
          <TouchableOpacity onPress={() => assignWifiPasswordToBleDevice()}>
            <Text>CONTIUNE</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
  if (processStatus === LifecycleStageOverride.Finished) {
    return (
      <View>
        <Text>Wifi Password is Set</Text>
      </View>
    );
  }
  return (
    <View>
      <Text>{processStatus}</Text>
    </View>
  );
};

export default ConfigureWifiPassword;
