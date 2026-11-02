import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { fromBase64url } from './crypto.mjs';

/** Passkeys are always required to prove user verification (PIN/biometrics). */
const COMMON = {
  userVerification: 'required',
  timeout: 90_000,
};

export async function registrationOptions(config, { userHandle, userName, passkeys }) {
  return generateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpID,
    userID: fromBase64url(userHandle),
    userName,
    userDisplayName: 'Palace owner',
    attestationType: 'none',
    excludeCredentials: passkeys.map((passkey) => ({
      id: passkey.id,
      transports: JSON.parse(passkey.transports || '[]'),
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required',
    },
    supportedAlgorithmIDs: [-8, -7],
  });
}

export async function authenticationOptions(config, passkeys) {
  return generateAuthenticationOptions({
    rpID: config.rpID,
    allowCredentials: passkeys.map((passkey) => ({
      id: passkey.id,
      transports: JSON.parse(passkey.transports || '[]'),
    })),
    ...COMMON,
  });
}

export async function verifyRegistration(config, response, expectedChallenge) {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: config.allowedOrigins,
    expectedRPID: config.rpID,
    requireUserPresence: true,
    requireUserVerification: true,
  });
}

export async function verifyAuthentication(config, response, expectedChallenge, passkey) {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: config.allowedOrigins,
    expectedRPID: config.rpID,
    credential: {
      id: passkey.id,
      publicKey: fromBase64url(passkey.public_key),
      counter: passkey.counter,
      transports: JSON.parse(passkey.transports || '[]'),
    },
    requireUserVerification: true,
  });
}

/** Convert a verified registration into the row we persist. */
export function passkeyFromRegistration(info, name, now) {
  const credential = info.credential;
  return {
    id: credential.id,
    name: name.slice(0, 60) || '通行密钥',
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter ?? 0,
    transports: credential.transports ?? [],
    deviceType: info.credentialDeviceType ?? 'singleDevice',
    backedUp: Boolean(info.credentialBackedUp),
    createdAt: now,
  };
}
