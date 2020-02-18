import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { filter, tap, map, first } from 'rxjs/operators';
import { isInMaintenance, IMaintenanceDoc, maintenancePath } from '@blockframes/utils/maintenance';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  
  // if document doesn't exist, we are not in the maintenance
  isInMaintenance$ = this.db.doc<IMaintenanceDoc>(maintenancePath).valueChanges().pipe(
    map(maintenanceDoc => maintenanceDoc ? isInMaintenance(maintenanceDoc) : false)
  );

  constructor(private db: AngularFirestore) {}

  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      first(),  // Change on maintenance can only happen once during the session
      tap(_ => window.location.reload())
    )
  }
}