import { FormGroup, FormControl } from '@angular/forms';

function createDeliveryDatesFormGroup() {
  return new FormGroup({
    dueDate: new FormControl(null),
    acceptationPeriod: new FormControl(null),
    reWorkingPeriod: new FormControl(null)
  });
}

export function createInformationsFormGroup() {
  return new FormGroup({
    deliveryDates: createDeliveryDatesFormGroup(),
    // TODO: create formList for steps: issue#759
    // TODO: create formList for guaranteed minimum payment deadline: issue#764
  });
}
