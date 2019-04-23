import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree, CanDeactivate } from '@angular/router';
import { TemplateStore, TemplateQuery, Template } from '../+state';
import { StateListGuard } from 'libs/utils/src/lib/state-guard';
import { map, takeWhile, switchMap, tap } from 'rxjs/operators';
import { OrganizationQuery, OrganizationStore } from '@blockframes/organization';
import { FireQuery, Query } from '@blockframes/utils';
import { combineLatest, Observable } from 'rxjs';

export function templateListQuery(orgId: string): Query<Template[]> {
  return <Query<Template[]>> {
    path: `orgs/${orgId}/templates`
  };
}


@Injectable({
  providedIn: 'root'
})
export class TemplateListGuard extends StateListGuard implements CanActivate, CanDeactivate<any> {
  constructor(
    private store: TemplateStore,
    private query: TemplateQuery,
    private orgQuery: OrganizationQuery,
    private orgStore: OrganizationStore,
    private router: Router,
    private fireQuery: FireQuery
  ) {
    super();
  }

  startListeningOnList(): void {
    this.listenOnList = true;
    
    // TODO what happen if user copy/paste url and Org state wasn't set previously ? Find a falback mechanism
    this.orgQuery.selectAll().pipe(
      switchMap(orgs => {
        const templates$ = orgs.map(org => {
          return this.fireQuery.fromQuery(templateListQuery(org.id)).pipe(
            map(templates => templates.map(template => ({ ...template, orgId: org.id })))
          )
        });
        return combineLatest(templates$);
      }), 
      map(templates => [].concat(...templates)),
      takeWhile(_ => !!this.listenOnList),
    ).subscribe(templates => this.store.set(templates));
  }

  canActivate(): boolean {
    this.startListeningOnList();
    return true;
  }

  canDeactivate() {
    this.stopListeningOnList(); // this correctly unsubscribe when leaving the route !!!
    return true;
  }
}
