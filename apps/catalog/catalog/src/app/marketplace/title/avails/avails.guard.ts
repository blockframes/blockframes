import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AvailsRoot {
  confirmExit: () => Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class AvailsGuard {

  canDeactivate(component: AvailsRoot) {
    return component.confirmExit();
  }
}
