import { EntityState, EntityStore, StoreConfig, MultiActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Material } from './material.model';

export interface MaterialState extends EntityState<Material>, MultiActiveState {
  materialTemplateForm: {
    value: string;
    description: string;
    category: string;
  };

  materialDeliveryForm: {
    value: string;
    description: string;
    category: string;
    step: string;
  };
}

const initialState = {
  active: [],
  materialTemplateForm: null,
  materialDeliveryForm: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'materials', idKey: 'id' })
export class MaterialStore extends EntityStore<MaterialState, Material> {
  constructor() {
    super(initialState);
  }

  public updateEmptyDeliveryForm(category: string) {
    this.update({ materialDeliveryForm: { value: '', description: '', category, step: 'Step 1' } });
  }

  public updateEmptyTemplateForm(category: string) {
    this.update({ materialTemplateForm: { value: '', description: '', category } });
  }

  public clearForm() {
    this.update({ materialTemplateForm: null, materialDeliveryForm: null });
  }

  public returnToInitialState() {
    this.update(initialState);
  }
}
