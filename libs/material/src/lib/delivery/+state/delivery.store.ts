import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Delivery, createDeliveryFromFirestore, DeliveryWithTimestamps } from './delivery.model';

export type DeliveryOption = 'mustChargeMaterials' | 'mustBeSigned';

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

  akitaPreAddEntity(delivery: DeliveryWithTimestamps): Delivery {
    return createDeliveryFromFirestore(delivery);
  }

  akitaPreUpdateEntity(currentDelivery: Delivery, nextDelivery: DeliveryWithTimestamps): Delivery {
    return createDeliveryFromFirestore(nextDelivery);
  }

  public updateWizard(content?: Partial<DeliveryWizard>) {
    const updateNested = ({ wizard }) => ({
      wizard: content ? { ...wizard, ...content } : undefined
    });
    this.update(updateNested);
  }

  public resetWizard() {
    this.update({ wizard: undefined });
  }
}
