// Angular
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { App, Movie, storeStatus, StoreStatus } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';

@Component({
  selector: 'dashboard-movie-table-actions',
  templateUrl: './movie-table-actions.component.html',
  styleUrls: ['./movie-table-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableActionsComponent {
  @Input() movie: Movie
  @Input() app: App

  constructor(
    private service: MovieService,
    private snackbar: MatSnackBar,
  ) { }

  async updateStatus(movie: Movie, status: StoreStatus, message?: string) {
    await this.service.updateStatus(movie.id, status);
    this.snackbar.open(message || `Title ${storeStatus[status]}.`, '', { duration: 4000 });
  }
}
