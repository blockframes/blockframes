// TODO(#714): Synchronize data types with the frontend
// Do not change these values without upgrading the backend too!
// You'll find relevant spots by searching for the issue number.
export const app = {
  biggerBoat : 'catalog',
  blockframes: 'blockframes'
} as const;

export type App = keyof typeof app;
export type AppValue = typeof app[App];

export interface AppDetails {
  name: string;
  logo: string;
  href: string;
  id: AppValue;
}
// @todo #2461 remove
