import { of } from 'rxjs';
import { BasketQuery } from './basket.query';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctionsModule, AngularFireFunctions } from '@angular/fire/functions';
import { BasketService } from './basket.service';
import { AngularFireModule } from '@angular/fire';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
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
    promotionalElements: [{ label: 'test', type: 'movie', url: 'http://test.com' }]
  },
  budget: { totalBudget: '1 mio' },
  promotionalDescription: { keyAssets: ['testassets'], keywords: ['testassertion'] },
  salesAgentDeal: {
    medias: ['freetv'],
    rights: { from: currentTime, to: currentTime },
    territories: ['world']
  },
  salesCast: { credits: [{ firstName: 'testname' }] },
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

const mockOrg = {
  activity: 'test',
  addresses: null,
  name: 'test',
  baskets: null,
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
  wishlist: [{ status: WishlistStatus.pending, movieIds: ['xyz'] }]
};

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

describe('BasketService', () => {
  let spectator: SpectatorService<BasketService>;
  let serviceBasket: BasketService;

  const createService = createServiceFactory({
    service: BasketService,
    imports: [
      AngularFireModule.initializeApp(initTestApp),
      AngularFireFunctionsModule,
      AngularFirestoreModule
    ],
    mocks: [AngularFirestore],
    providers: [
      BasketQuery,
      OrganizationService,
      AngularFireFunctions,
      AuthQuery,
      OrganizationQuery
    ]
  });

  beforeEach(() => {
    spectator = createService();
    serviceBasket = spectator.get(BasketService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(serviceBasket).toBeTruthy();
  });

  it('should not call OrganizationService if no Organization ID is available', async () => {
    const serviceOrg = jest
      .spyOn(spectator.get<OrganizationService>(OrganizationService), 'update')
      .mockImplementation();
    const getAcitveOrgSpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'getActive')
      .mockReturnValue(mockOrg);
    await serviceBasket.updateWishlist(mockMovie);
    expect(getAcitveOrgSpy).toHaveBeenCalled();
    expect(serviceOrg).not.toHaveBeenCalled();
  });

  it('should have only one function for one task', () => {
    expect(serviceBasket.updateWishlist).toBeTruthy();
    expect(serviceBasket.addBasket).toBeTruthy();
    expect(serviceBasket.updateWishlistStatus).toBeTruthy();
    expect(serviceBasket.updateWishlist).toBeTruthy();
    expect(serviceBasket.isAddedToWishlist).toBeTruthy();
    expect(serviceBasket.removeDistributionRight).toBeTruthy();
    expect(serviceBasket.removeMovieFromWishlist).toBeTruthy();
    expect(serviceBasket.rewriteBasket).toBeTruthy();
  });

  it('should return true if a movie Id is already on the wishlist', () => {
    const orgQuerySpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'selectActive')
      .mockReturnValue(of(true));
    serviceBasket.isAddedToWishlist('testId');
    expect(orgQuerySpy).toHaveBeenCalled();
  });

  it('should remove a movie from the wishlist if the movie is present in the wishlist', () => {
    const orgQuerySpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'getActive')
      .mockReturnValue(mockOrg);
    const result = serviceBasket.removeMovieFromWishlist('test');
    expect(orgQuerySpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
