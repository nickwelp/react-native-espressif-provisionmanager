export const DEFAULT_WIFI_BASE_URL = '192.168.4.1:80';

export const TransportType = {
  TRANSPORT_BLE: 'TRANSPORT_BLE',
  TRANSPORT_SOFTAP: 'TRANSPORT_SOFTAP',
};

export const SecurityType = {
  SECURITY_0: 'SECURITY_0',
  SECURITY_1: 'SECURITY_1',
};

export const ProvisionFailureReason = {
  AUTH_FAILED: 'AUTH_FAILED',
  NETWORK_NOT_FOUND: 'NETWORK_NOT_FOUND',
  DEVICE_DISCONNECTED: 'DEVICE_DISCONNECTED',
  UNKNOWN: 'UNKNOWN',
};

// End point names
export const HANDLER_PROV_SCAN = 'prov-scan';
export const HANDLER_PROTO_VER = 'proto-ver';
export const HANDLER_PROV_SESSION = 'prov-session';
export const HANDLER_PROV_CONFIG = 'prov-config';

// Event types
export const EVENT_DEVICE_CONNECTED = 1;
export const EVENT_DEVICE_CONNECTION_FAILED = 2;
export const EVENT_DEVICE_DISCONNECTED = 3;

// Constants for WiFi Security values (As per proto files)
export const WIFI_OPEN = 0;
export const WIFI_WEP = 1;
export const WIFI_WPA_PSK = 2;
export const WIFI_WPA2_PSK = 3;
export const WIFI_WPA_WPA2_PSK = 4;
export const WIFI_WPA2_ENTERPRISE = 5;
