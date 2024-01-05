
import { FormControl, FormGroup } from '@angular/forms';

import { Condition, Right, RightType } from '@blockframes/model';



export type RightForm = FormGroup<{
  type: FormControl<RightType>;
  org: FormControl<string>;
  name: FormControl<string>;
  percent: FormControl<number>;
  parents: FormControl<string[]>;
  steps: FormControl<Condition[][]>;
}>;

export function createRightForm(right?: Partial<Right>, steps?: Condition[][]): RightForm {
  return new FormGroup({
    type: new FormControl<RightType>(right?.type ?? 'unknown'),
    org: new FormControl(right?.rightholderId ?? ''),
    name: new FormControl(right?.name ?? ''),
    percent: new FormControl(right?.percent ?? 0),
    parents: new FormControl<string[]>(right?.nextIds ?? []),
    steps: new FormControl(steps ?? [[]]),
  });
}

export function setRightFormValue(form: RightForm, right: Partial<Right>, steps: Condition[][]) {
  form.controls.type.setValue(right.type ?? 'unknown');
  form.controls.org.setValue(right.rightholderId ?? '');
  form.controls.name.setValue(right.name ?? '');
  form.controls.percent.setValue(right.percent ?? 0);
  form.controls.parents.setValue(right.nextIds ?? []);
  form.controls.steps.setValue(steps ?? [[]]);
}