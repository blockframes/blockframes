import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template, TemplatesByOrgs } from './template.model';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateQuery extends QueryEntity<TemplateState, Template> {

  public templatesByOrgs$ = this.selectAll().pipe(map(templates => {
    const r = {} as TemplatesByOrgs;
    templates.forEach(template => {
      if (!r[template.orgName]) {
        r[template.orgName] = [template];
      }
      else {
        r[template.orgName].push(template);
      }
    })
    return r;
  }));

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
  ) {
    super(store);
  }
}
