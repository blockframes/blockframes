import { Component, OnInit, ChangeDetectionStrategy, HostBinding, Directive, Input } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';

@Component({
  selector: 'title-marketplace-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieShellComponent implements OnInit {
  public movie$: Observable<Movie>;

  @Input() routes: RouteDescription[];

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

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}

// @Directive({
//   selector: 'movie-header, [movieHeader]',
//   host: { 
//     style: 'display: block; height: calc(100vh - 80px - 48px - 16px - 24px);'
//   }
// })
// // tslint:disable-next-line: directive-class-suffix
// export class MovieHeader { }
