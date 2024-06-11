import { InjectionToken } from '@angular/core';
import firebaseSetup from 'firebase.json';
import { authEmulator, firestoreEmulator, functionsEmulator, storageEmulator } from 'ngfire';

interface EnabledEmulators {
  auth: boolean;
  firestore: boolean;
  functions: boolean;
  storage: boolean;
}

export type EmulatorsConfig = Partial<Record<'auth' | 'firestore' | 'functions' | 'storage', { host: string, port: number }>>;

/**
 * @see firebase.json for ports
 */
export function getEmulatorsConfig(emulators: EnabledEmulators = { auth: false, firestore: false, functions: false, storage: false }) {
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

  if (emulators.storage) {
    enabledEmulators.storage = { host: 'localhost', port: firebaseSetup.emulators.storage.port };
  }

  return enabledEmulators;
}

export const EMULATORS_CONFIG = new InjectionToken<EmulatorsConfig>('Emulators currently used');

export function setupEmulators(emulatorConfig: EmulatorsConfig) {
  return {
    firestore: emulatorConfig.firestore ? firestoreEmulator(emulatorConfig.firestore.host, emulatorConfig.firestore.port) : undefined,
    auth: emulatorConfig.auth ? authEmulator(`http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`, { disableWarnings: true }) : undefined,
    functions: emulatorConfig.functions ? functionsEmulator(emulatorConfig.functions.host, emulatorConfig.functions.port) : undefined,
    storage: emulatorConfig.storage ? storageEmulator(emulatorConfig.storage.host, emulatorConfig.storage.port) : undefined
  };
}