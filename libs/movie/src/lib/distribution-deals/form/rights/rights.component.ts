// Blockframes
import { staticModels, MediasSlug } from '@blockframes/utils/static-model';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';

// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Lodash
import pickBy from 'lodash/pickBy';
import toArray from 'lodash/toArray';

@Component({
  selector: '[form] distribution-form-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealRightsComponent {
  @Input() form: DistributionDealForm;

  public staticMedias = toArray(
    pickBy(staticModels['MEDIAS'], media => {
      const wantedMedias = ['Pay TV', 'Free TV', 'S-VOD', 'A-VOD', 'Ancillary'];
      if (wantedMedias.includes(media.label)) {
        return true;
      }
    })
  );

  get licenseType() {
    return this.form.get('licenseType');
  }

  public isChecked(media: MediasSlug) {
    return this.licenseType.value.includes(media);
  }

  public updateForm(media: MediasSlug, index: number) {
    this.licenseType.value.includes(media)
      ? this.licenseType.removeAt(index)
      : this.licenseType.add(media);
  }
}
