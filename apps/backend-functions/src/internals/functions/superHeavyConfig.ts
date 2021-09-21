import { firebaseRegion } from '@env';
import { FunctionBuilder, RuntimeOptions } from 'firebase-functions';

/**
 * Runtime options for super heavy functions
 */
 export const superHeavyRuntimeConfig: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '4GB',
};

const superHeavyFunctionBuilder = new FunctionBuilder({ regions: [firebaseRegion] });
export const superHeavyFunctions = superHeavyFunctionBuilder.runWith(superHeavyRuntimeConfig);
