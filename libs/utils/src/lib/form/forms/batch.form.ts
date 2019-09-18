import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter, startWith } from 'rxjs/operators';

type EntityControl<E = any> = {
  [key in keyof Partial<E>]: AbstractControl;
}

export class FormParty<C extends EntityControl> extends FormGroup {
  get<K extends keyof C>(path: Extract<K, string>): C[K] {
    return super.get(path) as C[K];
  }

  addControl<K extends keyof C>(name: Extract<K, string>, control: C[K]) {
    super.addControl(name, control);
  }

  removeControl(name: Extract<keyof C, string>) {
    super.removeControl(name);
  }

  setControl<K extends keyof C>(name: Extract<K, string>, control: C[K]) {
    super.setControl(name, control);
  }

  setValue(value: Partial<C>, options?: { onlySelf?: boolean; emitEvent?: boolean }) {
    super.setValue(value, options);
  }

  patchValue(entity: Partial<C>, options?: { onlySelf?: boolean; emitEvent?: boolean }) {
    super.patchValue(entity, options);
  }
}

export abstract class FormBatch<E, C extends EntityControl<E>> extends FormGroup {
  protected idKey = 'id';
  private active = new BehaviorSubject<string>(null);
  public active$ = this.active.asObservable();

  abstract createControl(entity: Partial<E>): FormGroup;

  // Read
  public selectAll(): Observable<Partial<E[]>> {
    return this.valueChanges.pipe(
      startWith(this.value),
      filter(entities => !!entities),
      map(entities => Object.keys(entities).map(key => entities[key]))
    );
  }

  public getAll(): E[] {
    return Object.values(this.value);
  }

  public selectActiveForm(): Observable<FormParty<C>> {
    return this.active$.pipe(
      map(active => this.get(active) as FormParty<C>)
    );
  }

  // Write
  public add(entity: Partial<E>) {
    const id = entity[this.idKey];
    const control = this.createControl(entity);
    super.addControl(id, control);
  }

  public setActive(id: string) {
    this.active.next(id);
  }

  public upsertValue(
    value: E[],
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    value.forEach(newValue => {
      // If there is a form already patch it
      if (this.get(newValue[this.idKey])) {
        this.get(newValue[this.idKey]).patchValue(newValue, {
          onlySelf: false,
          emitEvent: options.emitEvent
        });
        // Else create one
      } else {
        this.add(newValue);
      }
    });
    // If there is more value than form controls, remove it.
    Object.keys(this.value).forEach(key => {
      if (!value.find(newValue => newValue[this.idKey] === key)) this.removeControl(key);
    });
  }
}

// TODO: remove it
// type BatchControl<E = any> = {
//   [key in keyof Partial<E>]: AbstractControl;
// }


// class BatchTest<C extends BatchControl<E>, E> {
//   selectActiveForm(): Observable<FormEntity<C>>;
//   selectAll(): Observable<Partial<E>[]>;
// }



// function getControl() {
//   return {
//     name: new FormControl(''),
//     list: new FormArray([])
//   }
// }

// interface MyMovie {
//   id: string;
//   name: string;
//   list: string[];
//   displayName: string;
// }

// type MyControl = ReturnType<typeof getControl>;
// const form = new BatchTest<MyControl, MyMovie>();

// form.selectActiveForm().subscribe(formEntity => formEntity.get('name'));
