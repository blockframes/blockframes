import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable, } from 'rxjs';
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
export class TitleMarketplaceShellComponent {
  public movie$: Observable<Movie>;
  public navClicked = false;

  @Input() routes: RouteDescription[];
  @ViewChild('main') main: ElementRef<HTMLDivElement>;

  constructor(
    private movieQuery: MovieQuery,
    public router: Router,
    public routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }

  scrollIntoView() {
    /* Don't want to trigger the animation when the user just arrived on the page */
    if (this.navClicked) {
      this.main.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
