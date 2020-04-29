/**
 * Apps definition
 */
export type App = 'catalog' | 'festival';

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