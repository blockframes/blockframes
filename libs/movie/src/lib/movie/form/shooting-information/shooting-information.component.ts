import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators'
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
  public plannedDisabled = true;
  public periods = Object.keys(staticConsts['shootingPeriod']);

  constructor(private shell: MovieFormShellComponent) {}

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
      tap(value => {
        switch(value) {
          case 'completedDisabled': {
            this.form.shooting.get('dates').get('progress').reset();
            this.form.shooting.get('dates').get('planned').reset();
            this.completedDisabled = false;
            this.progressDisabled = true;
            this.plannedDisabled = true;
            break;
          }
          case 'progressDisabled': {
            this.form.shooting.get('dates').get('planned').reset();
            this.form.shooting.get('dates').get('completed').reset();
            this.completedDisabled = true;
            this.progressDisabled = false;
            this.plannedDisabled = true;
            break;
          }
          case 'plannedDisabled': {
            this.form.shooting.get('dates').get('completed').reset();
            this.form.shooting.get('dates').get('progress').reset();
            this.completedDisabled = true;
            this.progressDisabled = true;
            this.plannedDisabled = false;
            break;
          }
        }
      })
    ).subscribe();
  }

}
