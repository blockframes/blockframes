import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/compat/auth'; // TODO #7273 no compat
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR, SETTINGS as FIRESTORE_SETTINGS } from '@angular/fire/compat/firestore';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/compat/functions';

/**
 * @see firebase.json for ports
 */
export function getEmulatorsConfig(emulators: {
  auth: boolean;
  firestore: boolean;
  functions: boolean;
}) {
  const enabledEmulators = [];

  if (emulators.auth) {
    enabledEmulators.push({ provide: USE_AUTH_EMULATOR, useValue: ['localhost', 9099] });
  }

  if (emulators.firestore) {
    enabledEmulators.push({ provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] });
    enabledEmulators.push({ provide: FIRESTORE_SETTINGS, useValue: { experimentalForceLongPolling: true } });
  }

  if (emulators.functions) {
    enabledEmulators.push({ provide: USE_FUNCTIONS_EMULATOR, useValue: ['localhost', 5001] });
  }

  return enabledEmulators;
}
