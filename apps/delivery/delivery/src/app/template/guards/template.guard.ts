import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { TemplateStore } from '../+state';


@Injectable({
  providedIn: 'root'
})
export class TemplateGuard implements CanActivate {

  constructor(private store: TemplateStore) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    this.store.setActive(route.params.templateId);
    return true;
  }

}

