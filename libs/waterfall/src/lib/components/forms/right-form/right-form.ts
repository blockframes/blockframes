
import { FormControl, FormGroup } from '@angular/forms';

import { Condition, Right, RightType, isConditionGroup } from '@blockframes/model';



export type RightForm = FormGroup<{
  type: FormControl<RightType>;
  org: FormControl<string>;
  name: FormControl<string>;
  percent: FormControl<number>;
  parents: FormControl<string[]>;
  conditions: FormControl<Condition[]>;
}>;

export function createRightForm(right?: Partial<Right>): RightForm {
  return new FormGroup({
    type: new FormControl<RightType>(right?.type ?? 'unknown'),
    org: new FormControl(right?.rightholderId ?? ''),
    name: new FormControl(right?.name ?? ''),
    percent: new FormControl(right?.percent ?? 0),
    parents: new FormControl<string[]>(right?.nextIds ?? []),
    conditions: new FormControl(right?.conditions.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? [])
  });
}

export function setRightFormValue(form: RightForm, right: Partial<Right>) {
  form.controls.type.setValue(right.type ?? 'unknown');
  form.controls.org.setValue(right.rightholderId ?? '');
  form.controls.name.setValue(right.name ?? '');
  form.controls.percent.setValue(right.percent ?? 0);
  form.controls.parents.setValue(right.nextIds ?? []);
  form.controls.conditions.setValue(right.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? []);
}