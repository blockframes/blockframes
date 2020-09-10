import { Component, ChangeDetectionStrategy } from '@angular/core';
/* import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormArray } from '@angular/forms';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { mergeDeep } from '@blockframes/utils/helpers';
import { getMoviePublishStatus, getCurrentApp } from '@blockframes/utils/apps';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state'; */

@Component({
  selector: 'catalog-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent {
  /*  form = this.tunnel.form;
  
  
    constructor(
      private tunnel: MovieTunnelComponent,
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
    public getPath(segment: string) {
      const { movieId } = this.route.snapshot.params;
      return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
    } */


  /* Utils function to get the list of invalid form. Not used yet, but could be useful later */
  /*   public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
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
    } */
}
