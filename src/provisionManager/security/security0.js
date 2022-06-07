const Sec0 = require('../protocols/sec0_pb');
const Session = require('../protocols/session_pb');

/**
 * Security 0 implementation of the handshake and encryption
 * protocol.
 * Security 0 specifies no encryption and only a single step handshake.
 */

class Security0 {
  _TAG = 'Espressif::Security0';

  _SESSION_STATE_0 = 0;

  _SESSION_STATE_1 = 1;

  _sessionState = this._SESSION_STATE_0;

  getNextRequestInSession(hexData) {
    let response = null;
    switch (this._sessionState) {
      case this._SESSION_STATE_0:
        this._sessionState = this._SESSION_STATE_1;
        response = this._getStep0Request();
        break;
      case this._SESSION_STATE_1:
        this._processStep0Response(hexData);
        break;
      default:
        break;
    }
    return response;
  }

  encrypt(data) {
    return data;
  }

  decrypt(data) {
    return data;
  }

  _getStep0Request() {
    const s0SessionCmd = new Sec0.S0SessionCmd();
    const sec0Payload = new Sec0.Sec0Payload();
    sec0Payload.setSc(s0SessionCmd);
    const newSessionData = Session.SessionData();
    newSessionData.secSecVerValue(Session.SecSchemeVersion.SECSCHEME0);
    newSessionData.setSec0(sec0Payload);
    return newSessionData.serializeBinary();
  }

  _processStep0Response(hexData) {
    try {
      if (hexData == null) {
        throw new Error(this._TAG, 'No response from device');
      }

      const responseData = Session.SessionData.deserializeBinary(hexData);
      if (responseData.getSecVer() !== Session.SecSchemeVersion.SECSCHEME0) {
        throw new Error(this._TAG, 'Security version mismatch');
      }
    } catch (e) {
      console.log(this._TAG, e.getMessage());
    }
  }
}

export default Security0;
