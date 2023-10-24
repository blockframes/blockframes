import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  Directive,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event, ActivatedRoute } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { firstValueFrom, Observable, of, Subscription } from 'rxjs';
import { RouteDescription, createTitleState, createVersion } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { filter, pluck, switchMap } from 'rxjs/operators';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';

@Directive({ selector: 'waterfall-cta, [waterfallCta]' })
export class WaterfallCtaDirective { }

const emptyWaterfallState = (waterfallId: string): Observable<WaterfallState> => of({
  waterfall: { state: createTitleState(waterfallId), history: [] },
  version: createVersion(),
});

@Component({
  selector: '[routes] waterfall-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardWaterfallShellComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private countRouteEvents = 1;

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );
  public movie = firstValueFrom(this.movie$);

  public waterfall$ = this.movie$.pipe(
    switchMap(movie => this.waterfallService.loadWaterfalldata(movie.id))
  );

  public state$ = this.waterfall$.pipe(
    switchMap(waterfall => {
      const waterfallId = waterfall.waterfall.id;
      const versionId = waterfall.waterfall.versions[0]?.id;
      return versionId ?
        this.waterfallService.buildWaterfall({ waterfallId, versionId }) :
        emptyWaterfallState(waterfallId);
    })
  );

  @Input() routes: RouteDescription[];
  @Input() editRoute?: string | string[];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavigationService
  ) { }

  ngOnInit() {
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

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
