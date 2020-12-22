import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';

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