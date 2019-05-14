import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree, CanDeactivate } from '@angular/router';
import { TemplateStore, Template } from '../+state';
import { StateActiveGuard } from 'libs/utils/src/lib/state-guard';
import { Query, FireQuery } from '@blockframes/utils';
import { takeWhile, tap } from 'rxjs/operators';

export const templateActiveQuery = (orgId: string, templateId: string): Query<Template> => ({
  path: `orgs/${orgId}/templates/${templateId}`,
  materials: (template) => template.materialsId.map(id => ({
    path: `orgs/${orgId}/materials/${id}`
  })),
  orgId
});

@Injectable({
  providedIn: 'root'
})
export class TemplateActiveGuard extends StateActiveGuard implements CanActivate, CanDeactivate<any> {

  constructor(
    private store: TemplateStore,
    private router: Router,
    private fireQuery: FireQuery
  ) {
    super()
  }

  startListeningOnActive(orgId: string, templateId: string): Promise<boolean | UrlTree> {
    //TODO: load the template form page even if an error in the material happens
    return new Promise((res, rej) => {
      this.listenOnActive = true;
      const query = templateActiveQuery(orgId, templateId);
      this.fireQuery.fromQuery<Template>(query).pipe(
        takeWhile(_ => this.listenOnActive),
        tap(template => this.store.upsert(template.id, template)),
        tap(template => this.store.setActive(template.id)),
      ).subscribe({
        next: template => res(!!template),
        error: _ => {
          res(this.router.parseUrl('layout'));
          console.error(_);
        }
      });
    })
  }

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> | UrlTree {
    const { orgId, templateId } = route.params;
    if (!orgId || !templateId) return this.router.parseUrl('layout/template');
    return this.startListeningOnActive(orgId, templateId);
  }

  canDeactivate() {
    this.stopListeningOnActive(); // this correctly unsubscribe when leaving the route !!!
    return true;
  }
}
