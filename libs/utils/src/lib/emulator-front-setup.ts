import { InjectionToken } from '@angular/core';
import { Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, Functions } from 'firebase/functions';
import firebaseSetup from 'firebase.json';

interface EnabledEmulators {
  auth: boolean;
  firestore: boolean;
  functions: boolean;
}

export type EmulatorsConfig = Partial<Record<'auth' | 'firestore' | 'functions', { host: string, port: number }>>;

/**
 * @see firebase.json for ports
 */
export function getEmulatorsConfig(emulators: EnabledEmulators = { auth: false, firestore: false, functions: false }) {
  const enabledEmulators: EmulatorsConfig = {};

  if (emulators.auth) {
    enabledEmulators.auth = { host: 'localhost', port: firebaseSetup.emulators.auth.port };
  }

  if (emulators.firestore) {
    enabledEmulators.firestore = { host: 'localhost', port: firebaseSetup.emulators.firestore.port };
  }

  if (emulators.functions) {
    enabledEmulators.functions = { host: 'localhost', port: firebaseSetup.emulators.functions.port };
  }

  return enabledEmulators;
}

export const EMULATORS_CONFIG = new InjectionToken<EmulatorsConfig>('Emulators currently used');

export function setupEmulators(emulatorConfig: EmulatorsConfig) {
  return {
    firestore: (firestore: Firestore) => {
      if (emulatorConfig.firestore) {
        connectFirestoreEmulator(firestore, emulatorConfig.firestore.host, emulatorConfig.firestore.port);
      }
    },
    auth: (auth: Auth) => {
      if (emulatorConfig.auth) {
        connectAuthEmulator(auth, `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`, { disableWarnings: true });
      }
    },
    functions: (functions: Functions) => {
      if (emulatorConfig.functions) {
        connectFunctionsEmulator(functions, emulatorConfig.functions.host, emulatorConfig.functions.port);
      }
    }
  };
}
