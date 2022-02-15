import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, Inject, Directive } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { combineLatest, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { FORMS_CONFIG, ShellConfig } from '../../form/movie.shell.interfaces';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';
import { filter, pluck, switchMap, tap } from 'rxjs/operators';

@Directive({ selector: 'movie-cta, [movieCta]' })
export class MovieCtaDirective { }

@Component({
  selector: '[routes] title-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTitleShellComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private countRouteEvents = 1;
  movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    tap(movie => this._movie = movie)
  );

  private _movie: Movie;

  public appName = getCurrentApp(this.routerQuery);

  @Input() routes: RouteDescription[];

  constructor(
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private routerQuery: RouterQuery,
    private movieService: MovieService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const obs = Object.keys(this.configs).map(name => this.configs[name].onInit()).flat();
    this.subs.push(combineLatest(obs).subscribe());
    this.subs.push(this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  goBack() {
    this.location.historyGo(-this.countRouteEvents);
  }

  getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name]?.form;
  }

  getConfig<K extends keyof ShellConfig>(name: K): ShellConfig[K] {
    return this.configs[name];
  }

  get movie() {
    return this._movie;
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

}


