
import { FormControl, FormGroup } from '@angular/forms';
import { Condition, Right, RightType } from '@blockframes/model';

export interface RightFormValue {
  type: RightType;
  org: string;
  contract: string;
  name: string;
  percent: number;
  parents: string[];
  steps: Condition[][];
}

export type RightForm = FormGroup<{
  type: FormControl<RightType>;
  org: FormControl<string>;
  contract: FormControl<string>;
  name: FormControl<string>;
  percent: FormControl<number>;
  parents: FormControl<string[]>;
  steps: FormControl<Condition[][]>;
}>;

export function createRightForm(right?: Partial<Right>, steps?: Condition[][]): RightForm {
  return new FormGroup({
    type: new FormControl<RightType>(right?.type ?? 'unknown'),
    org: new FormControl(right?.rightholderId ?? ''),
    contract: new FormControl(right?.contractId ?? ''),
    name: new FormControl(right?.name ?? ''),
    percent: new FormControl(right?.percent ?? 0),
    parents: new FormControl<string[]>(right?.nextIds ?? []),
    steps: new FormControl(steps ?? [[]]),
  });
}

export function setRightFormValue(form: RightForm, right: Partial<Right>, steps: Condition[][]) {
  form.controls.type.setValue(right.type ?? 'unknown');
  form.controls.org.setValue(right.rightholderId ?? ''); // @dev At this point, rightholderId is the rightholder name
  form.controls.contract.setValue(right.contractId ?? '');
  form.controls.name.setValue(right.name ?? '');
  form.controls.percent.setValue(right.percent ?? 0);
  form.controls.parents.setValue(right.nextIds ?? []);
  form.controls.steps.setValue(steps ?? [[]]);
}