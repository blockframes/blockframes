import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, filter } from 'rxjs/operators'
import { MovieFormShellComponent } from '../shell/shell.component';
import { staticConsts } from '@blockframes/utils/static-model';
import { hasValue } from '@blockframes/utils/pipes/has-keys.pipe';
import { Subscription, Observable } from 'rxjs';
import { tap, startWith } from 'rxjs/operators'
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';


@Component({
  selector: 'movie-shooting-information',
  templateUrl: './shooting-information.component.html',
  styleUrls: ['./shooting-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShootingInformationComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  values$: Observable<string[]>;

  form = this.shell.form;
  city = new FormControl();
  disabledForm = new FormControl()

  public periods = Object.keys(staticConsts['shootingPeriod']);
  public months = Object.keys(staticConsts['months']);
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  private keys = ['completed', 'planned', 'progress'] as const;

  constructor(private shell: MovieFormShellComponent) { }

  ngOnInit() {
    this.enableForm();
    // this.values$ = this.form.shooting.controls['locations'].controls['cities'].valueChanges.pipe(
    //   startWith(this.form.shooting.controls['locations'].controls['cities'].value)
    // );
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  get shootingDateFrom() {
    return this.form.shooting.get('dates').get('planned').get('from');
  }

  get shootingDateTo() {
    return this.form.shooting.get('dates').get('planned').get('to');
  }

  enableForm() {
    this.sub = this.disabledForm.valueChanges.pipe(
      distinctUntilChanged(),
      filter(value => !!value),
    ).subscribe(value => this.activate(value));

    const active = this.keys.find(key => hasValue(this.form.shooting.value.dates[key]));
    this.disabledForm.setValue(active);
  }

  private activate(activeKey: 'completed' | 'planned' | 'progress') {
    for (const key of this.keys) {
      if (key === activeKey) {
        this.form.shooting.get('dates').get(key).enable();
      } else {
        this.form.shooting.get('dates').get(key).disable();
        this.form.shooting.get('dates').get(key).reset();
      }
    }
  }

  public add(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.form.shooting.controls['locations'].controls['cities'].add(value);
    this.city.reset();
  }

  public remove(i: number): void {
    this.form.shooting.controls['locations'].controls['cities'].removeAt(i);
  }

}
