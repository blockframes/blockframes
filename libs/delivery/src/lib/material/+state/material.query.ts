import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Material } from './material.model';
import { MaterialStore, State } from './material.store';

export function materialsByCategory(materials: Material[]) {
  return materials.reduce((acc, item) => {
    return {
      ...acc,
      [item.category.toUpperCase()]: [...(acc[item.category.toUpperCase()] || []), item]
    };
  }, {})
}

@Injectable({
  providedIn: 'root'
})
export class MaterialQuery extends QueryEntity<State, Material> {
  constructor(
    protected store: MaterialStore,
  ) {
    super(store);
  }

}
