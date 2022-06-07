import { bleDeviceWifiStateActions, LifecycleStageOverride } from './constants';

// BLE Device's Wifi State,
// an object with all the BLE Devices as keys, status as value
// {
//   device_ssid: LifecycleStageOverride.Ready // etc
// }
const bleDeviceWifiStateReducer = (state, action) => {
  switch (action.type) {
    case bleDeviceWifiStateActions.ConnectToBleDevice: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ConnectingToBleDevice,
      };
    }
    case bleDeviceWifiStateActions.ConnectedToBleDevice: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ConnectedToBleDevice,
      };
    }
    case bleDeviceWifiStateActions.ErrorConnectingToBleDevice: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ErrorConnectingToBleDevice,
      };
    }
    case bleDeviceWifiStateActions.ScanningForWifi: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ScanningForWifiNetworks,
      };
    }
    case bleDeviceWifiStateActions.ProvisioningFailedOnDevice: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ErrorProvisionFailedOnDevice,
      };
    }
    case bleDeviceWifiStateActions.ScannedForWifi: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ScannedForWifiNetworks,
      };
    }
    case bleDeviceWifiStateActions.ErrorScanningForWifi: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ErrorScanningWifiNetworks,
      };
    }
    case bleDeviceWifiStateActions.Provivision: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.SettingWifiPassword,
      };
    }
    case bleDeviceWifiStateActions.ErrorSettingWifiPassword: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.ErrorSettingWifiPassword,
      };
    }
    case bleDeviceWifiStateActions.ConfigApplied: {
      return {
        ...state,
        [action.payload]: LifecycleStageOverride.Finished,
      };
    }
    default:
      return state;
  }
};

// listOfNetworks State:
// [{
//   ssid,
//   rssi,
//   password,
//   security
// }]
const listOfNetworksReducer = (state, action) => {
  switch (action.type) {
    case 'new-scan':
      return action.payload;
    case 'clear-list':
      return [];
    default:
      return state;
  }
};

export { bleDeviceWifiStateReducer, listOfNetworksReducer };
