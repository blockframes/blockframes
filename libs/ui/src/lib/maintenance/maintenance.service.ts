import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { filter, first, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  // if document doesn't exist, we are not in the maintenance
  isInMaintenance$ = of(true);

  constructor(private db: AngularFirestore) {}

  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      first(), // Change on maintenance can only happen once during the session
      tap(_ => window.location.reload())
    );
  }
}
