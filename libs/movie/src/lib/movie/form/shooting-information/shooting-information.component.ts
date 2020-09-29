import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { startWith, tap } from 'rxjs/operators'
import { MovieFormShellComponent } from '../shell/shell.component';
import { staticConsts } from '@blockframes/utils/static-model';


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

  public completedDisabled = true;
  public progressDisabled = true;
  public periods = Object.keys(staticConsts['shootingPeriod']);

  constructor(private shell: MovieFormShellComponent) { }

  ngOnInit() {
    this.enableForm();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get shootingDateFrom() {
    return this.form.shooting.get('dates').get('planned').get('from');
  }

  get shootingDateTo() {
    return this.form.shooting.get('dates').get('planned').get('to');
  }

  enableForm() {
    this.sub = this.disabledForm.valueChanges.pipe(
      startWith(this.disabledForm.value),
      tap(value => {
        switch (value) {
          case 'completedDisabled': {
            this.form.shooting.get('dates').get('progress').reset();
            this.form.shooting.get('dates').get('planned').reset();
            this.shootingDateFrom.get('period').disable();
            this.shootingDateTo.get('period').disable();
            this.shootingDateFrom.get('month').disable();
            this.shootingDateFrom.get('year').disable();
            this.shootingDateTo.get('month').disable();
            this.shootingDateTo.get('year').disable();
            this.completedDisabled = false;
            this.progressDisabled = true;
            break;
          }
          case 'progressDisabled': {
            this.form.shooting.get('dates').get('planned').reset();
            this.form.shooting.get('dates').get('completed').reset();
            this.shootingDateFrom.get('period').disable();
            this.shootingDateTo.get('period').disable();
            this.shootingDateFrom.get('month').disable();
            this.shootingDateFrom.get('year').disable();
            this.shootingDateTo.get('month').disable();
            this.shootingDateTo.get('year').disable();
            this.completedDisabled = true;
            this.progressDisabled = false;
            break;
          }
          case 'plannedDisabled': {
            this.form.shooting.get('dates').get('completed').reset();
            this.form.shooting.get('dates').get('progress').reset();
            this.shootingDateFrom.get('period').enable();
            this.shootingDateTo.get('period').enable();
            this.shootingDateFrom.get('month').enable();
            this.shootingDateFrom.get('year').enable();
            this.shootingDateTo.get('month').enable();
            this.shootingDateTo.get('year').enable();
            this.completedDisabled = true;
            this.progressDisabled = true;
            break;
          }
          case null: {
            this.shootingDateFrom.get('period').disable();
            this.shootingDateFrom.get('month').disable();
            this.shootingDateFrom.get('year').disable();
            this.shootingDateTo.get('month').disable();
            this.shootingDateTo.get('year').disable();
            this.shootingDateTo.get('period').disable();
            break;
          }
        }
      })
    ).subscribe();
  }

}
