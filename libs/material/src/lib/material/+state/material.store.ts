import { EntityState, EntityStore, StoreConfig, MultiActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Material } from './material.model';

export interface MaterialState extends EntityState<Material>, MultiActiveState {
  materialTemplateForm: {
    value: string;
    description: string;
    category: string;
  };
}

const initialState = {
  active: [],
  materialTemplateForm: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'materials', idKey: 'id' })
export class MaterialStore extends EntityStore<MaterialState, Material> {
  constructor() {
    super(initialState);
  }

  public updateEmptyTemplateForm(category: string) {
    this.update({ materialTemplateForm: { value: '', description: '', category } });
  }

  public clearForm() {
    this.update({ materialTemplateForm: null });
  }

  public returnToInitialState() {
    this.update(initialState);
  }
}
