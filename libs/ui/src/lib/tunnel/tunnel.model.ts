import { Observable } from "rxjs";

export interface TunnelRoute {
  path: string;
  label: string;
}

export interface TunnelStep {
  title: string;
  icon: string;
  time?: number;
  routes: TunnelRoute[];
}

export interface TunnelStepData {
  index: number;
  length: number;
  time?: number;
}

export interface TunnelRoot {
  confirmExit: () => Observable<boolean>;
}