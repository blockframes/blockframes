import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormArray } from '@angular/forms';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

@Component({
  selector: 'festival-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit, OnDestroy {
  form = this.shell.getForm('movie');
  subscription: Subscription;
  missingFields: string[] = [];
  invalidFields: string[] = [];
  isPublished$ = this.query.selectActive(movie => movie.storeConfig.status).pipe(
    map(status => status === 'accepted' || status === 'submitted')
  )

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }

  ngOnInit(): void {
    this.findInvalidControlsRecursive(this.form);
    this.subscription = this.form.valueChanges.subscribe(() => this.findInvalidControlsRecursive(this.form));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async submit() {
    if (this.form.valid) {
      await this.shell.update({ publishing: true });
      const ref = this.snackBar.open('Movie Online !!', '', { duration: 1000 });
      ref.afterDismissed().subscribe(_ => {
        this.router.navigate(['c/o/dashboard/title', this.query.getActiveId()])
      })
    } else {
      // Log the invalid forms
      this.snackBar.open('Fill all mandatory fields before submitting', '', { duration: 2000 });
    }
  }

  /* Utils function to get the list of invalid form. Not used yet, but could be useful later */
  public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray) {
    this.missingFields = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (!control.value) {
          this.missingFields.push(field);
        }
        if (control instanceof FormArray || control instanceof FormGroup) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
  }
}
