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

// Material
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { MovieDisplayListModule } from '@blockframes/movie/movie/components/display-list/display-list.module';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { firebase } from '@env';
import { APP_BASE_HREF } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFirestore, FirestoreSettingsToken } from '@angular/fire/firestore';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MarketplaceSearchComponent } from './search.component';
import { FirebaseOptionsToken, AngularFireModule, FirebaseApp } from '@angular/fire';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { AppModule } from '../../app.module';
import { RouterModule } from '@angular/router';

/**
 * Creates a mock instances and all 
 * the methods are mock methods which return undefined
 */
const FireAnalyticsMock = jest.mock('@blockframes/utils/analytics/app-analytics')

describe('MarketplaceSearchComponent test suite', () => {
  let spectator: Spectator<MarketplaceSearchComponent>;

  const createComponent = createComponentFactory({
    component: MarketplaceSearchComponent,
    imports: [
      FlexLayoutModule,
      TranslateSlugModule,
      AppModule,
      RouterModule,
      MovieCardModule,
      ReactiveFormsModule,
      MovieDisplayListModule,
      AngularFireModule.initializeApp(firebase),

      //Material
      MatIconModule,
      MatDividerModule,
      MatMenuModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatExpansionModule,
      MatCheckboxModule,
      MatAutocompleteModule,
      MatListModule,
      MatChipsModule,
      MatNativeDateModule,
      MatCardModule,
      MatSelectModule,
      MatDatepickerModule,
      MatOptionModule,
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
      { provide: APP_BASE_HREF, useValue: '/search' },
      { provide: FireAnalytics, useValue: FireAnalyticsMock }
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should only have one "addLanguage" function', () => {
    const addLanguageSpy = spyOn(spectator.component, 'addLanguage');
    spectator.component.addLanguage('German');
    expect(addLanguageSpy).toHaveBeenCalled();
    expect(addLanguageSpy).toHaveBeenCalledWith('German');
  });

  it('should return the current year when "getCurrentYear" is called', () => {
    /**
     *  We need to use the jest.spyOn here cause this function is a getters
     */
    jest
      .spyOn(spectator.component, 'getCurrentYear', 'get')
      .mockReturnValue(new Date().getFullYear());
    expect(spectator.component.getCurrentYear).toBe(2019);
  });

  it('should return the year 2018 when "getCurrentYear" is called', () => {
    jest.spyOn(spectator.component, 'getCurrentYear', 'get').mockReturnValue(2018);
    expect(spectator.component.getCurrentYear).toBe(2018);
  });
});
