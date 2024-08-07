import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  Inject,
  Directive,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event, ActivatedRoute } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { firstValueFrom, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/model';
import { App } from '@blockframes/model';
import { MovieService } from '../../service';
import { FORMS_CONFIG, ShellConfig } from '../../form/movie.shell.interfaces';
import { filter, pluck, switchMap } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { NavigationService } from '@blockframes/ui/navigation.service';

@Directive({ selector: 'movie-cta, [movieCta]' })
export class MovieCtaDirective { }

@Component({
  selector: '[routes] title-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTitleShellComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private countRouteEvents = 1;
  movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  public movie = firstValueFrom(this.movie$);

  @Input() routes: RouteDescription[];
  @Input() editRoute?: string | string[];

  constructor(
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    @Inject(APP) public app: App,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavigationService
  ) { }

  async ngOnInit() {
    this.configs.movie.onInit();
    await this.configs.campaign?.onInit();

    this.sub = this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    this.navService.goBack(this.countRouteEvents, ['/c/o/dashboard/title']);
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
