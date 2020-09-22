import { FormList } from '@blockframes/utils/form/forms/list.form';
import { FormControl } from '@angular/forms';
import { createDistributionRight } from '../+state/distribution-right.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { DistributionRight } from '../+state/distribution-right.model';
import { DistributionRightTermsForm } from './terms/terms.form';
import { DistributionRightHoldbacksForm } from './holdbacks/holdbacks.form';
import { MovieVersionInfoForm } from '@blockframes/movie/form/movie.form';


function createDistributionRightControls(right: Partial<DistributionRight>) {
  const entity = createDistributionRight(right);
  return {
    id: new FormControl(entity.id),
    contractId: new FormControl(entity.contractId),
    exclusive: new FormControl(entity.exclusive),
    territory: FormList.factory(entity.territory),
    territoryExcluded: FormList.factory(entity.territoryExcluded),
    licenseType: new FormControl(entity.licenseType),
    terms: new DistributionRightTermsForm(entity.terms),
    holdbacks: FormList.factory(entity.holdbacks, holdback => new DistributionRightHoldbacksForm(holdback)),
    assetLanguage: new MovieVersionInfoForm(right.assetLanguage),
    multidiffusion: FormList.factory(entity.multidiffusion, multi => new DistributionRightTermsForm(multi)),
    catchUp: new DistributionRightTermsForm(entity.catchUp),
    download: new FormControl(entity.download)
  };
}

type DistributionRightControls = ReturnType<typeof createDistributionRightControls>;

export class DistributionRightForm extends FormEntity<DistributionRightControls> {
  constructor(right: Partial<DistributionRight> = {}) {
    super(createDistributionRightControls(right));
  }

  get territory() {
    return this.get('territory');
  }
}
