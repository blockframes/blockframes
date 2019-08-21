import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Delivery } from './delivery.model';

export const enum DeliveryOption {
  materialsToBeCharged = 'materialsToBeCharged',
  deliveryListToBeSigned = 'deliveryListToBeSigned'
}

export interface IDeliveryList {
  id: string;
  name: string;
  logo: string;
}

export const enum DeliveryWizardKind {
  specificDeliveryList,
  useTemplate,
  blankList,
  materialList
}

export interface DeliveryWizard {
  // movieId is stored in the URL, prevents having 2 source of truths that can desynchronize
  kind: DeliveryWizardKind;
  deliveryListId?: string;
  options: DeliveryOption[];
}

export interface DeliveryState extends EntityState<Delivery>, ActiveState<string> {
  wizard?: DeliveryWizard;
}

const initialState = {
  active: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'deliveries', idKey: 'id' })
export class DeliveryStore extends EntityStore<DeliveryState, Delivery> {
  constructor() {
    super(initialState);
  }

  public updateWizard(content?: Partial<DeliveryWizard>) {
    const updateNested = ({ wizard }) => ({
      wizard: content ? { wizard, ...content } : undefined
    });
    this.update(updateNested);
  }

  public resetWizard() {
    this.update({ wizard: undefined });
  }
}
