import { Component, ChangeDetectionStrategy, Directive, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { Movie, storeStatus, StoreStatus, App, appName, getMovieAppAccess } from '@blockframes/model';
import { MovieService } from '../../service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP } from '@blockframes/utils/routes/utils';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Directive({ selector: 'movie-action-menu, [movieActionMenu]' })
export class MovieActionMenuDirective { }

@Component({
  selector: 'actions-dashboard-shell',
  exportAs: 'actionsDashboardShell',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardActionsShellComponent {
  @Input() movie: Movie;

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private movieService: MovieService,
    private router: Router,
    @Inject(APP) public app: App
  ) { }

  removeAppAccess() {
    const appsName = getMovieAppAccess(this.movie)
      .filter((value) => value !== this.app)
      .map((a) => appName[a]);
    const subtitle = appsName.length
      ? `This Title will still be available on <i>${appsName.join(', ')}</i>.<br/>`
      : '';

    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: `You are about to delete ${this.movie.title.international} permanently.`,
        subtitle: `${subtitle}If you wish to proceed, please type "DELETE" in the field below.`,
        confirmationWord: 'delete',
        confirmButtonText: 'delete Title',
        cancelButtonText: 'keep Title',
        onConfirm: async () => {
          await this.movieService.update(this.movie.id, (movie) => ({
            ...movie,
            app: {
              ...movie.app,
              [this.app]: {
                ...movie.app[this.app],
                access: false,
              },
            },
          }));

          const ref = this.snackbar.open('Title deleted.', '', { duration: 4000 });
          ref.afterDismissed().subscribe(() => this.router.navigate(['/c/o/dashboard/title']));
        }
      })
    });
  }

  async updateStatus(status: StoreStatus, message?: string) {
    await this.movieService.updateStatus(this.movie.id, status);
    this.snackbar.open(message || `Title ${storeStatus[status]}.`, '', { duration: 4000 });
  }
}
