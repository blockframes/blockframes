export * from './plugins/auth';
export * from './plugins/db';
export * from './plugins/festival';

export function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}
