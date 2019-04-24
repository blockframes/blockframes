import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, UrlTree, Router } from '@angular/router';
import { TemplateStore, Template } from '../+state';
import { StateListGuard } from 'libs/utils/src/lib/state-guard';
import { map, takeWhile, switchMap, tap } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization';
import { FireQuery, Query } from '@blockframes/utils';
import { combineLatest } from 'rxjs';
import { applyTransaction } from '@datorama/akita';

export const templateListQuery = (orgId: string): Query<Template[]> => ({
  path: `orgs/${orgId}/templates`,
  orgId
})

@Injectable({
  providedIn: 'root'
})
export class TemplateListGuard extends StateListGuard implements CanActivate, CanDeactivate<any> {
  constructor(
    private store: TemplateStore,
    private router: Router,
    private orgQuery: OrganizationQuery,
    private fireQuery: FireQuery,
  ) {
    super();
  }

  startListeningOnList(): Promise<boolean | UrlTree> {
    return new Promise((res, rej) => {
      this.listenOnList = true;
    
      this.orgQuery.selectAll().pipe(
        switchMap(orgs => {
          const templates$ = orgs.map(org => {
            const query = templateListQuery(org.id);
            return this.fireQuery.fromQuery(query);
          });
          return combineLatest(templates$);
        }), 
        map(templates => [].concat(...templates)),
        tap(templates => applyTransaction(() => {
          templates.forEach(template => this.store.upsert(template.id, template));
        })),
        takeWhile(_ => !!this.listenOnList),
      ).subscribe({
        next: templates => res(!!templates),
        error: _ => res(this.router.parseUrl('layout'))
      });
    });
    
  }

  canActivate(): Promise<boolean | UrlTree> {
    return this.startListeningOnList()
  }

  canDeactivate() {
    this.stopListeningOnList(); // this correctly unsubscribe when leaving the route !!!
    return true;
  }
}
