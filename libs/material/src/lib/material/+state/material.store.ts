import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Material } from './material.model';

export interface MaterialState extends EntityState<Material>, ActiveState<string> {
  materialTemplateForm: {
    value: string;
    description: string;
    category: string;
  };

  materialDeliveryForm: {
    value: string;
    description: string;
    category: string;
    stepId: string;
  };
}

const initialState = {
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
    this.update({ materialDeliveryForm: { value: '', description: '', category, stepId: '' } });
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
