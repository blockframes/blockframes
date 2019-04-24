import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree, CanDeactivate } from '@angular/router';
import { TemplateStore, Template } from '../+state';
import { StateActiveGuard } from 'libs/utils/src/lib/state-guard';
import { Query, FireQuery } from '@blockframes/utils';
import { takeWhile, map, tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const templateActiveQuery = (orgId: string, templateId: string): Query<Template> => ({
  path: `orgs/${orgId}/templates/${templateId}`,
  materials: (template) => template.materialsId.map(id => ({ // ! WARNING THIS WILL CRASH IF "orgId" OR "templateId" DOESN'T EXIST
    path: `orgs/${orgId}/materials/${id}`
  }))
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

  startListeningOnActive(orgId: string, templateId: string): Observable<Template> {
    this.listenOnActive = true;
    const query = templateActiveQuery(orgId, templateId);
    return this.fireQuery.fromQuery(query).pipe(
      takeWhile(_ => this.listenOnActive),
      tap(template => this.store.upsert(template.id, template)),
      tap(template => this.store.setActive(template.id)),
    );
  }
  
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | UrlTree {
    const { orgId, templateId } = route.params;
    if (!orgId || !templateId) return this.router.parseUrl('layout/template');
    return this.startListeningOnActive(orgId, templateId).pipe(
      map(template => !!template),
      catchError(_ => of(this.router.parseUrl('layout/template')))
      // catchError() // TODO afeter fireQuery update
    )
  }

  canDeactivate() {
    this.stopListeningOnActive(); // this correctly unsubscribe when leaving the route !!!
    return true;
  }
}
