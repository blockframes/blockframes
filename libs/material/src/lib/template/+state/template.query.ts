import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template, TemplatesByOrgs } from './template.model';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { map, switchMap, filter, pluck } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { OrganizationQuery, Organization } from '@blockframes/organization';

export function templatesByOrgName(templates: Template[]): TemplatesByOrgs {
  return templates.reduce(
    (acc, template) => {
      return {
        ...acc,
        [template.orgName]: [...(acc[template.orgName] || []), template]
      };
    },
    {} as TemplatesByOrgs
  );
}

@Injectable({
  providedIn: 'root'
})
export class TemplateQuery extends QueryEntity<TemplateState, Template> {
  public templatesByOrgs$ = this.selectAll().pipe(map(templates => templatesByOrgName(templates)));

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
    filter(template => !!template),
    pluck('materials'),
    map(materials => materialsByCategory(materials))
  );

  constructor(
    protected store: TemplateStore,
    private materialQuery: MaterialQuery,
    private organizationQuery: OrganizationQuery
  ) {
    super(store);
  }

  public get hasTemplates$() {
    return this.selectCount().pipe(map(count => count > 0))
  }
}
