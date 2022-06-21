import { Injectable } from '@angular/core';
import { filter, tap, map, first } from 'rxjs/operators';
import { _isInMaintenance, META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';
import { IMaintenanceDoc } from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
@Injectable({ providedIn: 'root' })
export class MaintenanceService extends BlockframesCollection<IMaintenanceDoc>{
  readonly path = META_COLLECTION_NAME;

  private ref = this.getRef(`${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`);
  // if document doesn't exist, it means that there is something not normal, we force maintenance mode to true.
  isInMaintenance$ = this.fromRef(this.ref).pipe(
    map(maintenanceDoc => maintenanceDoc ? _isInMaintenance(maintenanceDoc) : true)
  );

  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      first(),  // Change on maintenance can only happen once during the session
      tap(() => window.location.reload())
    )
  }
}