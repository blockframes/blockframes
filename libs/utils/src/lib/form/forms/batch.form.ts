import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter, startWith } from 'rxjs/operators';

export abstract class FormBatch<E> extends FormGroup {
  protected idKey = 'id';
  private active = new BehaviorSubject<string>(null);
  public active$ = this.active.asObservable();

  abstract createControl(entity: Partial<E>): FormGroup;

  // Read
  public selectAll(): Observable<E[]> {
    return this.valueChanges.pipe(
      startWith(this.value),
      filter(entities => !!entities),
      map(entities => Object.keys(entities).map(key => entities[key]))
    );
  }

  public getAll(): E[] {
    return Object.values(this.value);
  }

  public selectActive(): Observable<AbstractControl> {
    return this.active$.pipe(map(active => this.get(active)));
  }

  // Write
  public switchForm(status: boolean) {
    this.disable();
    // this.getAll().forEach(form =>
    //   status ? this.get(form[this.idKey]).disable() : this.get(form[this.idKey]).enable()
    // );
  }

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
