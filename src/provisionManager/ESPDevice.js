import MessengeHelper from './utils/MessageHelper';
import PB_Constants from './protocols/constants_pb';
import WifiConfig from './protocols/wifi_config_pb';
import WifiConstants from './protocols/wifi_constants_pb';
import WifiScan from './protocols/wifi_scan_pb';
import BLETransport from './transport/bleTransport';
import Security1 from './security/security1';
import Security0 from './security/security0';
import Session from './session/session';

import {
  HANDLER_PROV_CONFIG,
  HANDLER_PROV_SCAN,
  SecurityType,
  TransportType,
  ProvisionFailureReason,
} from './constants';

const { TRANSPORT_BLE, TRANSPORT_SOFTAP } = TransportType;

import { Buffer } from 'buffer/';

/*
 *  ResponseListener type in js
 *  {
 *    OnSuccess: (byteData: buffer) => void,
 *    OnFailure: (e) => void
 * }
 */

/**
 * ESPDevice class to hold device information. This will give
 * facility to connect device, send data to device and
 * provision it.
 */
class ESPDevice {
  _TAG = 'ESP:ESPDevice';

  _session = null;

  _security = undefined;

  _transport = undefined;

  _bleManager = undefined;

  _wifiScanListener = undefined;

  _provisionListener = undefined;

  _transportType = undefined;

  _securityType = undefined;

  _proofOfPossession = '';

  _totalCount = NaN;

  _startIndex = NaN;

  _wifiApList = [];

  _bluetoothDevice = undefined;

  _deviceId = undefined;

  _wifiDevice = undefined;

  _primaryServiceUuid = undefined;

  _deviceName = undefined;

  constructor(transportType, securityType, bleManager, iOS = true) {
    console.log('ESPDevice constructor called');
    this._bleManager = bleManager;
    this._transportType = transportType;
    this._securityType = securityType;

    switch (this._transportType) {
      case TRANSPORT_BLE:
        this._transport = new BLETransport(this._bleManager, iOS);
        break;
      case TRANSPORT_SOFTAP:
        // transport = new SoftAPTransport();
        break;
      default:
        break;
    }
  }

  /**
   * This method is used to connect ESPDevice.
   */
  connectToDevice() {
    switch (this._transportType) {
      case TRANSPORT_BLE:
        this._transport.connect(this._deviceId);
        break;
      case TRANSPORT_SOFTAP:
        // deviceConnectionReqCount = 0;
        // connectWiFiDevice(wifiDevice.getWifiName(), wifiDevice.getPassword());
        break;
      default:
        break;
    }
  }

  /**
   * This method is used to connect ESPDevice using BLE transport.
   *
   * @param bluetoothDevice    BluetoothDevice
   * @param primaryServiceUuid Primary service UUID.
   */
  connectBLEDevice(deviceId) {
    if (this._transport instanceof BLETransport) {
      return this._transport.connect(deviceId);
    }
    throw new Error('Trying to connect device with wrong transport.');
  }

  /**
   * This method is used to connect ESPDevice using Wi-Fi transport.
   */
  connectWiFiDevice() {
    console.log(this._TAG, 'connectWifiDevice');
  }

  /**
   * This method is used to disconnect ESPDevice.
   * Note : It will disconnect only if device is connected thorough BLE transport.
   */
  disconnectDevice() {
    if (this._transport instanceof BLETransport) {
      this._transport.disconnect();
    }
    this._session = null;
  }

  /**
   * This method is used to set Proof Of Possession.
   *
   * @param pop Proof Of Possession of the device. //string
   */
  setProofOfPossession(pop) {
    this._proofOfPossession = pop;
  }

  /**
   * This method is used to get Proof Of Possession.
   *
   * @return Returns Proof Of Possession of the device.
   */
  getProofOfPossession() {
    return this._proofOfPossession;
  }

  /**
   * This method is used to set device name.
   *
   * @param deviceName Device name to be set.
   */
  setDeviceName(deviceName) {
    this._deviceName = deviceName;
  }

  /**
   * This method is used to get Proof Of Possession.
   *
   * @return Returns device name.
   */
  getDeviceName() {
    return this._deviceName;
  }

  /**
   * This method is used to get transport type.
   *
   * @return Returns transport type.
   */
  getTransportType() {
    return this._transportType;
  }

  /**
   * This method is used to get security type.
   *
   * @return Returns security type.
   */
  getSecurityType() {
    return this._securityType;
  }

  /**
   * This method is used to get Wi-Fi access point.
   *
   * @return Returns Wi-Fi access point.
   */
  getWifiDevice() {
    return this._wifiDevice;
  }

  setWifiDevice(wifiDevice) {
    this._wifiDevice = wifiDevice;
  }

  /**
   * This method is used to get BluetoothDevice object to connect with device using BLE.
   *
   * @return Returns BluetoothDevice object of the device.
   */
  getBluetoothDevice() {
    return this._bluetoothDevice;
  }

  /**
   * This method is used to set BluetoothDevice.
   *
   * @param bluetoothDevice BluetoothDevice
   */
  setBluetoothDevice(bluetoothDevice) {
    this._bluetoothDevice = bluetoothDevice;
  }

  /**
   * This method is used to get primary service UUID of the BLE device.
   *
   * @return Returns Primary service UUID of the device.
   */
  getPrimaryServiceUuid() {
    return this._primaryServiceUuid;
  }

  /**
   * This method is used to set primary service UUID.
   *
   * @param primaryServiceUuid Primary service UUID of the device. string
   */
  setPrimaryServiceUuid(primaryServiceUuid) {
    this._primaryServiceUuid = primaryServiceUuid;
  }

  /**
   * Send scan command to device to get available Wi-Fi access points.
   *
   * @param wifiScanListener WiFiScanListener to get callbacks of scanning networks.
   */
  async scanNetworks(wifiScanListener) {
    this._wifiScanListener = wifiScanListener;
    if (this._session === null || !this._session.isEstablished()) {
      await this._initSession({
        onSuccess() {
          this._startNetworkScan();
        },
        onFailure(e) {
          console.error(e);
          if (this._wifiScanListener !== null) {
            this._wifiScanListener.onWiFiScanFailed(
              new Error('Failed to create session.')
            );
          }
        },
      });
    } else {
      this._startNetworkScan();
    }
    return true;
  }

  /**
   * Send scan command to device to get available Wi-Fi access points, async
   * @returns list of wifi networks available to device; [wifiAp]
   */
  async scanNetworksAsync() {
    return new Promise((resolve, reject) => {
      this.scanNetworks({
        onWifiListReceived: (result) => {
          resolve(result);
        },
        onWiFiScanFailed: (e) => {
          reject(e);
        },
      });
    });
  }

  /**
   * Send data to custom endpoint of the device.
   *
   * @param path     Endpoint. string
   * @param data     Data to be send. Buffer/byte[] in java
   * @param listener Listener to get success and failure. listener type
   */
  async sendDataToCustomEndPoint(path, data, listener) {
    if (this._session === null || !this._session.isEstablished()) {
      await this._initSession({
        onSuccess() {
          console.log('SESSION STARTED');
        },
        onFailure() {
          throw new Error('sendDataToCustomEndPoint error in onFailure');
        },
      });
    }
    return this._sendData(path, data, listener);
  }

  async sendDataAsync(path, data) {
    return new Promise((resolve, reject) => {
      this.sendDataToCustomEndPoint(path, data, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (e) => {
          reject(e);
        },
      });
    });
  }

  /**
   * Send Wi-Fi credentials to device for provisioning.
   *
   * @param ssid              SSID of the Wi-Fi which is to be configure in device. // string
   * @param passphrase        Password of the Wi-Fi which is to be configure in device. // string
   * @param provisionListener Listener for provisioning callbacks.
   */
  async provision(ssid, passphrase, provisionListener) {
    this._provisionListener = provisionListener;
    if (this._session === null || !this._session.isEstablished()) {
      await this._initSession({
        onSuccess: () => {
          this._sendWiFiConfig(ssid, passphrase, provisionListener);
        },
        onFailure: () => {
          if (provisionListener !== null) {
            provisionListener.createSessionFailed(
              new Error('Failed to create session.')
            );
          }
        },
      });
    } else {
      this._sendWiFiConfig(ssid, passphrase, provisionListener);
    }
  }

  async _initSession(listener) {
    console.log(`${this._TAG} _initSession called`);
    if (this._securityType === SecurityType.SECURITY_0) {
      this._security = new Security0();
    } else {
      console.log(
        `${this._TAG} _initSession, Security 1, ${this._proofOfPossession}`
      );
      this._security = new Security1(this._proofOfPossession);
    }
    this._session = new Session(this._transport, this._security);
    await this._session.init(null, {
      async OnSessionEstablished() {
        listener.onSuccess();
      },
      OnSessionEstablishFailed(e) {
        listener.onFailure(e);
      },
    });
    return null;
  }

  _sendData(path, data, listener) {
    this._session.sendDataToDevice(path, data, {
      onSuccess: (returnData) => {
        if (listener !== null) {
          listener.onSuccess(returnData);
        }
      },
      onFailure: (e) => {
        if (listener !== null) {
          listener.onFailure(e);
        }
      },
    });
  }

  _startNetworkScan() {
    this._totalCount = 0;
    this._startIndex = 0;
    this._wifiApList.length = 0;
    const scanCommand = MessengeHelper.prepareWiFiScanMsg();
    this._session.sendDataToDevice(HANDLER_PROV_SCAN, scanCommand, {
      onSuccess: (returnData) => {
        console.log(`${this._TAG} startNetworkScan Success`);
        this._processStartScanResponse(returnData);
        const getScanStatusCmd = MessengeHelper.prepareGetWiFiScanStatusMsg();
        console.log(`${this._TAG} requesting Network Scan Status`);
        this._session.sendDataToDevice(HANDLER_PROV_SCAN, getScanStatusCmd, {
          onSuccess: (rData) => {
            this._processWifiStatusResponse(rData);
          },
          onFailure: (e) => {
            console.error(`${this._TAG}:startNetworkScan:sendDataToDevice`, e);
            if (this._wifiScanListener !== null) {
              this._wifiScanListener.onWiFiScanFailed(
                new Error('Failed to send Wi-Fi scan command.')
              );
            }
          },
        });
      },
      onFailure: (e) => {
        console.error(`${this._TAG}:startNetworkScan`, e);
        if (this._wifiScanListener !== null) {
          this._wifiScanListener.onWiFiScanFailed(
            new Error('Failed to send Wi-Fi scan command.')
          );
        }
      },
    });
  }

  _getFullWiFiList() {
    console.log(
      `${this._TAG}:getFullWiFiList Total count : ${
        this._totalCount
      } and start index is : ${this._startIndex}`
    );
    if (this._totalCount < 4) {
      this._getWiFiScanList(0, this._totalCount);
    } else {
      const temp = this._totalCount - this._startIndex;
      if (temp > 0) {
        if (temp > 4) {
          this._getWiFiScanList(this._startIndex, 4);
        } else {
          this._getWiFiScanList(this._startIndex, temp);
        }
      } else {
        console.log(this._TAG, 'Nothing to do. Wifi list completed.');
        this._completeWifiList();
      }
    }
  }

  _getWiFiScanList(start, count) {
    console.log(`${this._TAG}:getWiFiScanListstart`, `Getting ${count} SSIDs`);
    if (count <= 0) {
      this._completeWifiList();
      return;
    }
    const data = MessengeHelper.prepareGetWiFiScanListMsg(start, count);
    this._session.sendDataToDevice(HANDLER_PROV_SCAN, data, {
      onSuccess: (returnData) => {
        console.log(this._TAG, 'Successfully got SSID list');
        this._processGetSSIDs(returnData);
      },
      onFailure: (e) => {
        console.log(`${this._TAG}:getWiFiScanList`, e);
        if (this._wifiScanListener !== null) {
          this._wifiScanListener.onWiFiScanFailed(
            new Error('Failed to get Wi-Fi Networks.')
          );
        }
      },
    });
  }

  _completeWifiList() {
    if (this._wifiScanListener !== null) {
      this._wifiScanListener.onWifiListReceived(this._wifiApList);
      this._wifiScanListener = null;
    } else {
      throw new Error('No WiFi Scan Listener to receive list.');
    }
  }

  _sendWiFiConfig(ssid, passphrase, provisionListener) {
    this._provisionListener = provisionListener;
    const scanCommand = MessengeHelper.prepareWiFiConfigMsg(ssid, passphrase);
    this._session.sendDataToDevice(HANDLER_PROV_CONFIG, scanCommand, {
      onSuccess: (returnData) => {
        const status = this._processWifiConfigResponse(returnData);
        if (provisionListener !== null) {
          if (status !== PB_Constants.Status.SUCCESS) {
            provisionListener.wifiConfigFailed(
              new Error('Failed to send wifi credentials to device')
            );
          } else {
            provisionListener.wifiConfigSent();
          }
        }
        if (status === PB_Constants.Status.SUCCESS) {
          this._applyWiFiConfig();
        }
      },
      onFailure: (e) => {
        console.log(`${this._TAG}:sendWifiConfig`, e);
        if (provisionListener !== null) {
          provisionListener.wifiConfigFailed(
            new Error('Failed to send wifi credentials to device')
          );
        }
      },
    });
  }

  _applyWiFiConfig() {
    const scanCommand = MessengeHelper.prepareApplyWiFiConfigMsg();
    this._session.sendDataToDevice(HANDLER_PROV_CONFIG, scanCommand, {
      onSuccess: (returnData) => {
        const status = this._processApplyConfigResponse(returnData);
        if (status === PB_Constants.Status.SUCCESS) {
          if (this._provisionListener !== null) {
            this._provisionListener.wifiConfigApplied();
          }
          setTimeout(() => {
            this._pollForWifiConnectionStatus();
          }, 2000);
        } else if (this._provisionListener !== null) {
          this._provisionListener.wifiConfigApplyFailed(
            new Error('Failed to apply wifi credentials')
          );
        }
      },
      onFailure: (e) => {
        console.error(this._TAG, e);
        if (this._provisionListener !== null) {
          this._provisionListener.wifiConfigApplyFailed(
            new Error('Failed to apply wifi credentials')
          );
        }
      },
    });
  }

  _pollForWifiConnectionStatus() {
    const message = MessengeHelper.prepareGetWiFiConfigStatusMsg();
    this._session.sendDataToDevice(HANDLER_PROV_CONFIG, message, {
      onSuccess: (returnData) => {
        const statuses = this._processProvisioningStatusResponse(returnData);
        const [wifiStationState, failedReason] = statuses;
        if (wifiStationState === WifiConstants.WifiStationState.CONNECTED) {
          // Provision success
          if (this._provisionListener !== null) {
            this._provisionListener.deviceProvisioningSuccess();
          }
          this._session = null;
        } else if (
          wifiStationState === WifiConstants.WifiStationState.DISCONNECTED
        ) {
          // Device disconnected but Provision may got success / failure
          if (this._provisionListener !== null) {
            this._provisionListener.provisioningFailedFromDevice(
              ProvisionFailureReason.DEVICE_DISCONNECTED
            );
          }
          this._session = null;
        } else if (
          wifiStationState === WifiConstants.WifiStationState.CONNECTING
        ) {
          try {
            setTimeout(() => {
              this._pollForWifiConnectionStatus();
            }, 5000);
          } catch (e) {
            console.error(e);
            this._session = null;
            this._provisionListener.onProvisioningFailed(
              new Error('Provisioning Failed')
            );
          }
        } else {
          if (
            failedReason === WifiConstants.WifiConnectFailedReason.AUTHERROR
          ) {
            this._provisionListener.provisioningFailedFromDevice(
              ProvisionFailureReason.AUTH_FAILED
            );
          } else if (
            failedReason ===
            WifiConstants.WifiConnectFailedReason.NETWORKNOTFOUND
          ) {
            this._provisionListener.provisioningFailedFromDevice(
              ProvisionFailureReason.NETWORK_NOT_FOUND
            );
          } else {
            this._provisionListener.provisioningFailedFromDevice(
              ProvisionFailureReason.UNKNOWN
            );
          }
          this._session = null;
        }
      },
      onFailure: (e) => {
        console.log(`${this._TAG}:pollForWifiConnectionStatus`, e);
        this._provisionListener.onProvisioningFailed(
          new Error('Provisioning Failed')
        );
      },
    });
  }

  _processStartScanResponse(responseData) {
    // make sure no errors in response
    console.log(`${this._TAG} Process Wi-Fi start scan command response`);
    try {
      const payload = WifiScan.WiFiScanPayload.deserializeBinary(responseData);
      console.log(
        `${this._TAG} Process Wi-Fi start scan comman`,
        payload.toObject()
      );
    } catch (e) {
      if (this._wifiScanListener !== null) {
        this._wifiScanListener.onWiFiScanFailed(e);
      }
    }
  }

  _processWifiStatusResponse(responseData) {
    console.log(`${this._TAG} Process Wi-Fi scan status command response`);
    try {
      const payload = WifiScan.WiFiScanPayload.deserializeBinary(responseData);
      const response = payload.getRespScanStatus();
      const scanFinished = response.getScanFinished();

      if (scanFinished) {
        this._totalCount = response.getResultCount();
        this._getFullWiFiList();
      } else if (this._wifiScanListener !== null) {
        this._wifiScanListener.onWiFiScanFailed(
          new Error('Error Processing WiFi Status Response')
        );
      } else {
        throw new Error('Error Processing WiFi Status Response');
      }
    } catch (e) {
      if (this._wifiScanListener != null) {
        this._wifiScanListener.onWiFiScanFailed(
          new Error('Failed to get Wi-Fi status.')
        );
      } else {
        throw new Error('Failed to get Wi-Fi status.');
      }
    }
  }

  _processGetSSIDs(responseData) {
    try {
      const payload = WifiScan.WiFiScanPayload.deserializeBinary(responseData);
      const response = payload.getRespScanResult();
      const entries = response.getEntriesList();

      console.log(
        `${this._TAG}  Wifi Scan Response count :  ${entries.length}`
      );
      for (let i = 0; i < entries.length; i++) {
        console.log(
          `${this._TAG}  SSID:  ${Buffer.from(
            entries[i].getSsid_asU8()
          ).toString('utf-8')}`
        );
        const ssid = entries[i].getSsid_asU8();
        const rssi = entries[i].getRssi();
        let isAvailable = false;

        this._wifiApList
          .filter(
            ({ ssid: wAssid }) => Buffer.from(ssid).toString('utf8') === wAssid
          )
          .forEach((wifiAp) => {
            isAvailable = true;
            if (wifiAp.rssi < rssi) {
              wifiAp.rssi = rssi;
            }
          });

        if (!isAvailable) {
          const wifiAp = {
            ssid: Buffer.from(ssid).toString('utf8'),
            rssi: entries[i].getRssi(),
            security: entries[i].getAuth(),
          };
          this._wifiApList.push(wifiAp);
        }
        console.log(
          `${this._TAG} Size of WiFi list: ${this._wifiApList.length}`
        );
      }

      this._startIndex += 4;
      if (this._totalCount - this._startIndex > 0) {
        this._getFullWiFiList();
      } else {
        console.log(`${this._TAG} Wi-Fi list gathering completed`);
        this._completeWifiList();
      }
    } catch (e) {
      throw new Error(e.message ? e.message : 'Error processing getSSIDs');
    }
  }

  // private Constants.Status
  _processWifiConfigResponse(responseData) {
    let status = PB_Constants.Status.INVALIDSESSION;
    try {
      const wiFiConfigPayload =
        WifiConfig.WiFiConfigPayload.deserializeBinary(responseData);
      status = wiFiConfigPayload.getRespSetConfig().getStatus();
    } catch (e) {
      console.error(`${this._TAG}:processWifiConfigResponse`, e);
    }
    return status;
  }

  // private Constants.Status
  _processApplyConfigResponse(responseData) {
    let status = PB_Constants.Status.INVALIDSESSION;
    try {
      const wiFiConfigPayload =
        WifiConfig.WiFiConfigPayload.deserializeBinary(responseData);
      status = wiFiConfigPayload.getRespApplyConfig().getStatus();
    } catch (e) {
      console.error(`${this._TAG}:processApplyConfigResponse`, e);
    }
    return status;
  }

  _processProvisioningStatusResponse(responseData) {
    let wifiStationState = WifiConstants.WifiStationState.DISCONNECTED;
    let failedReason = WifiConstants.WifiConnectFailedReason.UNRECOGNIZED;

    if (responseData === null) {
      return { wifiStationState, failedReason };
    }

    try {
      const wiFiConfigPayload =
        WifiConfig.WiFiConfigPayload.deserializeBinary(responseData);
      wifiStationState = wiFiConfigPayload.getRespGetStatus().getStaState();
      failedReason = wiFiConfigPayload.getRespGetStatus().getFailReason();
    } catch (e) {
      throw new Error(`${this._TAG} processProvisioningStatusResponse`, e);
    }
    return { wifiStationState, failedReason };
  }
}

export default ESPDevice;
