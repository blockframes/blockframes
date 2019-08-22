import { FormGroup, FormControl } from '@angular/forms';
import { FormList } from '@blockframes/utils';
import { Step } from '../+state';

export function createStepFormGroup(step: Step) {
  return new FormGroup({
    id: new FormControl(step.id),
    name: new FormControl(step.name),
    date: new FormControl(step.date)
  });
}

function createStepsFormList() {
  return FormList.factory([], createDeadlineFormGroup);
}

export function createDeadlineFormGroup(deadline: any) {
  return new FormGroup({
    label: new FormControl(deadline.label),
    percentage: new FormControl(deadline.percentage),
    date: new FormControl(deadline.date)
  });
}

function createDeadlinesFormList() {
  return FormList.factory([], createDeadlineFormGroup);
}

export function createInformationsFormGroup() {
  return new FormGroup({
    dueDate: new FormControl(),
    acceptationPeriod: new FormControl(),
    reWorkingPeriod: new FormControl(),
    steps: createStepsFormList(),
    amount: new FormControl(),
    currency: new FormControl(),
    deadlines: createDeadlinesFormList()
    // TODO: create formList for guaranteed minimum payment deadline: issue#764
  });
}
