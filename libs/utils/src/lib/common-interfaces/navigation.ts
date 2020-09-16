import { Observable } from "rxjs";

export interface RouteDescription {
  path: string;
  label: string;
  icon?: string;
  shouldDisplay?: Observable<boolean>
}
