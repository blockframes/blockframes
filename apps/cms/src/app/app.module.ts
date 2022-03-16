
import { emulatorConfig } from '../environment/environment';
import { firebase } from '@env';
import { FormFactoryModule } from 'ng-form-factory';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Blockframes
import { CmsModule } from './cms.module';
import { APP } from '@blockframes/utils/routes/utils';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CmsModule,
    BrowserModule,
    BrowserAnimationsModule,
    OverlayModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(firebase('cms'))),
    provideFirestore(() => getFirestore()),
    providePerformance(() => getPerformance()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),

    FormFactoryModule,
  ],
  providers: [
    { provide: APP, useValue: 'cms' },
    ...emulatorConfig
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
