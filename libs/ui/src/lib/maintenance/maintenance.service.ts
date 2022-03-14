import { Injectable } from '@angular/core';
import { doc, docData, DocumentReference, Firestore } from '@angular/fire/firestore';
import { filter, tap, map, first } from 'rxjs/operators';
import { _isInMaintenance, IMaintenanceDoc, META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {

  private ref = doc(this.db, `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`) as DocumentReference<IMaintenanceDoc>;
  // if document doesn't exist, it means that there is something not normal, we force maintenance mode to true.
  isInMaintenance$ = docData<IMaintenanceDoc>(this.ref).pipe(
    map(maintenanceDoc => maintenanceDoc ? _isInMaintenance(maintenanceDoc) : true)
  );

  constructor(private db: Firestore) { }

  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      first(),  // Change on maintenance can only happen once during the session
      tap(() => window.location.reload())
    )
  }
}