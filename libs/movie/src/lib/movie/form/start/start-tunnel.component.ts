// Angular
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Router } from '@angular/router';

// Blockframes
import { createReleaseYear, Movie } from '@blockframes/shared/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';

// RxJs
import { BehaviorSubject } from 'rxjs';

const predefinedTitleConfig: Record<App, Partial<Movie>> = {
  catalog: {
    productionStatus: 'released',
    runningTime: { status: 'confirmed' },
    release: createReleaseYear({ status: 'confirmed' }),
  },
  festival: {},
  financiers: {},
  crm: {},
};

@Component({
  selector: 'movie-form-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormStartTunnelComponent {
  public loadingTunnel = new BehaviorSubject(false);

  constructor(private movieService: MovieService, private router: Router, @Inject(APP) private app: App) {}

  async navigateToTunnel() {
    this.loadingTunnel.next(true);
    try {
      const app = { [this.app]: { access: true } };
      const { id } = await this.movieService.create({ ...predefinedTitleConfig[this.app], app });

      this.router.navigate(['/c/o/dashboard/tunnel/movie/', id]);
    } catch (err) {
      this.loadingTunnel.next(false);
      console.error(err);
    }
  }
}
