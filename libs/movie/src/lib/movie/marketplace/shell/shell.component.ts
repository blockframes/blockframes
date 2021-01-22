import { Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
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
export class TitleMarketplaceShellComponent implements OnInit, AfterViewInit {
  public movie$: Observable<Movie>;

  @Input() routes: RouteDescription[];
  @ViewChild('main') main: ElementRef<HTMLDivElement>;


  private routerSub: Subscription;

  constructor(
    private movieQuery: MovieQuery,
    public router: Router,
    public routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }

  onDone() { this.main.nativeElement.scrollIntoView({ behavior: 'smooth' }); }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  ngOnDestroy() {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }
}
