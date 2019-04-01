import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { TemplateStore, TemplateQuery } from '../+state';

@Injectable({
  providedIn: 'root'
})
export class TemplateGuard implements CanActivate {
  constructor(
    private store: TemplateStore,
    private query: TemplateQuery,
    private router: Router,
    ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!!this.query.getEntity(route.params.templateId)) {
      this.store.setActive(route.params.templateId);
      return true;
    } else {
      this.router.navigate(['layout/template/list']);
      return false;}
  }
}
