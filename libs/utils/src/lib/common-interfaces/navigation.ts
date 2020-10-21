import { Observable } from "rxjs";

export interface RouteDescription {
  path: string;
  label: string;
  icon?: string;
  shouldDisplay?: boolean;
  /** List of the keys required by the movie or organization to display the page */
  requireKeys?: string[]
}
