import { Observable } from "rxjs";
import { RouteDescription } from '@blockframes/model';

export interface TunnelStep {
  title: string;
  icon: string;
  time?: number;
  routes: RouteDescription[];
}

export interface TunnelStepData {
  index: number;
  length: number;
  time?: number;
}

export interface TunnelStepSnapshot {
  title: string;
  icon: string;
  route: RouteDescription;
}

export interface TunnelRoot {
  layout: {
    confirmExit: () => Observable<boolean>;
  }
}
