import { FormGroup } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter, startWith } from 'rxjs/operators';
import { EntityControl, FormEntity } from './entity.form';

export abstract class FormBatch<E, C extends EntityControl<E>> extends FormGroup {
  protected idKey = 'id';
  private active = new BehaviorSubject<string>(null);
  public active$ = this.active.asObservable();

  abstract createControl(entity: Partial<E>): FormEntity<C>;

  get(path: string): FormEntity<C> {
    return super.get(path) as FormEntity<C>;
  }

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

  public selectActiveForm(): Observable<FormEntity<C>> {
    return this.active$.pipe(
      map(active => this.get(active))
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
