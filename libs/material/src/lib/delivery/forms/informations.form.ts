import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormList, validPercentageList } from '@blockframes/utils';
import { Step, MGDeadline } from '../+state';

export function createStepFormGroup(step: Step) {
  return new FormGroup({
    id: new FormControl(step.id),
    name: new FormControl(step.name),
    date: new FormControl(step.date)
  });
}

function createStepsFormList() {
  return FormList.factory([], createStepFormGroup);
}

export function createDeadlineFormGroup(deadline: MGDeadline) {
  return new FormGroup({
    label: new FormControl(deadline.label),
    percentage: new FormControl(deadline.percentage, Validators.required),
    date: new FormControl(deadline.date)
  });
}

function createDeadlinesFormList() {
  return FormList.factory([], createDeadlineFormGroup,
    validPercentageList
);
}

export function createInformationsFormGroup() {
  return new FormGroup({
    // Delivery minimum guaranteed
    mgAmount: new FormControl(),
    mgCurrency: new FormControl(),
    mgDeadlines: createDeadlinesFormList(),
    // Delivery dates
    dueDate: new FormControl(),
    acceptationPeriod: new FormControl(),
    reWorkingPeriod: new FormControl(),
    // Delivery steps
    steps: createStepsFormList()
  });
}
