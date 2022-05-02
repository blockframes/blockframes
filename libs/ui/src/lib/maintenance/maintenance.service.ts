import { Injectable } from '@angular/core';
import { filter, tap, map, first } from 'rxjs/operators';
import { _isInMaintenance, META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';
import { IMaintenanceDoc } from '@blockframes/model';
import { DocumentReference } from 'firebase/firestore';
import { FirestoreService, fromRef } from 'ngfire';
@Injectable({ providedIn: 'root' })
export class MaintenanceService {

  private ref = this.firestoreService.getRef(`${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`) as DocumentReference<IMaintenanceDoc>;
  // if document doesn't exist, it means that there is something not normal, we force maintenance mode to true.
  isInMaintenance$ = fromRef(this.ref).pipe(
    map(snap => snap.data()),
    map(maintenanceDoc => maintenanceDoc ? _isInMaintenance(maintenanceDoc) : true)
  );

  constructor(private firestoreService: FirestoreService) { }

  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      first(),  // Change on maintenance can only happen once during the session
      tap(() => window.location.reload())
    )
  }
}