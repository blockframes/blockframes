import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '@blockframes/movie';
import { StoreStatus } from '@blockframes/movie/movie/+state/movie.firestore';
import { MatSnackBar } from '@angular/material';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { FormGroup, FormArray } from '@angular/forms';

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
    private route: ActivatedRoute,
    private service: MovieService,
    private snackBar: MatSnackBar,
  ) {}

  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

  public async submit() {
    if (this.form.valid) {
      const { movieId } = this.route.snapshot.params;
      const movie = this.form.value;
      movie.main.storeConfig.status = StoreStatus.submitted;
      await this.service.update({id: movieId, ...movie});
      this.form.markAsPristine();
    } else {
      this.snackBar.open('Fill all mandatory fields before submitting', '', { duration: 2000 });
    }
  }

  /* Utils function to get the list of invalid form. Not used yet, but could be useful later */
  public findInvalidControlsRecursive(formToInvestigate:FormGroup|FormArray):string[] {
    const invalidControls:string[] = [];
    const recursiveFunc = (form:FormGroup|FormArray) => {
      Object.keys(form.controls).forEach(field => { 
        const control = form.get(field);
        if (control.invalid) invalidControls.push(field);
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
