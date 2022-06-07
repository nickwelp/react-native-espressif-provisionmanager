import React, { useContext, useReducer, useState } from 'react';
import { View } from 'react-native';

import Page from '../../components/Page';
import AppContext from '../../Context';
import { LifecycleStageOverride, bleDeviceWifiStateActions } from './constants';
import { listOfNetworksReducer, bleDeviceWifiStateReducer } from './reducers';
import AvailableNetworks from './AvailableNetworks';
import ConfigureWifiPassword from './ConfigureWifiPassword';
import { PROOF_OF_POSESSION } from '../../Constants';
import {
  TransportType,
  SecurityType,
} from 'react-native-espressif-provisionmanager';

const ConfigureLocationWifi = ({
  navigation,
  route: { params: { serviceUuid, deviceName } } = {},
}) => {
  const { provManager } = useContext(AppContext);
  // this is status of our mobile device connecting to an ESP device
  const [processStatus, updateProcessStatus] = useState(
    LifecycleStageOverride.ProofSet
  );
  const [selectedWifi, updateSelectedWifi] = useState('');
  const [wifiPassword, updateWifiPassword] = useState('');
  // this is the status of a BLE device we are connected to
  const [bleDeviceConnectionStatus, updateBleDeviceConnectionStatus] = useState(
    LifecycleStageOverride.Ready
  );
  const [messageFromProvisioner, setMessageFromProvisioner] = useState('');
  const [listOfNetworks, listOfNetworksDispatch] = useReducer(
    listOfNetworksReducer,
    []
  );
  const [bleDeviceWifiState, bleDeviceWifiStateDispatch] = useReducer(
    bleDeviceWifiStateReducer,
    { deviceName: LifecycleStageOverride.Ready }
  );

  const connectToDevice = async () => {
    updateBleDeviceConnectionStatus(LifecycleStageOverride.Running);
    provManager.createESPDevice(
      TransportType.TRANSPORT_BLE,
      SecurityType.SECURITY_1
    );
    await provManager.getDevice().connectBLEDevice(serviceUuid);
    provManager.getDevice().setProofOfPossession(PROOF_OF_POSESSION);
    updateBleDeviceConnectionStatus(LifecycleStageOverride.Finished);
  };

  const connectionStatus =
    Object.keys(bleDeviceWifiState).length <= 1
      ? bleDeviceWifiState[Object.keys(bleDeviceWifiState)[0]]
      : bleDeviceWifiState[Object.keys(bleDeviceWifiState)[0]];

  const scanWifiNetworks = async (bleDeviceId) => {
    updateProcessStatus(LifecycleStageOverride.ScanningForWifiNetworks);
    bleDeviceWifiStateDispatch({
      type: bleDeviceWifiStateActions.ScanningForWifi,
      payload: bleDeviceId,
    });
    try {
      const wifiList = await provManager.getDevice().scanNetworksAsync();
      updateProcessStatus(LifecycleStageOverride.ScannedForWifiNetworks);
      bleDeviceWifiStateDispatch({
        type: bleDeviceWifiStateActions.ScannedForWifi,
        payload: bleDeviceId,
      });
      listOfNetworksDispatch({ type: 'new-scan', payload: wifiList });
    } catch (e) {
      bleDeviceWifiStateDispatch({
        type: bleDeviceWifiStateActions.ErrorScanningForWifi,
        payload: bleDeviceId,
      });
      updateProcessStatus(LifecycleStageOverride.ErrorScanningWifiNetworks);
      throw new Error(e);
    }
  };
  const assignWifiPasswordToBleDevice = () => {
    provManager.getDevice().provision(selectedWifi, wifiPassword, {
      // wifiConfigSent: () =>
      //   bleDeviceWifiStateDispatch({
      //     type: bleDeviceWifiStateActions.SettingWifiProvisioning,
      //     payload: selectedWifi,
      //   }),
      // wifiConfigFailed: () =>
      //   bleDeviceWifiStateDispatch({
      //     type: bleDeviceWifiStateActions.ErrorSendingWifiPassword,
      //     payload: selectedWifi,
      //   }),
      // wifiConfigApplied: () =>
      //   bleDeviceWifiStateDispatch({
      //     type: bleDeviceWifiStateActions.Finished,
      //     payload: selectedWifi,
      //   }),
      // wifiConfigApplyFailed: () =>
      //   bleDeviceWifiStateDispatch({
      //     type: bleDeviceWifiStateActions.ErrorSettingWifiPassword,
      //     payload: selectedWifi,
      //   }),

      wifiConfigSent: () => {
        console.log(`wifi config sent to ${deviceName}`);
        setMessageFromProvisioner(`WiFi information sent to ${deviceName}`);
        return bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.SettingWifiProvisioning,
          payload: deviceName,
        });
      },
      wifiConfigFailed: (message) => {
        console.log('wifi config failed,', message);
        setMessageFromProvisioner(
          `WiFi setting failed for ${deviceName}, ${message}`
        );
        return bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.ErrorSendingWifiPassword,
          payload: deviceName,
        });
      },
      wifiConfigApplied: () => {
        console.log(`Wifi config applied to ${deviceName}`);
        setMessageFromProvisioner(`WiFi config applied to ${deviceName}`);
        bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.ConfigApplied,
          payload: deviceName,
        });
      },
      wifiConfigApplyFailed: (message) => {
        console.log('wifi config apply failed', message);
        setMessageFromProvisioner(`wifi config apply failed, ${message}`);
        return bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.ErrorSettingWifiPassword,
          payload: deviceName,
        });
      },
      createSessionFailed: () => {
        console.log('create session failed');
        setMessageFromProvisioner('create session failed');
        updateProcessStatus(LifecycleStageOverride.ErrorCreateSessionFailed);
      },
      deviceProvisioningSuccess: () => {
        console.log('device provisioning success');
        setMessageFromProvisioner('device provisioning success');
        bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.Finished,
          payload: deviceName,
        });
      },
      provisioningFailedFromDevice: (message) => {
        console.log('provisioning failed from device', message);
        setMessageFromProvisioner(
          `provisioning failed from device, ${message}`
        );
        bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.ProvisioningFailedOnDevice,
          payload: deviceName,
        });
      },
      onProvisioningFailed: (message) => {
        setMessageFromProvisioner(`'provisioning failed, ${message}`);
        console.log('provisioning failed.', message);
        bleDeviceWifiStateDispatch({
          type: bleDeviceWifiStateActions.ProvisioningFailedOnDevice,
          payload: deviceName,
        });
      },
    });
    updateProcessStatus(LifecycleStageOverride.Finished);
  };

  if (bleDeviceConnectionStatus === LifecycleStageOverride.Ready) {
    connectToDevice();
  }

  const dataPackage = {
    scanWifiNetworks,
    connectionStatus,
    bleDeviceWifiState,
    bleDeviceWifiStateDispatch,
    processStatus,
    updateProcessStatus,
    listOfNetworks,
    listOfNetworksDispatch,
    messageFromProvisioner,
    updateSelectedWifi,
    selectedWifi,
    updateWifiPassword,
    wifiPassword,
    assignWifiPasswordToBleDevice,
  };

  return (
    <Page navigation={navigation}>
      <View>
        {selectedWifi.length === 0 && (
          <AvailableNetworks dataPackage={dataPackage} />
        )}
        {selectedWifi.length > 0 && (
          <ConfigureWifiPassword dataPackage={dataPackage} />
        )}
      </View>
    </Page>
  );
};

export default ConfigureLocationWifi;
