import { FloatingDuration } from '@blockframes/utils/common-interfaces/terms';
import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Terms } from '@blockframes/utils/common-interfaces';

function createTermsControl(terms: Partial<Terms>) {
  return {
    start: new FormControl(terms.start),
    end: new FormControl(terms.end),
    floatingStart: new FormControl(terms.floatingStart),
    floatingDuration: new DistributionRightFloatingDurationForm(terms.floatingDuration)
  };
}

export type DistributionRightTermsControl = ReturnType<typeof createTermsControl>;

export class DistributionRightTermsForm extends FormEntity<DistributionRightTermsControl, Terms> {
  constructor(terms: Partial<Terms> = {}) {
    super(createTermsControl(terms));
  }
}

// Floating Duration
function createFloatingDuration(floating: Partial<FloatingDuration>) {
  return {
    unit: new FormControl(floating.unit),
    duration: new FormControl(floating.duration, Validators.min(1)),
    temporality: new FormControl(floating.temporality)
  };
}

type DistributionRightFloatingDurationControl = ReturnType<typeof createFloatingDuration>;

export class DistributionRightFloatingDurationForm extends FormEntity<
  DistributionRightFloatingDurationControl,
  FloatingDuration
> {
  constructor(floatingDuration: Partial<FloatingDuration> = {}) {
    super(createFloatingDuration(floatingDuration));
  }
}
