// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Others
import { DistributionDealForm } from '../distribution-deal.form';
import { default as staticModels } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[form] distribution-form-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealTerritoryComponent {
  @Input() form: DistributionDealForm;

  public territories = staticModels['TERRITORIES'];
}
