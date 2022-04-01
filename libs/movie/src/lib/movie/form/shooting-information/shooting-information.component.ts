import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { MovieFormShellComponent } from '../shell/shell.component';
import { shootingPeriod, months } from '@blockframes/shared/model';
import { hasValue } from '@blockframes/utils/pipes/has-keys.pipe';
import { Subscription } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-shooting-information',
  templateUrl: './shooting-information.component.html',
  styleUrls: ['./shooting-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormShootingInformationComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  form = this.shell.getForm('movie');
  disabledForm = new FormControl();
  public periods = Object.keys(shootingPeriod);
  public months = Object.keys(months);
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  private keys = ['completed', 'planned', 'progress'] as const;

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Shooting Information')
  }

  ngOnInit() {
    this.enableForm();
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

  public add(event: MatChipInputEvent, control: FormControl): void {
    const state = control.value;

    // Add new value to the array
    state.push(event.value.trim());
    control.setValue(state);

    // Reset the input
    event.input.value = '';
  }

  public remove(i: number, control: FormControl): void {
    const shadowValue = control.value.length === 0 ? [] : control.value.slice();
    shadowValue.splice(i, 1);

    control.setValue(shadowValue);
  }
}
