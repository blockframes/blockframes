import { firebase } from '@env';
import { InjectionToken, NgModule, Inject, NgZone } from '@angular/core';
// Import firebase analytics
import { analytics } from 'firebase/app'; // <- Types
import 'firebase/analytics'; // <- Content
// Import function to get the app
import { _firebaseAppFactory } from '@angular/fire';
export type Analytics = analytics.Analytics;
// Create an injectable token for Google Analytics
export const ANALYTICS = new InjectionToken<Analytics>('Google Analytics for Firebase');
// Create an injectable token for the App (needed for connected to )
export const APP = new InjectionToken('Firebase app');
@NgModule({
  providers: [
    // Fill the app token with the function provided by @angular/fire
    { provide: APP, useFactory: (zone) => _firebaseAppFactory(firebase, zone), deps: [NgZone] },
    // Fill the analytics token on this app
    { provide: ANALYTICS, useFactory: app => app.analytics(), deps: [APP] }
  ],
})
export class AngularFireAnalyticsModule {
  constructor(@Inject(ANALYTICS) _) {
    // DI inject Analytics here for the automatic data collection
  }
}
