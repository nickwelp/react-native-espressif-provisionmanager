# react-native-espressif-provisionmanager

This library helps provision ESPRESSIF BLE devices in React-Native, using react-native-ble-plx. 

I want to especially thank these libraries-
The handling of x25519 cryptography is from the stablelib library but for challenges due to shimming, I had to part with calls to other libraries I don't have.
https://github.com/StableLib/stablelib/blob/master/packages/x25519/x25519.ts

As we only need this to produce sharedKeys, and include alogorirthims borrowed from Google Tink to generate keys that satisfy Espressif's conditions.
https://github.com/google/tink/blob/master/java_src/src/main/java/com/google/crypto/tink/subtle/X25519.java

The randombytes is cryptographically secure inasmuch as it uses NativeModules via this package https://github.com/mvayngrib/react-native-randombytes imported via react-native-crypto to produce random bytes

Getting this to build depends on getting the shims to load correctly. 

## Installation

```sh
yarn add react-native-espressif-provisionmanager
```

## Usage

```js
import { provisionManager } from "react-native-espressif-provisionmanager";
```

You then will largely use it like ESPRESSIF's JAVA version of the ESP Provisioning App. 


ProvisionManager is the Class to start with; it is a singleton. Instantiate it by calling 
```js
const provManager = provisionManager.getInstance(); 
```

I like to set up the provisionManager as a state element in the parent App.js of the App. 

```js
const [provManager, setProvManager] = useState(undefined);
  if (!provManager) {
    setProvManager(ProvisionManager.getInstance());
  }
```

and then from there I pass provManager into the App's Context, so it's easy to reach from any screen.

Create a device
```js
    provManager.createESPDevice(
      TransportType.TRANSPORT_BLE,
      SecurityType.SECURITY_1
    );
    await provManager.getDevice().connectBLEDevice(serviceUuid);
    provManager.getDevice().setProofOfPossession(PROOF_OF_POSESSION);
```

For many functionalities, I've wrapped them in promises and wrapped up a series of callbacks.
```js
  const wifiList = await provManager.getDevice().scanNetworksAsync();
```

Or send custom data async:
```js
  const response = await provManager.getDevice().sendDataAsync(path, data);
```

That function is a promise wrapper around the rest of the send codebase which is wedded to callbacks.
```js
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
```

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
