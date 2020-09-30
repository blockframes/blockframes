import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators'
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

  private keys = ['completed', 'planned', 'progress'] as const;

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
}
