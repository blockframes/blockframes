import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { MovieQuery, MovieService } from '@blockframes/movie/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getAppName, getCurrentApp, getMovieAppAccess } from '@blockframes/utils/apps';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { storeStatus, StoreStatus } from '@blockframes/utils/static-model';

@Component({
  selector: 'actions-dashboard-shell',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardActionsShellComponent {
  movie$ = this.query.selectActive();

  public appName = getCurrentApp(this.routerQuery);
  public org$ = this.orgQuery.selectActive();

  constructor(
    private query: MovieQuery,
    private routerQuery: RouterQuery,
    private orgQuery: OrganizationQuery,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private movieService: MovieService,
    private router: Router
  ) { }

  removeAppAccess() {
    const movie = this.query.getActive();
    const appsName = getMovieAppAccess(movie).map(a => getAppName(a).label);
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: `You are about to delete ${movie.title.international} permanently.`,
        subtitle: `This Title will still be available on <i>${appsName.join(', ')}</i>.<br/> If you wish to proceed, please type "DELETE" in the field below.`,
        confirmationWord: 'delete',
        confirmButtonText: 'delete Title',
        cancelButtonText: 'keep Title',
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

          const ref = this.snackbar.open('Title deleted.', '', { duration: 4000 });
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
      this.snackbar.open(message, '', { duration: 4000 });
    } else {
      this.snackbar.open(`Title ${storeStatus[status]}.`, '', { duration: 4000 });
    }
  }
}
