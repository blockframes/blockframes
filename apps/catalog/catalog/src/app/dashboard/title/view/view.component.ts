import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MatDialog } from '@angular/material/dialog';
import { MovieService } from '@blockframes/movie/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { getAppName, getCurrentApp, getMovieAppAccess } from '@blockframes/utils/apps';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { storeStatus, StoreStatus } from '@blockframes/utils/static-model';

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit, OnDestroy {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  private sub: Subscription;

  public org$ = this.orgQuery.selectActive();
  public appName = getCurrentApp(this.routerQuery);

  navLinks: RouteDescription[] = [
    {
      path: 'activity',
      label: 'Marketplace'
    },
    {
      path: 'main',
      label: 'Main'
    },
    {
      path: 'artistic',
      label: 'Artistic'
    },
    {
      path: 'production',
      label: 'Production'
    },
    {
      path: 'additional',
      label: 'Additional',
    }
  ];

  constructor(
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    private query: MovieQuery,
    private dialog: MatDialog,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private router: Router,
    private orgQuery: OrganizationQuery
    ) {
    const titleName = this.movieQuery.getActive().title.international || 'No title'
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        event.url.includes('details')
          ? this.dynTitle.setPageTitle(`${titleName}`, 'Film Details')
          : this.dynTitle.setPageTitle(`${titleName}`, 'Marketplace Activity')
      }
    })
  }

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
