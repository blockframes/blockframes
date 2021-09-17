import { getEmulatorsConfig } from "@blockframes/utils/emulator-front-setup";

export const emulatorConfig = getEmulatorsConfig({ auth: true, firestore: true, functions: true });
