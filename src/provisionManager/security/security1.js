/* eslint-disable no-bitwise */
import { Buffer } from 'buffer/';
import '../../../shim';
import crypto from 'crypto';

import * as x25519 from './x25519';

const Sec1 = require('../protocols/sec1_pb');
const Session = require('../protocols/session_pb');

/**
 * Security 1 implementation of the handshake and encryption
 * protocols.
 * Security 1 is based on AES CTR mode with NoPadding
 *
 */

/*
 * this is xor is a copy of Espressif's xor algorithm
 * which includes modulating the arrays and repeating the bytes
 * to meet the full length of the longest input
 * @params fisrt: Buffer, second Buffer,
 * @returns Buffer; sub class of Uint8Array
 */
const xor = (first, second) => {
  const length = Math.max(first.length, second.length);
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = first[i % first.length] ^ second[i % second.length];
  }
  return result;
};

class Security1 {
  _TAG = 'Espressif::Curb::Security1';

  _SESSION_STATE_REQUEST1 = 0;

  _SESSION_STATE_RESPONSE1_REQUEST2 = 1;

  _SESSION_STATE_RESPONSE2 = 2;

  _SESSION_STATE_FINISHED = 3;

  _sessionState = this._SESSION_STATE_REQUEST1;

  _privateKey = '';

  _publicKey = '';

  _proofOfPossession = new Uint8Array();

  _clientVerify = new Uint8Array();

  _cipher = undefined;

  /** *
   * Create Security 1 implementation
   * @param proofOfPossession (latin1 string) proof of possession identifying the physical device
   *
   */
  constructor(proofOfPossession) {
    if (proofOfPossession) {
      this._proofOfPossession = Buffer.from(proofOfPossession, 'latin1');
    }
  }

  async getNextRequestInSession(hexData) {
    let request = null;
    switch (this._sessionState) {
      case this._SESSION_STATE_REQUEST1:
        this._sessionState = this._SESSION_STATE_RESPONSE1_REQUEST2;
        request = await this._getStep0Request();
        break;
      case this._SESSION_STATE_RESPONSE1_REQUEST2:
        this._sessionState = this._SESSION_STATE_RESPONSE2;
        await this._processStep0Response(hexData);
        request = this._getStep1Request();
        break;
      case this._SESSION_STATE_RESPONSE2:
        this._sessionState = this._SESSION_STATE_FINISHED;
        this._processStep1Response(hexData);
        break;
      default:
        break;
    }
    return request;
  }

  async _generateKeyPair() {
    const { privateKey, publicKey } = x25519.generateKeyPairLikeTink();
    this._privateKey = privateKey;
    this._publicKey = publicKey;
    return new Promise((resolve) => {
      resolve({ privateKey, publicKey });
    });
  }

  async _getStep0Request() {
    try {
      const { publicKey } = await this._generateKeyPair();
      const sessionCmd0 = new Sec1.SessionCmd0();
      sessionCmd0.setClientPubkey(publicKey);
      const sec1Payload = new Sec1.Sec1Payload();
      sec1Payload.setSc0(sessionCmd0);
      const sessionData = new Session.SessionData();
      sessionData.setSecVer(Session.SecSchemeVersion.SECSCHEME1);
      sessionData.setSec1(sec1Payload);
      return sessionData.serializeBinary();
    } catch (e) {
      throw new Error(e);
    }
  }

  async _processStep0Response(hexData) {
    try {
      if (hexData === null) {
        throw new Error(`${this._TAG} No response from device`);
      }
      const responseData = Session.SessionData.deserializeBinary(hexData);
      if (responseData.getSecVer() !== Session.SecSchemeVersion.SECSCHEME1) {
        throw new Error(`${this._TAG} Security version mismatch`);
      }

      const devicePublicKey = Buffer.from(
        responseData.getSec1().getSr0().getDevicePubkey_asU8()
      );
      const deviceRandom = Buffer.from(
        responseData.getSec1().getSr0().getDeviceRandom_asU8()
      );
      let sharedKey = Buffer.from(
        x25519.sharedKey(
          Buffer.from(this._privateKey, 'base64'),
          devicePublicKey
        )
      );
      if (this._proofOfPossession.length > 0) {
        const popHashedByteArray = Buffer.from(
          crypto.createHash('sha256').update(this._proofOfPossession).digest()
        );
        sharedKey = xor(sharedKey, popHashedByteArray);
      }
      this._cipher = crypto.createCipheriv(
        'aes-256-ctr',
        Buffer.from(sharedKey),
        deviceRandom
      );
      this._clientVerify = this.encrypt(Buffer.from(devicePublicKey));
    } catch (e) {
      throw new Error(e);
    }
  }

  _getStep1Request() {
    const sessionCmd1 = new Sec1.SessionCmd1();
    sessionCmd1.setClientVerifyData(Buffer.from(this._clientVerify));
    const sec1Payload = new Sec1.Sec1Payload();
    sec1Payload.setSc1(sessionCmd1);
    sec1Payload.setMsg(Sec1.Sec1MsgType.SESSION_COMMAND1);
    const sessionData = new Session.SessionData();
    sessionData.setSecVer(Session.SecSchemeVersion.SECSCHEME1);
    sessionData.setSec1(sec1Payload);
    return sessionData.serializeBinary();
  }

  _processStep1Response(hexData) {
    try {
      if (hexData == null) {
        throw new Error(`${this._TAG} No response from device`);
      }

      const responseData = Session.SessionData.deserializeBinary(hexData);
      if (responseData.getSecVer() !== Session.SecSchemeVersion.SECSCHEME1) {
        throw new Error(`${this._TAG} Security version mismatch`);
      }

      const deviceVerifyData = Buffer.from(
        responseData.getSec1().getSr1().getDeviceVerifyData()
      );
      const decryptedDeviceVerifyData = this.decrypt(deviceVerifyData);
      // should be equal
      if (
        Buffer.compare(
          Buffer.from(this._publicKey, 'base64'),
          decryptedDeviceVerifyData
        ) !== 0
      ) {
        throw new Error(`${this._TAG} Session establishment failed.`);
      }
      console.log(`${this._TAG} SESSION ESTABLISHED`);
    } catch (e) {
      throw new Error(
        this._TAG + (e.message ? e.message : ' in process Step1 Response')
      );
    }
  }

  encrypt(data) {
    return this._cipher.update(data);
  }

  decrypt(data) {
    return this._cipher.update(data);
  }
}

export default Security1;
