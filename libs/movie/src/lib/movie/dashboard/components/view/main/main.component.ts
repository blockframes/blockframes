// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie] movie-view-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewMainComponent {

  @Input() movie: MovieForm;

  constructor(private route: ActivatedRoute) {}

  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }
}
