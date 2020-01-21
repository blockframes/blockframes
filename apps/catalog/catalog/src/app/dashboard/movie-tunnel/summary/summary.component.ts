import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movieform/movie.form';

@Component({
  selector: 'catalog-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TunnelSummaryComponent {

  constructor(private form: MovieForm) { }
}
