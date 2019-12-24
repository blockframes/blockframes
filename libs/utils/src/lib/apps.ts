// TODO(#714): Synchronize data types with the frontend
// Do not change these values without upgrading the backend too!
// You'll find relevant spots by searching for the issue number.
export const enum App {
  mediaDelivering = 'delivery',
  mediaFinanciers = 'movie-financing',
  storiesAndMore = 'stories-and-more',
  biggerBoat = 'catalog',
  catalogDashboard = 'catalog-dashboard',
  blockframes = 'blockframes'
}

export interface AppDetails {
  name: string;
  logo: string;
  href: string;
  id: App;
}

export const APPS_DETAILS: AppDetails[] = [
  {
    name: 'Media Financiers',
    logo: '/assets/logo/mediaFinanciersLogo.png',
    href: 'movie-financing/explorer',
    id: App.mediaFinanciers
  },
  {
    name: 'Stories and More',
    logo: '/assets/logo/storiesAndMoreLogo.png',
    href: 'https://projects.invisionapp.com/d/main#/console/17462680/361964437/preview',
    id: App.storiesAndMore
  },
  {
    name: 'Media Delivering',
    logo: '/assets/logo/mediaDeliveringLogo.png',
    href: 'delivery',
    id: App.mediaDelivering
  },
  {
    name: 'Bigger Boat - Marketplace',
    logo: '/assets/logo/biggerBoatMarketplaceLogo.png',
    href: 'catalog-marketplace',
    id: App.biggerBoat
  },
  {
    name: 'Bigger Boat - Dashboard',
    logo: '/assets/logo/biggerBoatDashboard.png',
    href: 'catalog-dashboard',
    id: App.catalogDashboard
  }
];
