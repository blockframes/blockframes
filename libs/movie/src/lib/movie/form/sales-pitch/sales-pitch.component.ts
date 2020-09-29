import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { staticConsts } from '@blockframes/utils/static-model';

@Component({
  selector: 'movie-form-sales-pitch',
  templateUrl: './sales-pitch.component.html',
  styleUrls: ['./sales-pitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesPitchComponent {
  form = this.shell.form;
  public staticGoals = Object.keys(staticConsts['socialGoals']);

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.sales_pitch/`;
  }

  get salesPitch() {
    return this.form.promotional.get('salesPitch');
  }

  get audience() {
    return this.form.get('audience');
  }
}
