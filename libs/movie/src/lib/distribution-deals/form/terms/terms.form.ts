import { FloatingDuration } from '@blockframes/utils/common-interfaces/terms';
import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Terms } from '@blockframes/utils/common-interfaces';

function createTermsControl(terms: Partial<Terms>) {
  return {
    start: new FormControl(terms.start),
    end: new FormControl(terms.end),
    floatingStart: new FormControl(terms.floatingStart),
    floatingDuration: new DistributionDealFloatingDurationForm(terms.floatingDuration)
  };
}

type DistributionDealTermsControl = ReturnType<typeof createTermsControl>;

export class DistributionDealTermsForm extends FormEntity<DistributionDealTermsControl> {
  constructor(terms: Partial<Terms> = {}) {
    super(createTermsControl(terms));
  }
}

// Floating Duration
function createFloatingDuration(floating: Partial<FloatingDuration>) {
  return {
    unit: new FormControl(floating.unit),
    duration: new FormControl(floating.duration),
    temporality: new FormControl(floating.temporality)
  };
}

type DistributionDealFloatingDurationControl = ReturnType<typeof createFloatingDuration>;

export class DistributionDealFloatingDurationForm extends FormEntity<
  DistributionDealFloatingDurationControl
> {
  constructor(floatingDuration: Partial<FloatingDuration> = {}) {
    super(createFloatingDuration(floatingDuration));
  }
}
