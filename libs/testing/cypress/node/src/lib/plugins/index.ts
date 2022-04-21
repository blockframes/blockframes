export * from './auth';
export * from './db';

export function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}
