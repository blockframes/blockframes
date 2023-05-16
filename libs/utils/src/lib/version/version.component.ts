import { Component, OnDestroy, OnInit } from '@angular/core';
import { DocumentReference } from 'firebase/firestore';
import { FirestoreService, fromRef } from 'ngfire';
import { combineLatest, map, Subscription, tap } from 'rxjs';
import { appVersionDoc } from '../maintenance';
import { IVersionDoc } from '@blockframes/model';
import { appVersion } from '../constants';
import { SentryService } from '../sentry.service';
import { MaintenanceService } from '@blockframes/ui/maintenance';

@Component({
  selector: 'app-version',
  template: '',
})
export class VersionComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  constructor(
    private firestore: FirestoreService,
    private sentryService: SentryService,
    private service: MaintenanceService
  ) { }

  ngOnInit() {
    this.sub = combineLatest([
      fromRef(this.firestore.getRef(appVersionDoc) as DocumentReference<IVersionDoc>).pipe(map(snap => snap.data())),
      this.service.isInMaintenance$,
    ]).pipe(
      tap(([version, isInMaintenance]) => {
        if (!version) return;
        const { currentVersion } = version;
        if (!isInMaintenance && currentVersion !== appVersion) {
          this.sentryService.triggerWarning({ message: `Front not in v${currentVersion}`, bugType: 'front-version', location: 'global' });
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}

