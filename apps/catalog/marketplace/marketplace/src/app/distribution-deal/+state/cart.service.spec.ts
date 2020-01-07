import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { CatalogCartQuery } from './cart.query';
import { CartService } from 'apps/catalog/marketplace/marketplace/src/app/distribution-deal/+state/cart.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctionsModule, AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireModule } from '@angular/fire';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { OrganizationQuery, WishlistStatus } from '@blockframes/organization';
import { initializeTestApp } from '@firebase/testing';

/**
 * We want to compare the date values, but since
 * the time is passing during the test, we need to have a fixed time
 * stored in a variable
 */
const currentTime: Date = new Date();
const mockMovie: Movie = {
  id: '1',
  main: { title: { original: 'test' } },
  _type: 'movies',
  deliveryIds: ['12'],
  story: { synopsis: 'test movie', logline: 'test movie long' },
  promotionalElements: {
    images: [{ originalRef: '123', ref: '1234', url: 'http://test.com' }],
    promotionalElements: [{ label: 'test', type: 'movie', media: null }]
  },
  budget: { totalBudget: '1 mio' },
  promotionalDescription: { keyAssets: ['testassets'], keywords: ['testassertion'] },
  salesAgentDeal: {
    medias: ['freetv'],
    rights: { from: currentTime, to: currentTime },
    territories: ['world']
  },
  salesCast: { credits: [{ firstName: 'testname', role: 'actor' }] },
  festivalPrizes: { prizes: [{ name: 'cannes', year: 2019 }] },
  versionInfo: { dubbings: ['french'], subtitles: ['german'] },
  salesInfo: {
    theatricalRelease: false,
    broadcasterCoproducers: ['test'],
    certifications: ['none'],
    color: 'yes',
    europeanQualification: false,
    internationalPremiere: { name: 'cannes', year: 2019 },
    pegi: '18',
    originCountryReleaseDate: currentTime,
    scoring: '5'
  }
};

const mockOrg: Organization = {
  activity: 'test',
  addresses: null,
  name: 'test',
  cart: null,
  created: null,
  email: null,
  fiscalNumber: null,
  id: 'testOrg',
  logo: null,
  movieIds: null,
  status: null,
  templateIds: null,
  updated: null,
  userIds: null,
  isBlockchainEnabled: false,
  wishlist: [{ status: WishlistStatus.pending, movieIds: ['xyz'] }]
};

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

describe('CartService', () => {
  let spectator: SpectatorService<CartService>;
  let serviceCart: CartService;

  const createService = createServiceFactory({
    service: CartService,
    imports: [
      AngularFireModule.initializeApp(initTestApp),
      AngularFireFunctionsModule,
      AngularFirestoreModule
    ],
    mocks: [AngularFirestore, OrganizationService],
    providers: [
      CatalogCartQuery,
      AngularFireFunctions,
      AuthQuery,
      OrganizationQuery
    ]
  });

  beforeEach(() => {
    spectator = createService();
    serviceCart = spectator.get(CartService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(serviceCart).toBeTruthy();
  });

/*   it('should call OrganizationQuery when updateWishlist is called', () => {
    const getAcitveOrgSpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'getActive')
      .mockReturnValue(mockOrg);
    serviceCart.updateWishlist(mockMovie).catch(e => console.log(e));
    expect(getAcitveOrgSpy).toHaveBeenCalled();
  });
 */
  it('should have only one function for one task', () => {
    expect(serviceCart.updateWishlist).toBeTruthy();
    expect(serviceCart.updateWishlistStatus).toBeTruthy();
    expect(serviceCart.updateWishlist).toBeTruthy();
    expect(serviceCart.removeMovieFromWishlist).toBeTruthy();
  });

  it('should remove a movie from the wishlist if the movie is present in the wishlist', () => {
    const orgQuerySpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'getActive')
      .mockReturnValue(mockOrg);
    serviceCart.removeMovieFromWishlist('test');
    expect(orgQuerySpy).toHaveBeenCalled();
  });
});
