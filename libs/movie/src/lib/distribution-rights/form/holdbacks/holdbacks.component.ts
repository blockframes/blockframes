import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DistributionRightHoldbacksForm } from './holdbacks.form';

@Component({
  selector: '[form] distribution-form-holdbacks',
  templateUrl: './holdbacks.component.html',
  styleUrls: ['./holdbacks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightHoldbacksComponent {
  @Input() form: DistributionRightHoldbacksForm;

  public staticMedias = staticModels['MEDIAS'].filter(media => {
    const wantedMedias = ['Pay TV', 'Free TV', 'S-VOD', 'A-VOD', 'Planes', 'Trains', 'Hotels'];
    return wantedMedias.includes(media.label);
  });

  get termsForm() {
    return this.form.get('terms');
  }
}
