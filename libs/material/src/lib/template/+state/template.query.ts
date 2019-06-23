import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template } from './template.model';
import { materialsByCategory } from '../../material/+state/material.query';
import { map, switchMap, filter, pluck } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { OrganizationQuery, Organization } from '@blockframes/organization';

@Injectable({
  providedIn: 'root'
})
export class TemplateQuery extends QueryEntity<TemplateState, Template> {

  public get orgsWithTemplates$() {
    return this.organizationQuery.selectAll().pipe(
      switchMap(orgs => {
        const orgsWithTemplates = orgs.map(org =>
          this.selectAll({ filterBy: template => template.orgId === org.id }).pipe(
            map(templates => ({ ...org, templates } as Organization))
          )
        );
        return combineLatest(orgsWithTemplates);
      })
    );
  }

  public form$ = this.select(state => state.form);

  public materialsByTemplate$ = this.selectActive().pipe(
    filter(template => !!template.materials),
    pluck('materials'),
    map(materials => materialsByCategory(materials)),
  );

  constructor(
    protected store: TemplateStore,
    private organizationQuery: OrganizationQuery,
  ) {
    super(store);
  }
}
