
import { emulatorConfig } from '../environment/environment';
import { firebase, firebaseRegion } from '@env';
import { FormFactoryModule } from 'ng-form-factory';

// Angular
import { REGION } from '@angular/fire/functions';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';

// Components
import { AppComponent } from './app.component';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirePerformanceModule } from '@angular/fire/performance';

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
    AngularFireModule.initializeApp(firebase('cms')),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirePerformanceModule,
    FormFactoryModule,
  ],
  providers: [
    { provide: REGION, useValue: firebaseRegion },
    { provide: APP, useValue: 'cms' },
    ...emulatorConfig
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
