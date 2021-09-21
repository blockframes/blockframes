import { firebaseRegion } from '@env';
import { FunctionBuilder, RuntimeOptions } from 'firebase-functions';

/**
 * Default runtime options for functions
 */
const defaultRuntimeConfig: RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '256MB',
};

const functionBuilder = new FunctionBuilder({ regions: [firebaseRegion] });
export const functions = functionBuilder.runWith(defaultRuntimeConfig);