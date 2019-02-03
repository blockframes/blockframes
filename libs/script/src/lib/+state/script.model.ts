export interface Script {
  hash: string;
  title: string;
}

/**
 * A factory function that creates Script
 */
export function createScript(params: Partial<Script>) {
  return { ...params, date: Date.now().toString() } as Script;
}
