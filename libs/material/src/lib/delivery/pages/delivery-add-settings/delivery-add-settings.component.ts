import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionPickerListItem } from '@blockframes/ui';
import { DeliveryService } from '../../+state';
import { TemplateQuery } from '../../../template/+state';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie';

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

  constructor(
    private service: DeliveryService,
    private templateQuery: TemplateQuery,
    private movieQuery: MovieQuery,
    private router: Router
  ) {}

  public picked(options: DeliveryOption[]) {
    this.options = options;
  }

  public async onCompleteFlow() {
    // TODO(#590): Implement the jump to the last page that creates the delivery
    //  with all of our configuration.
    const movieId = this.movieQuery.getActiveId();
    const templateId = this.templateQuery.getActiveId();
    const deliveryId = await this.service.addDelivery(templateId);
    this.router.navigate([`layout/o/delivery/${movieId}/${deliveryId}`]);
  }
}
