export * from './testing-cypress';

export function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}
