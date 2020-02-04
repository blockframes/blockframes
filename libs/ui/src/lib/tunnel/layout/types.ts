export interface TunnelRoute {
  path: string;
  label: string;
}

export interface TunnelNavigation {
  title: string;
  icon: string;
  routes: TunnelRoute[];
}

export interface TunnelPageData {
  index: number;
  length: number;
}