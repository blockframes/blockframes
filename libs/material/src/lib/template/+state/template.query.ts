import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template, TemplatesByOrgs } from './template.model';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization';

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

  public orgsWithTemplates$ = this.organizationQuery
    .selectAll()
    .pipe(
      switchMap(orgs =>
        combineLatest(
          orgs.map(org =>
            this.selectAll({ filterBy: template => template.orgId === org.id }).pipe(
              map(templates => ({ ...org, templates }))
            )
          )
        )
      )
    );

  public form$ = this.select(state => state.form);

  public materialsByTemplate$ = combineLatest([
    this.selectActive(),
    this.materialQuery.selectAll()
  ]).pipe(
    map(([template, materials]) => {
      const ids = template ? template.materialsId : [];
      return ids.map(materialId => materials.find(material => material.id === materialId));
    }),
    map(materials => materialsByCategory(materials))
  );

  constructor(
    protected store: TemplateStore,
    private materialQuery: MaterialQuery,
    private organizationQuery: OrganizationQuery
  ) {
    super(store);
  }
}
