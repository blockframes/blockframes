import { FloatingDuration } from '@blockframes/utils/common-interfaces/terms';
import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Terms } from '@blockframes/utils/common-interfaces';
import { toDate } from '@blockframes/utils/helpers';

function createTermsControl(terms: Partial<Terms>) {
  return {
    start: new FormControl(terms.start, Validators.required),
    end: new FormControl(terms.end, Validators.required),
    floatingStart: new FormControl(terms.floatingStart),
    floatingDuration: new DistributionRightFloatingDurationForm(terms.floatingDuration)
  };
}

type DistributionRightTermsControl = ReturnType<typeof createTermsControl>;

export class DistributionRightTermsForm extends FormEntity<DistributionRightTermsControl, Terms> {
  constructor(terms: Partial<Terms> = {}) {
    super(createTermsControl(terms));
  }
}

// Floating Duration
function createFloatingDuration(floating: Partial<FloatingDuration>) {
  return {
    unit: new FormControl(floating.unit),
    duration: new FormControl(floating.duration, Validators.min(0)),
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

// Function that returns an error if terms are invalid
export function areTermsValid(terms: Partial<Terms>): void {
  if (!terms.start || !terms.end) {
    throw new Error('Terms need a start date and an end date to be valid');
  }
  if (toDate(terms.start).getTime() >= toDate(terms.end).getTime()) {
    throw new Error(`The end date cannot be inferior to the start date`);
  }
}
