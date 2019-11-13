import { EntityStore, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Delivery, modifyTimestampToDate } from './delivery.model';
import { CollectionState } from 'akita-ng-fire';

export const enum DeliveryOption {
  mustChargeMaterials = 'mustChargeMaterials',
  mustBeSigned = 'mustBeSigned'
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

export interface DeliveryState extends CollectionState<Delivery> {
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

  public akitaPreAddEntity(delivery: any): Delivery {
    return modifyTimestampToDate(delivery);
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
