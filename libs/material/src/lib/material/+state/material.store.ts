import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Material } from './material.model';

export interface MaterialState extends EntityState<Material> {

  form: {
    value: string;
    description: string;
    category: string;
    step?: string;
  }
}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'materials', idKey: 'id' })
export class MaterialStore extends EntityStore<MaterialState, Material> {
  constructor() {
    super({form: null});
  }

  public updateEmptyDeliveryForm(category: string) {
    this.updateRoot({ form: {value: "", description: "", category, step: "Step 1"} })
  }

  public updateEmptyTemplateForm(category: string) {
    this.updateRoot({ form: {value: "", description: "", category} })
  }

  public clearForm() {
    this.updateRoot({ form: null })
  }
}
