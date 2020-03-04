// TODO(#714): Synchronize data types with the frontend
// Do not change these values without upgrading the backend too!
// You'll find relevant spots by searching for the issue number.
export const app = {
  mediaDelivering : 'delivery',
  mediaFinanciers : 'movie-financing',
  storiesAndMore : 'stories-and-more',
  biggerBoat : 'catalog',
  blockframes: 'blockframes'
} as const;

export type App = keyof typeof app;
export type AppValue = typeof app[App];

export interface AppDetails {
  name: string;
  logo: string;
  href: string;
  id: AppValue;
}

export const APPS_DETAILS: AppDetails[] = [
  {
    name: 'Media Financiers',
    logo: '/assets/logo/mediaFinanciersLogo.png',
    href: 'movie-financing/explorer',
    id: app.mediaFinanciers
  },
  {
    name: 'Stories and More',
    logo: '/assets/logo/storiesAndMoreLogo.png',
    href: 'https://projects.invisionapp.com/d/main#/console/17462680/361964437/preview',
    id: app.storiesAndMore
  },
  {
    name: 'Media Delivering',
    logo: '/assets/logo/mediaDeliveringLogo.png',
    href: 'delivery',
    id: app.mediaDelivering
  },
  {
    name: 'Archipel Content',
    logo: '/assets/logo/biggerBoatMarketplaceLogo.png',
    href: 'catalog',
    id: app.biggerBoat
  }
];
