import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface AvailsRoot {
  confirmExit: () => Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class AvailsGuard implements CanDeactivate<unknown> {

  canDeactivate(component: AvailsRoot) {
    return component.confirmExit();
  }
}
