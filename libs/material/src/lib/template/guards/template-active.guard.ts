import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree, CanDeactivate } from '@angular/router';
import { TemplateStore, TemplateQuery, Template } from '../+state';
import { StateActiveGuard } from 'libs/utils/src/lib/state-guard';
import { Query, FireQuery } from '@blockframes/utils';
import { takeWhile, switchMap, distinctUntilChanged } from 'rxjs/operators';

export function templateActiveQuery(orgId: string, activeId: string): Query<Template> {
  return <Query<Template>> {
    path: `orgs/${orgId}/templates/${activeId}`
  };
}

@Injectable({
  providedIn: 'root'
})
export class TemplateActiveGuard extends StateActiveGuard implements CanActivate, CanDeactivate<any> {
  
  constructor(
    private store: TemplateStore,
    private query: TemplateQuery,
    private router: Router,
    private fireQuery: FireQuery
    ) {
      super()
  }

  startListeningOnActive(): void {
    this.listenOnActive = true;
    this.query.selectActive().pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), // this prevent infinite loop
      switchMap(templ => this.fireQuery.fromQuery(templateActiveQuery(templ.orgId, templ.id))),
      takeWhile(_ => !!this.listenOnActive),
    )
    .subscribe(activeTemplate => {
      this.store.update(activeTemplate.id, activeTemplate);
    });
  }
  
  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // TODO what happen if user copy/paste url and Template state wasn't set previously ? Find a falback mechanism
    this.store.setActive(route.params.templateId);
    this.startListeningOnActive();
    return true;
  }

  canDeactivate() {
    this.stopListeningOnActive(); // this correctly unsubscribe when leaving the route !!!
    return true;
  }
}
