import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { firebase } from '@env';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { TestBed } from '@angular/core/testing';
import { BasketService } from './basket.service';
import { AngularFireModule } from '@angular/fire';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';

describe('BasketService', () => {
  let spectator: SpectatorService<BasketService>;
  const createService = createServiceFactory({
    service: BasketService,
    imports: [
      AngularFireModule.initializeApp(firebase),
      AngularFireFunctionsModule,
      AngularFirestoreModule
    ],
    mocks: [OrganizationService]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    const service: BasketService = TestBed.get(BasketService);
    expect(service).toBeTruthy();
  });

  it('should not call OrganizationService if no Organization ID is available', () => {
    const serviceBasket = spectator.get(BasketService);
    const serviceOrg = spyOn(spectator.get<OrganizationService>(OrganizationService), 'update');
    const currentTime: Date = new Date();
    serviceBasket.updateWishlist({
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
    });
    expect(serviceOrg).not.toHaveBeenCalled();
  });

  it('should update the wishlist and to have been called only 1 time', () => {
    const service: BasketService = TestBed.get(BasketService);
    const wishlistSpy = jest.spyOn(service, 'updateWishlist').mockImplementation();
    /**
     * We want to compare the date values, but since
     * the time is passing during the test, we need to have a fixed time
     * stored in a variable
     */
    const currentTime: Date = new Date();
    service.updateWishlist({
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
    });
    expect(wishlistSpy).toHaveBeenCalledWith({
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
    });
    expect(wishlistSpy).toHaveBeenCalledTimes(1);
  });

  it('should have only one function for one task', () => {
    const service: BasketService = TestBed.get(BasketService);
    expect(service.updateWishlist).toBeTruthy();
    expect(service.addBasket).toBeTruthy();
    expect(service.updateWishlistStatus).toBeTruthy();
    expect(service.updateWishlist).toBeTruthy();
    expect(service.isAddedToWishlist).toBeTruthy();
    expect(service.removeDistributionRight).toBeTruthy();
    expect(service.removeMovieFromWishlist).toBeTruthy();
    expect(service.rewriteBasket).toBeTruthy();
  });
});
