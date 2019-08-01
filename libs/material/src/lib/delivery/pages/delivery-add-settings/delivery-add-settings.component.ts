import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionPickerListItem } from '@blockframes/ui';

export const enum DeliveryOption {
  materialsToBeCharged = 'materialsToBeCharged',
  deliveryListToBeSigned = 'deliveryListToBeSigned'
}

/**
 * Page for the flow: "create a delivery"
 * fourth step, select its mode.
 */
@Component({
  selector: 'delivery-add-settings',
  templateUrl: './delivery-add-settings.component.html',
  styleUrls: ['./delivery-add-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAddSettingsComponent {
  public items: ActionPickerListItem<DeliveryOption>[] = [
    {
      title: 'Materials to be charged',
      payload: DeliveryOption.materialsToBeCharged
    },
    {
      title: 'Delivery list to be signed',
      payload: DeliveryOption.deliveryListToBeSigned
    }
  ];
  public options: DeliveryOption[] = [];

  constructor() {}

  public picked(options: DeliveryOption[]) {
    this.options = options;
  }

  public onCompleteFlow() {}
}
