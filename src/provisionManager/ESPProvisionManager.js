import { BleManager } from 'react-native-ble-plx';
import ESPDevice from './ESPDevice';
import BleScanner from './device_scanner/bleScanner';

/**
 * App can use this class to provision device. It has APIs to scan devices,
 * scan QR code and connect with the device to get
 * object of ESPDevice. It is a singleton, summon it by
 * calling the stactic method getInstance()
 */

class ESPProvisionManager {
  _TAG = 'ESP:ESPProvisionManager';

  privateProvision = null; // is singleton private static ESPProvisionManager

  _espDevice = null;

  _bleManager = undefined;

  _bleScanner = undefined;

  _SCANTIMEOUT = 10 * 1000;

  /**
   * This method is used to get singleton instance of
   *
   * @param
   * @return Returns
   */
  static getInstance() {
    if (this.privateProvision === undefined) {
      this.privateProvision = new ESPProvisionManager();
    }
    return this.privateProvision;
  }

  constructor() {
    this._bleManager = new BleManager();
  }

  /**
   * This method is used to get ESPDevice object with given transport and security.
   *
   * @param transportType Transport type.
   * @param securityType  Security type.
   * @param iOS Bool
   * @return Returns ESPDevice.
   */
  createESPDevice(transportType, securityType, iOS = true) {
    this._espDevice = new ESPDevice(
      transportType,
      securityType,
      this._bleManager,
      iOS
    );
    return this._espDevice;
  }

  /**
   * This method is used to get ESPDevice object with given transport and security.
   *
   * @return Returns ESPDevice.
   */
  getDevice() {
    return this._espDevice;
  }

  delay(t, v) {
    return new Promise((resolve) => {
      setTimeout(resolve.bind(null, v), t);
    });
  }

  /**
   * This method is used to scan BLE devices.
   *
   * @param bleScannerListener BleScanListener for scanning callbacks.
   */
  async searchBleEspDevices(prefix) {
    // returns Promise([devices])
    console.log(this._TAG, `Search for BLE devices: ${prefix}`);
    const result = await new Promise((resolve) => {
      console.log(this._TAG, 'Search for BLE devices in Promise');
      this._bleScanner = new BleScanner(prefix, this._bleManager);
      this._bleScanner.startScan();
      resolve([]);
    }).then(() => {
      console.log(this._TAG, 'Search for BLE devices, delaying 10 seconds');
      return this.delay(this._SCANTIMEOUT).then(() => {
        console.log(this._TAG, 'Search for BLE devices, resolved');
        return this._bleScanner.stopScan();
      });
    });
    return result;
  }

  /**
   * This method is used to stop BLE scanning.
   */
  stopBleScan() {
    if (this._bleScanner !== null) {
      return this._bleScanner.stopScan();
    }
    throw new Error('Stopping Ble Scan but no scanner defined');
  }
}

export default ESPProvisionManager;
