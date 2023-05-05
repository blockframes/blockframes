import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Action, ActionList, ActionName, RightAction, ConditionList, ConditionName } from '@blockframes/model';

// TODO still used?
// ----------------------------
//           ACTIONS
// ----------------------------

type ActionPayload = {
  [name in ActionName]: (value?: Partial<ActionList[name]['payload']>) => {
    [key in keyof ActionList[name]['payload']]: FormControl | FormArray
  }
}

const rightAction = (value: Partial<RightAction> = {}) => {
  return {
    date: new FormControl(),
    id: new FormControl(value.id ?? '', { nonNullable: true, validators: [Validators.required] }),
    orgId: new FormControl(value.orgId ?? '', { nonNullable: true, validators: [Validators.required] }),
    percent: new FormControl(value.percent ?? '', { nonNullable: true, validators: [Validators.required] }),
    conditions: new FormArray<ConditionForm>([]),
  }
}

const actionPayloads: Partial<ActionPayload> = {
  append: (value = {}) => ({
    previous: new FormControl(value.previous ?? '', { nonNullable: true, validators: [Validators.required] }),
    ...rightAction(value),
  }),
  prepend: (value = {}) => ({
    next: new FormControl(value.next ?? '', { nonNullable: true, validators: [Validators.required] }),
    ...rightAction(value),
  }),
  invest: (value = {}) => ({
    orgId: new FormControl(value.orgId ?? '', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(value.amount ?? '', { nonNullable: true, validators: [Validators.required] }),
  }),
  income: (value = {}) => ({
    id: new FormControl(value.id ?? '', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(value.amount ?? '', { nonNullable: true, validators: [Validators.required] }),
    from: new FormControl(value.from ?? '', { nonNullable: true }),
    to: new FormControl(value.to ?? '', { nonNullable: true, validators: [Validators.required] }),
    territory: new FormControl(value.territory ?? '', { nonNullable: true, validators: [Validators.required] }),
    media: new FormControl(value.media ?? '', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(value.date ?? '', { nonNullable: true, validators: [Validators.required] }),
  }),
  bonus: (value = {}) => ({
    from: new FormControl(value.from ?? '', { nonNullable: true }),
    to: new FormControl(value.to ?? '', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(value.amount ?? '', { nonNullable: true, validators: [Validators.required] }),
  }),
  onEvent: (value = {}) => {
    const actions = (value.actions ?? []).map(({ name, payload }) => new ActionForm(name, payload));
    return {
      eventId: new FormControl(value.eventId ?? '', { nonNullable: true, validators: [Validators.required] }),
      actions: new FormArray<ConditionForm>(actions),
    }
  },
  emitEvent: (value = {}) => ({
    eventId: new FormControl(value.eventId ?? '', { nonNullable: true, validators: [Validators.required] }),
    value: new FormControl(value.value ?? '', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(value.date ?? '', { nonNullable: true, validators: [Validators.required] }),
  }),
  expense: (value = {}) => ({
    orgId: new FormControl(value.orgId ?? '', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(value.amount ?? '', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(value.date ?? '', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl(value.amount ?? '', { nonNullable: true, validators: [Validators.required] }),
  }),
  updateRight: (value = {}) => {
    const previous = (value.previous ?? []).map(prev => new FormControl(prev, { nonNullable: true }));
    return {
      id: new FormControl(value.id ?? '', { nonNullable: true, validators: [Validators.required] }),
      date: new FormControl(value.date ?? '', { nonNullable: true, validators: [Validators.required] }),
      previous: new FormArray<FormControl<string>>(previous),
    }
  }
}


export class ActionForm extends FormGroup<{ name: FormControl, payload: FormGroup }> {
  override value!: Action;
  constructor(name: ActionName, payload: any = {}) {
    if (!actionPayloads[name]) throw new Error(`Action ${name} is not yet implemented`);
    const controls = (actionPayloads[name] as any)(payload);
    super({
      name: new FormControl(name),
      payload: new FormGroup(controls),
    })
  }
}

export const getId = (idKey: string) => (actions: Action[]) => {
  const ids = new Set<string>();
  for (const action of actions) {
    if ((action.payload as any)[idKey]) {
      ids.add((action.payload as any)[idKey]);
    }
  }
  return ids;
}



// ----------------------------
//         CONDITIONS
// ----------------------------

type ConditionPayload = {
  [name in ConditionName]: (value?: Partial<ConditionList[name]['payload']>) => {
    [key in keyof ConditionList[name]['payload']]: FormControl | FormArray
  }
}

const conditionPayloads: Partial<ConditionPayload> = {

}

export class ConditionForm extends FormGroup<{ name: FormControl, payload: FormGroup }> {
  constructor(name: ConditionName, payload = {}) {
    if (!conditionPayloads[name]) throw new Error(`Condition ${name} is not yet implemented`);
    const controls = (conditionPayloads[name] as any)(payload);
    super({
      name: new FormControl(name),
      payload: new FormGroup(controls),
    })
  }
}
