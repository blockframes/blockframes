import { firebaseRegion } from '@env';
import { FunctionBuilder, RuntimeOptions } from 'firebase-functions';

/**
 * Runtime options for heavy functions
 */
 export const heavyRuntimeConfig: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

const heavyFunctionBuilder = new FunctionBuilder({ regions: [firebaseRegion] });
export const heavyFunctions = heavyFunctionBuilder.runWith(heavyRuntimeConfig);
