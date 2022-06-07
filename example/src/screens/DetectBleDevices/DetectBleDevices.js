import React, { useContext, useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

import AppContext from '../../Context';
import { BLE_PREFIX, LifecycleStage } from '../../Constants';
import Page from '../../components/Page';
import styles from '../../styles';

const DetectBleDevices = ({ navigation }) => {
  const [devices, setDevices] = useState(false);
  const [scanStatus, setScanStatus] = useState(LifecycleStage.Ready);
  const [selectedBleDeviceName, setSelectedHub] = useState('');
  const [selectedBleServiceUuid, setUuid] = useState('');
  const { provManager } = useContext(AppContext);

  const activateScan = async () => {
    setScanStatus(LifecycleStage.Running);
    const devicesSwap = await provManager.searchBleEspDevices(BLE_PREFIX);
    setDevices(devicesSwap);
    setScanStatus(LifecycleStage.Finished);
  };

  const RepresentScannedDevices = () => {
    if (!devices || !devices.length) return null;
    return devices.map((device) => {
      const { id, name } = device;
      return (
        <View key={id}>
          <TouchableOpacity
            onPress={() => {
              setSelectedHub(name);
              setUuid(id);
            }}
          >
            <Text style={styles.bleDevice}>
              {name}
              {selectedBleDeviceName === name && <Text>X</Text>}
            </Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <Page navigation={navigation}>
      <View>
        <Text style={styles.screenH1}>Find BLE Devices.</Text>
        {scanStatus !== LifecycleStage.Finished && (
          <>
            <Text style={styles.paragraph}>
              Stand within 20 feet of the BLE device.{'\n'}
            </Text>
            {scanStatus === LifecycleStage.Running && (
              <Text>Scanning for BLE Devices</Text>
            )}
            {scanStatus === LifecycleStage.Ready && <Text>Unscanned</Text>}
            {devices && !devices.length && <Text>No Devices Found</Text>}
            <Text>
              {'\n'}
              {'\n'}
              {'\n'}
              {'\n'}
            </Text>
            {scanStatus !== LifecycleStage.Running && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => activateScan()}>
                  <Text style={styles.mainButton}>CONTINUE</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        {scanStatus === LifecycleStage.Finished && (
          <View>
            <Text style={styles.paragraph}>
              Here is a list of nearby BLE devices:{'\n'}
              {'\n'}
              {'\n'}
              {'\n'}
            </Text>
            <>{devices && RepresentScannedDevices()}</>
            <Text>
              {'\n'}
              {'\n'}
              {'\n'}
              {'\n'}
              {'\n'}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ConfigureBleDeviceWifi', {
                    serviceUuid: selectedBleServiceUuid,
                    deviceName: selectedBleDeviceName,
                  });
                }}
              >
                <Text style={styles.mainButton}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Page>
  );
};

export default DetectBleDevices;
