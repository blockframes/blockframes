import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template } from './template.model';
import { MaterialQuery, materialsByCategory } from '../../material/+state/material.query';
import { map } from 'rxjs/operators';
import { combineLatest, } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateQuery extends QueryEntity<TemplateState, Template> {

  public materialsByTemplate$ = combineLatest([
    this.selectActive(),
    this.materialQuery.selectAll()
  ]).pipe(
    map(([template, materials]) => {
      const ids = template ? template.materialsId : [];
      return ids.map(materialId => materials.find(material => material.id === materialId));
    }),
    map(materials => materialsByCategory(materials)
    )
  );

  constructor
  (
    protected store: TemplateStore,
    private materialQuery: MaterialQuery,
    ) {
    super(store);
  }

  public templates$() {
    return this.materialQuery.selectAll().pipe(
      map(materials =>
        materials.reduce((acc, item) => {
          return {
            ...acc,
            [item.category]: [...(acc[item.category] || []), item]
          };
        }, {})
      )
    );
  }


  public unsortedMaterialsByTemplate() {
    const template = this.getActive();

    const ids = template ? template.materialsId : [];
    return ids.map(materialId => this.materialQuery.getAll().find(material => material.id === materialId));
  }





}
