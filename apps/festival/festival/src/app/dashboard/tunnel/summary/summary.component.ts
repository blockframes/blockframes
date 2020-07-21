import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, MovieQuery, Movie } from '@blockframes/movie/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { FormGroup, FormArray } from '@angular/forms';
import { getMoviePublishStatus, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { mergeDeep } from '@blockframes/utils/helpers';
import { map } from 'rxjs/operators';

@Component({
  selector: 'festival-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent {
  form = this.tunnel.form;
  isPublished$ = this.query.selectActive(movie => movie.main.storeConfig.status).pipe(
    map(status => status === 'accepted' || status === 'submitted')
  )

  constructor(
    private tunnel: MovieTunnelComponent,
    private router: Router,
    private route: ActivatedRoute,
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private routerQuery: RouterQuery
  ) { }

  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

  public async submit() {
    if (this.form.valid) {
      const movie: Movie = mergeDeep(this.query.getActive(), this.form.value);
      const currentApp = getCurrentApp(this.routerQuery);
      movie.main.storeConfig.status = getMoviePublishStatus(currentApp); // @TODO (#2765)
      movie.main.storeConfig.appAccess.festival = true;
      await this.service.update(movie.id, movie);
      this.form.markAsPristine();
      const ref = this.snackBar.open('Movie Online !!', '', { duration: 1000 });
      ref.afterDismissed().subscribe(_ => {
        const movieId = this.query.getActiveId();
        this.router.navigate(['../../../../title', movieId, 'details'], { relativeTo: this.route })
      })
    } else {
      // Log the invalid forms
      /* console.error(this.findInvalidControlsRecursive(this.form)) */
      this.snackBar.open('Fill all mandatory fields before submitting', '', { duration: 2000 });
    }
  }

  /* Utils function to get the list of invalid form. Not used yet, but could be useful later */
  public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control.invalid) {
          invalidControls.push(field);
        }
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }
}
