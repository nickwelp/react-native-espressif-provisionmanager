import { LifecycleStage } from '../../Constants';

const LifecycleStageOverride = {
  ...LifecycleStage,
  ConnectingToBleDevice: 'ConnectingToBleDevice',
  ConnectedToBleDevice: 'ConnectedToBleDevice',
  ScanningForWifiNetworks: 'ScanningForWifiNetworks',
  ScannedForWifiNetworks: 'ScannedForWifiNetworks',
  SettingWifiPassword: 'SettingWifiPassword',
  ErrorCreateSessionFailed: 'ErrorCreateSessionFailed',
  ErrorConnectingToBleDevice: 'ErrorConnectingToBleDevice',
  ErrorScanningWifiNetworks: 'ErrorScanningWifiNetworks',
  ErrorSettingWifiPassword: 'ErrorSettingWifiPassword',
  ErrorProvisionFailedOnDevice: 'ErrorProvisionFailedOnDevice',
};

const bleDeviceWifiStateActions = {
  ConnectToBleDevice: 'ConnectToBleDevice',
  ConnectedToBleDevice: 'ConnectedToBleDevice',
  ErrorConnectingToBleDevice: 'ErrorConnectingToBleDevice',
  ScanningForWifi: 'ScanningForWifi',
  ScannedForWifi: 'ScannedForWifi',
  SettingWifiProvisioning: 'SettingWifiProvisioning',
  ErrorScanningForWifi: 'ErrorScanningForWifi',
  SetPassword: 'SetPassword',
  ProvisioningFailedOnDevice: 'ProvisioningFailedOnDevice',
  ErrorSettingWifiPassword: 'ErrorSettingWifiPassword',
  ErrorSendingWifiPassword: 'ErrorSendingWifiPassword',
  Finished: 'Finished',
  ConfigApplied: 'ConfigApplied',
};

export { LifecycleStageOverride, bleDeviceWifiStateActions };
