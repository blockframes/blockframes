import { Component, OnDestroy, OnInit } from '@angular/core';
import { DocumentReference, DocumentSnapshot } from 'firebase/firestore';
import { FirestoreService, fromRef } from 'ngfire';
import { combineLatest, map, of, Subscription, switchMap, tap } from 'rxjs';
import { algoliaAnonymousSearchKeyDoc, algoliaSearchKeyDoc, appVersionDoc } from '../maintenance';
import { IAlgoliaKeyDoc, IVersionDoc } from '@blockframes/model';
import { appVersion } from '../constants';
import { SentryService } from '../sentry.service';
import { MaintenanceService } from '@blockframes/ui/maintenance';
import { AuthService } from '@blockframes/auth/service';
import { OrganizationService } from '@blockframes/organization/service';
import { setSearchKey } from '../algolia/helper.utils';

@Component({
  selector: 'app-utils',
  template: '',
})
export class AppUtilsComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];

  constructor(
    private firestore: FirestoreService,
    private sentryService: SentryService,
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private orgService: OrganizationService,
  ) { }

  ngOnInit() {
    const appVersionSub = combineLatest([
      fromRef(this.firestore.getRef(appVersionDoc) as DocumentReference<IVersionDoc>).pipe(map(snap => snap.data())),
      this.maintenanceService.isInMaintenance$,
    ]).pipe(
      tap(([version, isInMaintenance]) => {
        if (!version) return;
        const { currentVersion } = version;
        if (!isInMaintenance && currentVersion !== appVersion) {
          this.sentryService.triggerWarning({ message: `Front not in v${currentVersion}`, bugType: 'front-version', location: 'global' });
        }
      })
    ).subscribe();
    this.subs.push(appVersionSub);

    const algoliaSub = combineLatest([
      this.authService.auth$,
      this.orgService.org$
    ]).pipe(
      switchMap(([auth, org]) => {
        if (org?.status === 'accepted') return fromRef(this.firestore.getRef(algoliaSearchKeyDoc) as DocumentReference<IAlgoliaKeyDoc>);
        if (auth?.uid) return fromRef(this.firestore.getRef(algoliaAnonymousSearchKeyDoc) as DocumentReference<IAlgoliaKeyDoc>);
        return of();
      }),
      map((snap: DocumentSnapshot<IAlgoliaKeyDoc>) => setSearchKey(snap.data()))
    ).subscribe();
    this.subs.push(algoliaSub);
  }

  ngOnDestroy() {
    this.subs?.forEach(s => s?.unsubscribe());
  }

}

