/**
 * Apps definition
 */

export const app = ['catalog', 'festival'] as const;
export type App = typeof app[number];

/** @TODO (#2539) This is currently unused but we keep it to future uses. */
/*export interface AppDetails {
  name: string;
  logo: string;
  href: string;
  id: App;
}*/

export function getCurrentApp(routerQuery) : App {
  return routerQuery.getValue().state.root.data.app as App;
}