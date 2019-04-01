import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { TemplateStore, TemplateQuery } from '../+state';

@Injectable({
  providedIn: 'root'
})
export class TemplateGuard implements CanActivate {
  constructor(
    private store: TemplateStore,
    private query: TemplateQuery,
    private router: Router
    ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!!this.query.getEntity(route.params.templateId)) {
      this.store.setActive(route.params.templateId);
      return true;
    } else {
      const redirectTo: UrlTree = this.router.parseUrl('layout/template');
      return redirectTo;
    }
  }
}
