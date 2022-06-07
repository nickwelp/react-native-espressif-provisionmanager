import { Buffer } from 'buffer/';

/**
 * BLETransport Class
 */
class BLETransport {
  _TAG = 'Espressif::BLETransport';

  _bleManager = undefined;

  _currentDevice = null;

  _deviceServices = undefined;

  _descriptorUuidMap = new Map();

  _iOS = undefined;

  async connect(deviceId) {
    try {
      console.log(`connecting to device.... ${deviceId}`);
      this._currentDevice = await this._bleManager.connectToDevice(deviceId);
      this._currentDevice =
        await this._currentDevice.discoverAllServicesAndCharacteristics();
      if (!this._iOS) {
        this._currentDevice = await this._bleManager.requestMTUForDevice(
          deviceId,
          517
        );
      }
      await this._getDescriptors();
      return this._currentDevice;
    } catch (e) {
      throw new Error(`Unable to connect: ${e.message}`);
    }
  }

  async disconnect() {
    if (this._currentDevice != null) {
      await this._bleManager.cancelDeviceConnection(this._currentDevice.id);
      this._currentDevice = null;
    }
  }

  constructor(bleManager, iOS = true) {
    this._iOS = iOS;
    this._bleManager = bleManager;
  }

  async _getDescriptors() {
    if (this._deviceServices === undefined) {
      this._deviceServices = await this._bleManager.servicesForDevice(
        this._currentDevice.id
      );
    }
    const [service] = this._deviceServices;
    const characteristics = await service.characteristics();
    characteristics.forEach(async (characteristic) => {
      const descriptor = await this._bleManager.descriptorsForDevice(
        this._currentDevice.id,
        service.uuid,
        characteristic.uuid
      );
      this._descriptorUuidMap.set(
        Buffer.from(descriptor, 'base64').toString('utf-8'),
        characteristic.uuid
      );
    });
  }

  async sendData(path, data) {
    if (this._descriptorUuidMap.has(path)) {
      const characteristicUUID = this._descriptorUuidMap
        .get(path)
        .toLowerCase();
      if (this._deviceServices === undefined) {
        this._deviceServices = await this._bleManager.servicesForDevice(
          this._currentDevice.id
        );
      }
      const [service] = this._deviceServices;
      const characteristics = await service.characteristics();
      const [characteristic] = characteristics.filter(
        ({ uuid }) => uuid === characteristicUUID.toLowerCase()
      ) || [null];
      if (characteristic !== null) {
        const writeToChar = Buffer.from(data).toString('base64');
        try {
          const writenCharacteristic =
            await this._bleManager.writeCharacteristicWithResponseForDevice(
              this._currentDevice.id,
              service.uuid,
              characteristic.uuid,
              writeToChar
            );
          if (writenCharacteristic.isReadable) {
            const nextCharacteristicCycle =
              await this._bleManager.readCharacteristicForDevice(
                this._currentDevice.id,
                service.uuid,
                characteristic.uuid
              );
            if (nextCharacteristicCycle.isReadable) {
              return Buffer.from(nextCharacteristicCycle.value, 'base64');
            }
            throw new Error(
              `${this._TAG} reading characteristic was unreadable`
            );
          }
          throw new Error(`${this._TAG} writing characteristic was unreadable`);
        } catch (e) {
          throw new Error(
            `${this._TAG} freshCharacteristic Error, ${e.reason}`
          );
        }
      } else {
        throw new Error(
          `${this._TAG} Characteristic in UUID map not found on device`
        );
      }
    }
    throw new Error(
      'Send Data failed; Characteristic is not available for given path. This path not found in uuid map.'
    );
  }
}

export default BLETransport;
