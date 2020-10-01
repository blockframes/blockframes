import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormArray } from '@angular/forms';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { mergeDeep } from '@blockframes/utils/helpers';
import { getMoviePublishStatus, getCurrentApp } from '@blockframes/utils/apps';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state';
import { Subscription } from 'rxjs';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

@Component({
  selector: 'festival-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit, OnDestroy {
  form = this.shell.form;
  subscription: Subscription;
  missingFields: string[] = [];
  invalidFields: string[] = [];
  isPublished$ = this.query.selectActive(movie => movie.storeConfig.status).pipe(
    map(status => status === 'accepted' || status === 'submitted')
  )

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private route: ActivatedRoute,
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery
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
      this.updateFormArraysByProdStatus();
      const movie = await this.shell.update();
      const currentApp = getCurrentApp(this.routerQuery);
      movie.storeConfig.status = getMoviePublishStatus(currentApp); // @TODO (#2765)
      movie.storeConfig.appAccess.festival = true;
      await this.service.update(movie.id, movie);
      this.form.markAsPristine();
      const ref = this.snackBar.open('Movie Online !!', '', { duration: 1000 });
      ref.afterDismissed().subscribe(_ => {
        this.router.navigate(['../', 'end'], { relativeTo: this.route })
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

  private updateFormArraysByProdStatus() {
    const prodStatusValue = this.form.productionStatus.value;
    const prodStatus = ['finished', 'released'];

    /* Directors */
    /* Cast Member */
    /* Crew Member */
    if (prodStatus.includes(prodStatusValue)) {
      this.form.directors.controls.forEach(director => director.get('status').setValue('confirmed'))
      this.form.cast.controls.forEach(cast => cast.get('status').setValue('confirmed'))
      this.form.crew.controls.forEach(crew => crew.get('status').setValue('confiremd'));
    }
  }
}
