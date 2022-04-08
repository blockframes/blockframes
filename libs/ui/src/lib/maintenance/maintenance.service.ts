import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { filter, tap, map, first } from 'rxjs/operators';
import { _isInMaintenance, META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';
import { IMaintenanceDoc } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {

  // if document doesn't exist, it means that there is something not normal, we force maintenance mode to true.
  isInMaintenance$ = this.db.doc<IMaintenanceDoc>(`${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`).valueChanges().pipe(
    map(maintenanceDoc => maintenanceDoc ? _isInMaintenance(maintenanceDoc) : true)
  );

  constructor(private db: AngularFirestore) { }

  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      first(),  // Change on maintenance can only happen once during the session
      tap(() => window.location.reload())
    )
  }
}