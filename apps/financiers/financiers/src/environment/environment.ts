import { getEmulatorsConfig } from "@blockframes/utils/emulator-front-setup";

export const emulatorConfig = getEmulatorsConfig({ auth: false, firestore: false, functions: false });
