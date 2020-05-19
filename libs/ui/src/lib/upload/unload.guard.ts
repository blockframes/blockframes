import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { UnloadComponent } from './unload.model';

@Injectable({ providedIn: 'root' })
export class UnloadGuard implements CanDeactivate<UnloadComponent> {

  canDeactivate(
    component: UnloadComponent,
  ) {
    return component.canUnload();
  }
}
