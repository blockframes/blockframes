// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

// Blockframes
import { createReleaseYear, Movie, MovieService } from '@blockframes/movie/+state';
import { App } from '@blockframes/utils/apps';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

// RxJs
import { BehaviorSubject } from 'rxjs';


const predefinedTitleConfig: Record<App, Partial<Movie>> = {
  catalog: {
    productionStatus: 'released',
    runningTime: { status: 'confirmed' },
    release: createReleaseYear({ status: 'confirmed' })
  },
  festival: {},
  financiers: {},
  crm: {}
}

@Component({
  selector: 'movie-form-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormStartTunnelComponent {
  public loadingTunnel = new BehaviorSubject(false);
  public currentApp = this.appGuard.currentApp;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private appGuard: AppGuard,
  ) { }

  async navigateToTunnel() {
    this.loadingTunnel.next(true);
    try {
      const app = { [this.currentApp]: { access: true } };
      const { id } = await this.movieService.create({ ...predefinedTitleConfig[this.currentApp], app });

      this.router.navigate(['/c/o/dashboard/tunnel/movie/', id]);
    } catch (err) {
      this.loadingTunnel.next(false);
      console.error(err);
    }
  }
}
