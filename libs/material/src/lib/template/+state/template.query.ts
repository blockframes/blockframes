import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template } from './template.model';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { map, switchMap, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TemplateQuery extends QueryEntity<TemplateState, Template> {
  // organizationsWithTemplates$ = this.organizationQuery.selectAll().pipe(
  //   switchMap(orgs =>
  //     combineLatest(
  //       orgs.map(org =>
  //         this.db
  //           .collection<Template>(`orgs/${org.id}/templates`)
  //           .valueChanges()
  //           .pipe(map(templates => ({ ...org, templates } as Organization)))
  //       )
  //     )
  //   )
  // );

  public templatesByOrgs$ = this.selectAll().pipe(map(templates => {
    const r = {};
    templates.forEach(template => {
      if (!r[template.orgId]) {
        r[template.orgId] = [template];
      }
      else {
        r[template.orgId].push(template);
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
    private organizationQuery: OrganizationQuery,
    private db: AngularFirestore
  ) {
    super(store);
  }
}
