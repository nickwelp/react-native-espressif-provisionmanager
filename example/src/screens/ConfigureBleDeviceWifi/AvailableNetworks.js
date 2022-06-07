import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LifecycleStageOverride } from './constants';
import styles from '../../styles';

const AvailableNetworks = ({
  dataPackage: {
    connectToDevice,
    scanWifiNetworks,
    connectionStatus,
    bleDeviceWifiState,
    processStatus,
    listOfNetworks,
    updateSelectedWifi,
    selectedWifi,
  },
} = {}) => {
  const representSignalStrength = (rssi) => {
    if (rssi > -50) return 'strong';
    if (rssi > -60) return 'good';
    if (rssi > -67) return 'fair';
    return 'weak';
  };
  const ShowWifiNetworks = () => {
    return listOfNetworks.map(({ ssid, rssi }) => {
      if (selectedWifi) {
        return (
          <Text key={ssid}>{`${ssid} -- ${
            selectedWifi === ssid ? 'X' : ''
          }`}</Text>
        );
      }
      return (
        <Text
          key={ssid}
          onPress={() => updateSelectedWifi(ssid)}
        >{`${ssid} -- ${representSignalStrength(parseInt(rssi, 10))}`}</Text>
      );
    });
  };

  return (
    <>
      <Text>Wifi Networks Detected By ESP Device</Text>
      <Text>
        {`${
          Object.keys(bleDeviceWifiState)[0]
        } is in ${connectionStatus}, process overall is in ${processStatus}`}
      </Text>
      {processStatus === LifecycleStageOverride.Ready && (
        <TouchableOpacity
          onPress={() => connectToDevice(Object.keys(bleDeviceWifiState)[0])}
        >
          <Text style={styles.button}>Connect to Device</Text>
        </TouchableOpacity>
      )}
      {processStatus === LifecycleStageOverride.Running && (
        <Text>Connecting to Device</Text>
      )}
      {processStatus === LifecycleStageOverride.Finished && (
        <>
          <Text>Connected to Device</Text>
          <TouchableOpacity
            onPress={() => scanWifiNetworks(Object.keys(bleDeviceWifiState)[0])}
          >
            <Text style={styles.button}>Scan Wifi Networks</Text>
          </TouchableOpacity>
        </>
      )}
      {processStatus === LifecycleStageOverride.ErrorConnectingToBleDevice && (
        <Text>Error connecting to BLE Device</Text>
      )}
      {processStatus === LifecycleStageOverride.ScanningForWifiNetworks && (
        <Text>Scanning for Wifi Networks</Text>
      )}
      {processStatus === LifecycleStageOverride.ScannedForWifiNetworks && (
        <View>
          <Text>Finished scanning for Wifi Networks:</Text>
          <View>
            <ShowWifiNetworks />
          </View>
        </View>
      )}
      {processStatus === LifecycleStageOverride.ErrorScanningWifiNetworks && (
        <>
          <Text>Error Scanning for Wifi Networks</Text>
          <TouchableOpacity
            onPress={() => scanWifiNetworks(Object.keys(bleDeviceWifiState)[0])}
          >
            <Text style={styles.button}>Scan Wifi Networks</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
};

export default AvailableNetworks;
