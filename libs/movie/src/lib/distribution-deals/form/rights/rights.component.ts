// Blockframes
import { staticModels, MediasSlug } from '@blockframes/utils/static-model';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';

// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[form] distribution-form-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealRightsComponent {
  @Input() form: DistributionDealForm;

  public staticMedias = staticModels['MEDIAS'].filter(media => {
    const wantedMedias = ['Pay TV', 'Free TV', 'S-VOD', 'A-VOD', 'Ancillary'];
    return wantedMedias.includes(media.label);
  });

  get licenseType() {
    return this.form.get('licenseType');
  }

  public isChecked(media: MediasSlug) {
    return this.licenseType.value.includes(media);
  }
}
