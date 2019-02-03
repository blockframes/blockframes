export interface Ip {
  hash: string;
  title: string;
}

/**
 * A factory function that creates Ip
 */
export function createIp(params: Partial<Ip>) {
  return { ...params, date: Date.now().toString() } as Ip;
}
