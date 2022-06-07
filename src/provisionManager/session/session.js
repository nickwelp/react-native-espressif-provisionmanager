import Transport from '../transport/bleTransport';
import Security1 from '../security/security1';

import { HANDLER_PROV_SESSION } from '../constants';

/**
 * Session object encapsulates the Transport and Security
 * protocol implementations and is responsible for performing
 * initial handshake with the device to establish a secure session.
 */

class Session {
  _transport = null;

  _security = null;

  _isSessionEstablished = false;

  /**
   * Initialize Session object with Transport and Security interface implementations
   *
   * @param transport
   * @param security
   */
  constructor(transport, security) {
    if (!transport) {
      this._transport = Transport;
    } else {
      this._transport = transport;
    }
    if (!security) {
      this._security = Security1;
    } else {
      this._security = security;
    }
  }

  getSecurity() {
    return this._security;
  }

  getTransport() {
    return this._transport;
  }

  isEstablished() {
    return this._isSessionEstablished;
  }

  /**
   * Establish the session by performing handshake with the device
   * based on the Security implementation.
   * Communication with the device will happen over the Transport interface.
   *
   * @throws RuntimeException
   */
  async init(response, sessionListener) {
    try {
      const request = await this._security.getNextRequestInSession(response);
      if (request === null) {
        this._isSessionEstablished = true;
        if (sessionListener !== null) {
          return await sessionListener.OnSessionEstablished();
        }
        throw new Error('No Session Listener defined, and request is null');
      }
      const returnData = await this._transport.sendData(
        HANDLER_PROV_SESSION,
        request
      );
      if (returnData === null) {
        if (sessionListener !== null) {
          return sessionListener.OnSessionEstablishFailed(
            new Error('Session could not be established')
          );
        }
        throw new Error('No Session Listener defined, and returnData is null');
      }
      return await this.init(returnData, sessionListener);
    } catch (e) {
      if (sessionListener !== null) {
        return sessionListener.OnSessionEstablishFailed(e);
      }
      throw new Error(
        e.message ? e.message : 'Init failed, and no Session Listener'
      );
    }
  }

  async sendDataToDevice(path, data, listener) {
    const encryptedData = this._security.encrypt(data);
    if (this._isSessionEstablished) {
      try {
        const returnData = await this._transport.sendData(path, encryptedData);
        if (listener) listener.onSuccess(this._security.decrypt(returnData));
      } catch (e) {
        this._isSessionEstablished = false;
        throw new Error(e);
      }
    } else {
      const returnData = await this.init(null, {
        OnSessionEstablished: async () => {
          try {
            const rData = await this._transport.sendData(path, encryptedData);
            if (listener) listener.onSuccess(this._security.decrypt(rData));
          } catch (e) {
            this._isSessionEstablished = false;
            console.log(e.message ? e.message : 'decrypt error');
            throw new Error(e);
          }
        },
        OnSessionEstablishFailed: (e) => {
          throw new Error(e);
        },
      });
      if (listener) listener.onSuccess(this._security.decrypt(returnData));
    }
  }
}

export default Session;
