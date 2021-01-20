import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { emulators } from '@env';

/**
 * @see firebase.json for ports
 */
export function getEmulatorsConfig() {

  const enabledEmulators = [];

  if (emulators.auth) {
    enabledEmulators.push({ provide: USE_AUTH_EMULATOR, useValue: ['localhost', 9099] });
  }

  if (emulators.firestore) {
    enabledEmulators.push({ provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] });
  }

  if (emulators.functions) {
    enabledEmulators.push({ provide: USE_FUNCTIONS_EMULATOR, useValue: ['localhost', 5001] });
  }

  return enabledEmulators;
}
