// ***********************************************************
//
// This is the place to put constants for environment
// like timeouts, delays, etc.
//
// ***********************************************************

const SEC = 1000;

// Timeout in seconds
export enum TO {
  VSLOW_UPDATE = 150 * SEC,
  PAGE_ELEMENT = 3 * SEC,
  THREE_SEC = 3 * SEC,
  SLOW_OP = 10 * SEC,
  FAST_OP = 3 * SEC,
  FAST_WAIT = 3 * SEC,
  ONE_SEC = 1 * SEC,
}
