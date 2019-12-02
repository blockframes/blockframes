import { AngularFirestoreModule } from '@angular/fire/firestore';
import { firebase } from '@env';
import { AngularFireFunctions, AngularFireFunctionsModule } from '@angular/fire/functions';
import { TestBed, inject } from '@angular/core/testing';
import { BasketService } from './basket.service';
import { AngularFireModule, FirebaseApp } from '@angular/fire';

describe('BasketService', () => {
  beforeEach(() => {
    let app: FirebaseApp;
    let afFns: AngularFireFunctions;

    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(firebase),
        AngularFireFunctionsModule,
        AngularFirestoreModule
      ],
      providers: [BasketService, AngularFireFunctions]
    });
    inject([FirebaseApp, AngularFireFunctions], (app_: FirebaseApp, _fn: AngularFireFunctions) => {
      app = app_;
      afFns = _fn;
    })();
  });

  it('should be created', () => {
    const service: BasketService = TestBed.get(BasketService);
    expect(service).toBeTruthy();
  });

  it('should update the wishlist', () => {
    const service: BasketService = TestBed.get(BasketService);
    const wishlistSpy = jest.spyOn(service, 'updateWishlist').mockRejectedValue(new Error());
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
  });
});
