export * from './auth';
export * from './firestore';
export * from './festival';

export function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}
