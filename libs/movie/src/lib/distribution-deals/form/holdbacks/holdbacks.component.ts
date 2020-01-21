import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DistributionDealHoldbacksForm } from './holdbacks.form';

@Component({
  selector: '[form] distribution-form-holdbacks',
  templateUrl: './holdbacks.component.html',
  styleUrls: ['./holdbacks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealHoldbacksComponent {
  @Input() form: DistributionDealHoldbacksForm;

  public staticMedias = staticModels['MEDIAS'].filter(media => {
    const wantedMedias = ['Pay TV', 'Free TV', 'S-VOD', 'A-VOD', 'Ancillary'];
    if (wantedMedias.includes(media.label)) {
      return true;
    }
  });

  get termsForm() {
    return this.form.get('terms');
  }
}
