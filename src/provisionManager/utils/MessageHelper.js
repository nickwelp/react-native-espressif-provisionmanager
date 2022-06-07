const WifiScan = require('../protocols/wifi_scan_pb');
const WifiConfig = require('../protocols/wifi_config_pb');
const Buffer = require('buffer/').Buffer;

class MessengeHelper {
  /**
   * Generate Send Wi-Fi Scan command
   * @returns Buffer of protobuf message
   */
  static prepareWiFiScanMsg() {
    const configRequest = new WifiScan.CmdScanStart();
    configRequest.setBlocking(true);
    configRequest.setPassive(false);
    configRequest.setGroupChannels(0);
    configRequest.setPeriodMs(120);
    const msgType = WifiScan.WiFiScanMsgType.TYPECMDSCANSTART;
    const payload = new WifiScan.WiFiScanPayload();
    payload.setMsg(msgType);
    payload.setCmdScanStart(configRequest);
    return Buffer.from(payload.serializeBinary());
  }

  /**
   * Get the status of the ongoing scan for wifi from the BLE connected device
   * @returns Buffer of protobuf message
   */
  static prepareGetWiFiScanStatusMsg() {
    const configRequest = new WifiScan.CmdScanStatus();
    const msgType = WifiScan.WiFiScanMsgType.TYPECMDSCANSTATUS;
    const payload = new WifiScan.WiFiScanPayload();
    payload.setMsg(msgType);
    payload.setCmdScanStatus(configRequest);
    return Buffer.from(payload.serializeBinary());
  }

  /**
   * Get Wi-Fi scan list
   * @param {int} start
   * @param {int} count
   * @returns Buffer of protobuf message
   */
  static prepareGetWiFiScanListMsg(start, count) {
    const configRequest = new WifiScan.CmdScanResult();
    configRequest.setStartIndex(start);
    configRequest.setCount(count);
    const msgType = WifiScan.WiFiScanMsgType.TYPECMDSCANRESULT;
    const payload = new WifiScan.WiFiScanPayload();
    payload.setMsg(msgType);
    payload.setCmdScanResult(configRequest);
    return Buffer.from(payload.serializeBinary());
  }

  /**
   * Send Wi-Fi Config
   * @param {Buffer} ssid
   * @param {Buffer} passphrase
   * @returns Buffer of protobuf message
   */
  static prepareWiFiConfigMsg(ssid, passphrase) {
    let cmdSetConfig;
    if (passphrase != null) {
      cmdSetConfig = new WifiConfig.CmdSetConfig();
      cmdSetConfig.setSsid(Buffer.from(ssid).toString('base64'));
      cmdSetConfig.setPassphrase(Buffer.from(passphrase).toString('base64'));
    } else {
      cmdSetConfig = new WifiConfig.CmdSetConfig();
      cmdSetConfig.setSsid(Buffer.from(ssid).toString('base64'));
    }
    const wiFiConfigPayload = new WifiConfig.WiFiConfigPayload();
    wiFiConfigPayload.setCmdSetConfig(cmdSetConfig);
    wiFiConfigPayload.setMsg(WifiConfig.WiFiConfigMsgType.TYPECMDSETCONFIG);
    return Buffer.from(wiFiConfigPayload.serializeBinary());
  }

  /**
   * Apply Wi-Fi config
   * @returns Buffer of protobuf message
   */
  static prepareApplyWiFiConfigMsg() {
    const cmdApplyConfig = new WifiConfig.CmdApplyConfig();
    const wiFiConfigPayload = new WifiConfig.WiFiConfigPayload();
    wiFiConfigPayload.setCmdApplyConfig(cmdApplyConfig);
    wiFiConfigPayload.setMsg(WifiConfig.WiFiConfigMsgType.TYPECMDAPPLYCONFIG);
    return Buffer.from(wiFiConfigPayload.serializeBinary());
  }

  /**
   * Get Wi-Fi Config status
   * @returns Buffer of protobuf message
   */
  static prepareGetWiFiConfigStatusMsg() {
    const cmdGetStatus = new WifiConfig.CmdGetStatus();
    const wiFiConfigPayload = new WifiConfig.WiFiConfigPayload();
    wiFiConfigPayload.setCmdGetStatus(cmdGetStatus);
    wiFiConfigPayload.setMsg(WifiConfig.WiFiConfigMsgType.TYPECMDGETSTATUS);
    return Buffer.from(wiFiConfigPayload.serializeBinary());
  }
}

export default MessengeHelper;
