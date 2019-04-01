import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Material } from './material.model';
import { MaterialStore, MaterialState } from './material.store';
import { TemplateView } from '../../template/+state';

export function materialsByCategory(materials: Material[]) : TemplateView {
  return materials.reduce((acc, item) => {
    return {
      ...acc,
      [item.category.toUpperCase()]: [...(acc[item.category.toUpperCase()] || []), item]
    };
  }, {} as TemplateView)
}

@Injectable({
  providedIn: 'root'
})
export class MaterialQuery extends QueryEntity<MaterialState, Material> {
  constructor(
    protected store: MaterialStore,
  ) {
    super(store);
  }

}
