import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, Inject, Directive } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { combineLatest, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { FORMS_CONFIG, ShellConfig } from '../../form/movie.shell.interfaces';
import { filter, pluck, switchMap, tap } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/utils/apps';

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
    tap(movie => this.movie = movie)
  );

  public movie: Movie;

  @Input() routes: RouteDescription[];

  constructor(
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    @Inject(APP) public app: App,
    private movieService: MovieService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    console.log('shell onInit()')

    const obs = this.route.params.pipe(
      pluck('movieId'),
      switchMap(movieId => Object.keys(this.configs).map(name => this.configs[name].onInit(movieId)).flat())
    ).subscribe();

    this.subs.push(obs);
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

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

}


