// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieQuery, Movie } from '@blockframes/movie/+state';

@Component({
  selector: 'catalog-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements OnInit {
  public form: MovieForm;

  constructor(private movieQuery: MovieQuery) { }

  ngOnInit() {
    this.form = new MovieForm(this.movieQuery.getActive());
    /* In catalog app every movie is released */
    this.form.get('productionStatus').setValue('released');
  }
}
