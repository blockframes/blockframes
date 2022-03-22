/**
 * @see firebase.json for ports
 */
export function getEmulatorsConfig(emulators: {
  auth: boolean;
  firestore: boolean;
  functions: boolean;
}) {
  const enabledEmulators: Partial<Record<'auth' | 'firestore' | 'functions', { host: string, port: number }>> = {};

  if (emulators.auth) {
    enabledEmulators.auth = { host: 'localhost', port: 9099 };
  }

  if (emulators.firestore) {
    enabledEmulators.firestore = { host: 'localhost', port: 8080 };
  }

  if (emulators.functions) {
    enabledEmulators.functions = { host: 'localhost', port: 5001 };
  }

  return enabledEmulators;
}
