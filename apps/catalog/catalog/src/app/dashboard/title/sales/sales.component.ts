import { Component, OnInit } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.model';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class TitleSalesComponent implements OnInit {

  public movieAnalytics: Observable<MovieAnalytics>;

  constructor(private movieService: MovieService) { }

  ngOnInit() {
    this.movieAnalytics = this.movieService.getMovieAnalytics();
  }
}
