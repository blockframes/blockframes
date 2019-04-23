import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Material } from './material.model';

export interface MaterialState extends EntityState<Material> {

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

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'materials', idKey: 'id' })
export class MaterialStore extends EntityStore<MaterialState, Material> {
  constructor() {
    super({materialTemplateForm: null, materialDeliveryForm: null});
  }

  public updateEmptyDeliveryForm(category: string) {
    this.updateRoot({ materialDeliveryForm: {value: "", description: "", category, step: "Step 1"} })
  }

  public updateEmptyTemplateForm(category: string) {
    this.updateRoot({ materialTemplateForm: {value: "", description: "", category} })
  }

  public clearForm() {
    this.updateRoot({ materialTemplateForm: null, materialDeliveryForm: null })
  }
}
