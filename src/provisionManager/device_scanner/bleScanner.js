/**
 * This class is used for BLE scan functionality.
 */
class BleScanner {
  _TAG = 'ESP:BleScanner';

  _prefix = '';

  _bleManager = undefined;

  _devices = [];

  constructor(prefix, bleManager) {
    this._prefix = prefix;
    this._bleManager = bleManager;
  }

  startScan() {
    console.log(`${this._TAG} startScan initiaited`);
    this._bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        throw new Error(
          `${this._TAG} startDeviceScan ${
            error.message ? error.message : 'Scan failed'
          }`
        );
      }

      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (
        device &&
        device.name &&
        typeof device.name === 'string' &&
        device.name.includes(this._prefix)
      ) {
        console.log(`${this._TAG} startScan device found`);
        if (!this._devices.map(({ name }) => name).includes(device.name)) {
          this._devices.push(device);
          console.log(`${this._TAG} device found ${device.name}`);
        }
      }
    });
  }

  stopScan() {
    this._bleManager.stopDeviceScan();
    return this._devices;
  }
}

export default BleScanner;
