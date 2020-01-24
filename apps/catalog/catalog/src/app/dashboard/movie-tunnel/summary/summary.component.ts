import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movieform/movie.form';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'catalog-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent {
  constructor(
    public form: MovieForm,
    private route: ActivatedRoute
  ) {}

  public getPath(segment: string) {
    const movieId = this.route.snapshot.params.movieId;
    return `/c/o/dashboard/movie-tunnel/${movieId}/${segment}`;
  }
}
