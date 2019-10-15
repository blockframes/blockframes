import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Material } from './material.model';
import { MaterialStore, MaterialState } from './material.store';

@Injectable({
  providedIn: 'root'
})
export class MaterialQuery extends QueryEntity<MaterialState, Material> {

  constructor(protected store: MaterialStore) {
    super(store);
  }
}
