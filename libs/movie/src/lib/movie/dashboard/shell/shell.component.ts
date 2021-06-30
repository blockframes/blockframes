import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, Inject, Directive } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { combineLatest, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { MovieQuery, MovieService } from '@blockframes/movie/+state';
import { FORMS_CONFIG, ShellConfig } from '../../form/movie.shell.interfaces';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getAppName, getCurrentApp, getMovieAppAccess } from '@blockframes/utils/apps';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { storeStatus, StoreStatus } from '@blockframes/utils/static-model';

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
  private sub: Subscription;
  movie$ = this.query.selectActive();

  public appName = getCurrentApp(this.routerQuery);

  @Input() routes: RouteDescription[];

  constructor(
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private query: MovieQuery,
    private routerQuery: RouterQuery,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private router: Router
  ) { }

  ngOnInit() {
    const obs = Object.keys(this.configs).map(name => this.configs[name].onInit()).flat();
    this.sub = combineLatest(obs).subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
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

  removeAppAccess() {
    const movie = this.query.getActive();
    const appsName = getMovieAppAccess(movie).map(a => getAppName(a).label);
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: `You are about to delete ${movie.title.international} permanently.`,
        subtitle: `This Title will still be available on <i>${appsName.join(', ')}</i>.<br/> If you wish to proceed, please type "DELETE" in the field below.`,
        confirmationWord: 'delete',
        confirmButtonText: 'delete title',
        cancelButtonText: 'keep title',
        onConfirm: async () => {
          await this.movieService.update(movie.id, movie => ({
            ...movie,
            app: {
              ...movie.app,
              [this.appName]: {
                ...movie.app[this.appName],
                access: false
              }
            }
          }));

          const ref = this.snackBar.open('Title deleted.', '', { duration: 4000 });
          ref.afterDismissed().subscribe(() => this.router.navigate(['/c/o/dashboard/title']));
        }
      }
    })
  }

  async updateStatus(status: StoreStatus, message?: string) {
    const movie = this.query.getActive();
    await this.movieService.update(movie.id, movie => ({
      ...movie,
      app: {
        ...movie.app,
        [this.appName]: {
          ...movie.app[this.appName],
          status: status
        }
      }
    }));

    if (message) {
      this.snackBar.open(message, '', { duration: 4000 });
    } else {
      this.snackBar.open(`Title ${storeStatus[status]}.`, '', { duration: 4000 });
    }
  }
}


