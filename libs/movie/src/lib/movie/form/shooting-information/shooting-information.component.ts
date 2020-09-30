import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, tap } from 'rxjs/operators'
import { MovieFormShellComponent } from '../shell/shell.component';
import { staticConsts } from '@blockframes/utils/static-model';
import { hasValue } from '@blockframes/utils/pipes/has-keys.pipe';

@Component({
  selector: 'movie-shooting-information',
  templateUrl: './shooting-information.component.html',
  styleUrls: ['./shooting-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShootingInformationComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  form = this.shell.form;
  disabledForm = new FormControl()

  public periods = Object.keys(staticConsts['shootingPeriod']);

  public months = Object.keys(staticConsts['months']);

  constructor(private shell: MovieFormShellComponent) { }

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
      tap(value => {
        switch (value) {
          case 'completed': {
            this.form.shooting.get('dates').get('completed').enable();
            this.form.shooting.get('dates').get('progress').reset();
            this.form.shooting.get('dates').get('progress').disable();
            this.handleStateOfShootingDateForm('disable');
            break;
          }
          case 'progress': {
            this.form.shooting.get('dates').get('progress').enable();
            this.form.shooting.get('dates').get('completed').disable();
            this.form.shooting.get('dates').get('completed').reset();
            this.handleStateOfShootingDateForm('disable')
            break;
          }
          case 'planned': {
            this.form.shooting.get('dates').get('completed').disable();
            this.form.shooting.get('dates').get('completed').reset();
            this.form.shooting.get('dates').get('progress').disable();
            this.form.shooting.get('dates').get('progress').reset();
            this.handleStateOfShootingDateForm('enable')
            break;
          }
          case null || undefined: {
            this.form.shooting.get('dates').get('completed').disable();
            this.form.shooting.get('dates').get('progress').disable();
            this.handleStateOfShootingDateForm('disable');
            break;
          }
        }
      })
    ).subscribe();
    const active = ['completed', 'planned', 'progress'].find(key => hasValue(this.form.shooting.value.dates[key]));
    this.disabledForm.setValue(active);
  }


  private handleStateOfShootingDateForm(state: 'disable' | 'enable') {
    this.shootingDateFrom.get('period')[state]();
    this.shootingDateFrom.get('month')[state]();
    this.shootingDateFrom.get('year')[state]();
    this.shootingDateTo.get('month')[state]();
    this.shootingDateTo.get('year')[state]();
    this.shootingDateTo.get('period')[state]();
    if (state === 'disable') {
      this.shootingDateFrom.get('period').reset();
      this.shootingDateFrom.get('month').reset();
      this.shootingDateFrom.get('year').reset();
      this.shootingDateTo.get('month').reset();
      this.shootingDateTo.get('year').reset();
      this.shootingDateTo.get('period').reset();
    }
  }
}
