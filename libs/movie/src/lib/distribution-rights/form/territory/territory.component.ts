// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Others
import { DistributionRightForm } from '../distribution-right.form';
import { default as staticModels } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[form] distribution-form-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightTerritoryComponent {
  @Input() form: DistributionRightForm;

  public territories = staticModels['TERRITORIES'];

  get territory() {
    return this.form.get('territory');
  }

  get territoryExcluded() {
    return this.form.get('territoryExcluded');
  }
}
