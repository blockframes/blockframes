// TODO(#714): Synchronize data types with the frontend
// Do not change these values without upgrading the backend too!
// You'll find relevant spots by searching for the issue number.
export const enum App {
  mediaDelivering = 'delivery',
  mediaFinanciers = 'movie-financing',
  storiesAndMore = 'stories-and-more',
  biggerBoat = 'catalog'
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
    logo: 'movie-financing',
    href: '/movie-financing/explorer',
    id: App.mediaFinanciers
  },
  {
    name: 'Stories and More',
    logo: 'stories-and-more',
    href: 'https://invis.io/ZKRW20VCWTU#/361964437_IP_Center_-_Home',
    id: App.storiesAndMore
  },
  {
    name: 'Media Delivering',
    logo: 'delivery',
    href: '/delivery',
    id: App.mediaDelivering
  },
  {
    name: 'Bigger Boat - Marketplace',
    logo: 'catalog-marketplace',
    href: '/catalog-marketplace',
    id: App.biggerBoat
  },
  {
    name: 'Bigger Boat - Dashboard',
    logo: 'catalog-dashboard',
    href: '/catalog-dashboard',
    id: App.biggerBoat
  }
];
