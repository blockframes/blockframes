// Workaround for error: TypeError: window.matchMedia is not a function
window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  };
});

import { APP_BASE_HREF } from '@angular/common';
import { AppModule } from './../../app.module';
import { AngularFirestore, FirestoreSettingsToken } from '@angular/fire/firestore';
import { firebase } from '@env';
import { RouterModule } from '@angular/router';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { MarketplaceHomeComponent } from './home.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator/jest';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { AngularFireModule, FirebaseOptionsToken } from '@angular/fire';

describe('MarketplaceHomeComponent test suite', () => {
  let spectator: Spectator<MarketplaceHomeComponent>;
  const createComponent = createComponentFactory({
    component: MarketplaceHomeComponent,

    imports: [
      MatCarouselModule,
      FlexLayoutModule,
      MatIconModule,
      TranslateSlugModule,
      AppModule,
      RouterModule,
      AngularFireModule.initializeApp(firebase)
    ],
    providers: [
      AngularFirestore,
      {
        provide: FirestoreSettingsToken,
        useValue: { host: 'localhost:8080', ssl: false }
      },
      {
        provide: FirebaseOptionsToken,
        useValue: { projectId: firebase.projectId }
      },
      { provide: APP_BASE_HREF, useValue: '/' }
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should return "row" if number "2" is insert in layout function', () => {
    expect(spectator.component.layout(2)).toBe('row');
  });

  it('should return "start start" if number "2" is insert in alignment function', () => {
    expect(spectator.component.alignment(2)).toBe('start start');
  });
});

test('smoke', () => {
  expect(true).toBeTruthy();
});
