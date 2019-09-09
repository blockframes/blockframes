import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, map, filter, tap } from 'rxjs/operators';

export abstract class FormRepertory<E> extends FormGroup {
  protected idKey = 'id';
  private active = new BehaviorSubject<string>(null);
  public active$ = this.active.asObservable();
  public valueChanges$ = this.valueChanges.pipe(startWith(this.value));

  abstract createControl(entity: Partial<E>): FormGroup;
  abstract createId(): string;

  // Read
  public selectAll(): Observable<E[]> {
    return this.valueChanges$.pipe(
      filter(entities => Object.keys(entities).length > 0),
      map(entities => Object.keys(entities).map(key => entities[key]))
    )
  }

  public getAll(): E[] {
    return Object.values(this.value)
  }

  public selectActive(): Observable<AbstractControl> {
    return combineLatest([ this.valueChanges$, this.active$ ]).pipe(
      map(([values, active]) => {
        const activeControl = this.get(active);
        return activeControl})
    );
  }

  // Write
  public add(entity: Partial<E>) {
    const id = entity[this.idKey] || this.createId();
    const control = this.createControl(entity);
    super.addControl(id, control);
  }

  public setActive(id: string) {
    this.active.next(id);
  }
}

