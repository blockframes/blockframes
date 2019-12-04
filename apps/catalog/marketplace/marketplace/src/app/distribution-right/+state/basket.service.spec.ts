import { of } from 'rxjs';
import { BasketQuery } from './basket.query';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { firebase } from '@env';
import { AngularFireFunctionsModule, AngularFireFunctions } from '@angular/fire/functions';
import { BasketService } from './basket.service';
import { AngularFireModule } from '@angular/fire';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { OrganizationQuery, WishlistStatus } from '@blockframes/organization';
import { AuthStore } from '@blockframes/auth';
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

describe('BasketService', () => {
  let spectator: SpectatorService<BasketService>;
  const createService = createServiceFactory({
    service: BasketService,
    imports: [
      AngularFireModule.initializeApp(firebase),
      AngularFireFunctionsModule,
      AngularFirestoreModule
    ],
    providers: [
      BasketQuery,
      OrganizationService,
      AngularFireFunctions,
      AuthQuery,
      OrganizationQuery
    ]
  });

  beforeEach(() => {
    jest.resetAllMocks();
    spectator = createService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    const service: BasketService = spectator.get(BasketService);
    expect(service).toBeTruthy();
  });

  it('should not call OrganizationService if no Organization ID is available', async () => {
    const serviceBasket = spectator.get(BasketService);
    const wishlistSpy = jest.spyOn(serviceBasket, 'updateWishlist');
    const serviceOrg = jest
      .spyOn(spectator.get<OrganizationService>(OrganizationService), 'update')
      .mockImplementation();
    const getAcitveOrgSpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'getActive')
      .mockReturnValue(mockOrg);
    await serviceBasket.updateWishlist(mockMovie);
    expect(wishlistSpy).toHaveBeenCalled();
    expect(getAcitveOrgSpy).toHaveBeenCalled();
    expect(serviceOrg).toHaveBeenCalled();
  });

  it('should update the wishlist and to have been called only 1 time', async () => {
    const service: BasketService = spectator.get(BasketService);
    const wishlistSpy = jest.spyOn(service, 'updateWishlist').mockImplementation();
    await service.updateWishlist(mockMovie);
    expect(wishlistSpy).toHaveBeenCalledWith(mockMovie);
    expect(wishlistSpy).toHaveBeenCalledTimes(1);
  });

  it('should have only one function for one task', () => {
    const service: BasketService = spectator.get(BasketService);
    expect(service.updateWishlist).toBeTruthy();
    expect(service.addBasket).toBeTruthy();
    expect(service.updateWishlistStatus).toBeTruthy();
    expect(service.updateWishlist).toBeTruthy();
    expect(service.isAddedToWishlist).toBeTruthy();
    expect(service.removeDistributionRight).toBeTruthy();
    expect(service.removeMovieFromWishlist).toBeTruthy();
    expect(service.rewriteBasket).toBeTruthy();
  });

  it('should return true if a movie Id is already on the wishlist', () => {
    const service = spectator.get(BasketService);
    const orgQuerySpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'selectActive')
      .mockReturnValue(of(true));
    service.isAddedToWishlist('testId');
    expect(orgQuerySpy).toHaveBeenCalled();
  });

  it('should remove a movie from the wishlist if the movie is present in the wishlist', () => {
    const service = spectator.get(BasketService);
    const orgQuerySpy = jest
      .spyOn(spectator.get(OrganizationQuery), 'getActive')
      .mockReturnValue(mockOrg);
    const result = service.removeMovieFromWishlist('test');
    expect(orgQuerySpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
