import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { filter, tap, map, shareReplay } from 'rxjs/operators';
import { isInMaintenance, IMaintenanceDoc, maintenancePath } from '@blockframes/utils/maintenance';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  
  isInMaintenance$ = this.db.doc<IMaintenanceDoc>(maintenancePath).valueChanges().pipe(
    map(isInMaintenance),
    shareReplay()
  );

  constructor(private db: AngularFirestore, private router: Router) {}


  redirectOnMaintenance() {
    return this.isInMaintenance$.pipe(
      filter(isMaintenance => !!isMaintenance),
      tap(_ => this.router.navigate(['/maintenance']))
    )
  }
}