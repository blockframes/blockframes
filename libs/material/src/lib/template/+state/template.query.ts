import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TemplateStore, TemplateState } from './template.store';
import { Template } from './template.model';
import { materialsByCategory } from '../../material/+state/material.query';
import { map, filter, pluck } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplateQuery extends QueryEntity<TemplateState, Template> {

  public form$ = this.select(state => state.form);

  public materialsByTemplate$ = this.selectActive().pipe(
    filter(template => !!template.materials),
    pluck('materials'),
    map(materials => materialsByCategory(materials)),
  );

  constructor(
    protected store: TemplateStore
  ) {
    super(store);
  }

  public hasMaterial(materialId: string): boolean {
    return this.getActive().materials.find(material => material.id === materialId) ? true : false;
  }
}
