import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, MovieQuery, Movie } from '@blockframes/movie/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieFormShellComponent } from '../shell/shell.component';
import { FormGroup, FormArray } from '@angular/forms';
import { getMoviePublishStatus, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { mergeDeep } from '@blockframes/utils/helpers';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-form-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSummaryComponent implements OnInit, OnDestroy {
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
    private routerQuery: RouterQuery
  ) {
  }

  ngOnInit(): void {
    this.findInvalidControlsRecursive(this.form);
    this.subscription = this.form.valueChanges.subscribe(() => this.findInvalidControlsRecursive(this.form));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get stillPhoto() {
    return this.form.promotional.get('still_photo');
  }

  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

  public objectHasNoValue(valueAsRecord: Record<any, any>) {
    try {
      const objectToCheck = valueAsRecord.value;
      const keys = Object.keys(objectToCheck);
      return keys.length === 0 ? true : keys.some(key => !objectToCheck[key]);
    } catch (error) {
      console.warn(error);
      return true;
    }
  }

  public async submit() {
    if (this.form.valid) {
      const movie: Movie = mergeDeep(this.query.getActive(), this.form.value);
      const currentApp = getCurrentApp(this.routerQuery);
      movie.storeConfig.status = getMoviePublishStatus(currentApp); // @TODO (#2765)
      movie.storeConfig.appAccess.festival = true;
      await this.service.update(movie.id, movie);
      this.form.markAsPristine();
      const ref = this.snackBar.open('Movie Online !!', '', { duration: 1000 });
      ref.afterDismissed().subscribe(_ => {
        const movieId = this.query.getActiveId();
        this.router.navigate(['../../../../title', movieId, 'details'], { relativeTo: this.route })
      })
    } else {
      // Log the invalid forms
      this.snackBar.open('Fill all mandatory fields before submitting', '', { duration: 2000 });
    }
  }

  /* Utils function to get the list of invalid form. Not used yet, but could be useful later */
  public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray) {
    this.invalidFields = [];
    this.missingFields = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control.invalid) {
          this.invalidFields.push(field);
        }
        if (!control.value) {
          this.missingFields.push(field);
        }
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
  }
}
