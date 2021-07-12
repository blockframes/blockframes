import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { CmsModule } from './cms.module';
import { REGION } from '@angular/fire/functions';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { firebase, firebaseRegion } from '@env';

import { FormFactoryModule } from 'ng-form-factory';
import { emulatorConfig } from '../environment/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CmsModule,
    BrowserModule,
    BrowserAnimationsModule,
    OverlayModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebase('cms')),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirePerformanceModule,
    FormFactoryModule,
  ],
  providers: [
    { provide: REGION, useValue: firebaseRegion },
    ...emulatorConfig
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
