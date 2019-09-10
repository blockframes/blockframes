import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export abstract class FormRepertory<E> extends FormGroup {
  protected idKey = 'id';
  private active = new BehaviorSubject<string>(null);
  public active$ = this.active.asObservable();

  abstract createControl(entity: Partial<E>): FormGroup;

  // Read
  public selectAll(): Observable<E[]> {
    return this.valueChanges.pipe(
      filter(entities => Object.keys(entities).length > 0),
      map(entities => Object.keys(entities).map(key => entities[key]))
    );
  }

  public getAll(): E[] {
    return Object.values(this.value);
  }

  public selectActive(): Observable<AbstractControl> {
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

  public patchValue(
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
          onlySelf: true,
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
