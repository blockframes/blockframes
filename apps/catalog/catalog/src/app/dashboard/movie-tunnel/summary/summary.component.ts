import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { FormGroup, FormArray } from '@angular/forms';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import mergeDeep from '@blockframes/utils/helpers';

@Component({
  selector: 'catalog-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent {
  form = this.tunnel.form;

  constructor(
    private tunnel: MovieTunnelComponent,
    private router: Router,
    private route: ActivatedRoute,
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }
  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

  public async submit() {
    if (this.form.valid) {
      const movie = this.form.value;
      movie.main.storeConfig.status = 'submitted';
      await this.service.update(mergeDeep(this.query.getActive(), movie));
      this.form.markAsPristine();
      const ref = this.snackBar.open('Movie Submitted !!', '', { duration: 1000 });
      ref.afterDismissed().subscribe(_ => {
        const movieId = this.query.getActiveId();
        this.router.navigate(['../../../../titles', movieId, 'details'], { relativeTo: this.route })
      })
    } else {
      // Log the invalid forms
      console.error(this.findInvalidControlsRecursive(this.form))
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
