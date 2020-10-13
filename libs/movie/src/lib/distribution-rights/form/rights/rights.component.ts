// Blockframes
import { MediasValues, staticConsts } from '@blockframes/utils/static-model';
import { DistributionRightForm } from '../distribution-right.form';

// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[form] distribution-form-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightRightsComponent {
  @Input() form: DistributionRightForm;

  public staticMedias = Object.values(staticConsts['medias']).filter(media => {
    const wantedMedias = ['Pay TV', 'Free TV', 'S-VOD', 'A-VOD', 'Planes', 'Trains', 'Hotels'];
    return wantedMedias.includes(media);
  });

  get licenseType() {
    return this.form.get('licenseType');
  }

  public isChecked(media: MediasValues) {
    return this.licenseType.value.includes(media);
  }
}
