import { Component, OnInit, ChangeDetectionStrategy, HostBinding, Directive, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';

@Component({
  selector: 'title-marketplace-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieShellComponent implements OnInit {
  @HostBinding('@scaleIn') animPage;
  public movie$: Observable<Movie>;

  // TODO add RouteDescrtipion interface from PR #3663 to routes variable
  @Input() routes;

  public isEnoughPicturesThen(min: number) {
    return this.movieQuery.selectActive().pipe(
      map(movie => Object.values(movie.promotional.still_photo).length > min)
    );
  }

  constructor(
    private movieQuery: MovieQuery,
    public router: Router,
    public routerQuery: RouterQuery,
    ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }
}

@Directive({
  selector: 'movie-header, [movieHeader]',
  host: { class: 'movie-header' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeader { }
