// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';

// RxJs
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'movie-form-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormStartTunnelComponent {

  public loadingTunnel = new BehaviorSubject(false);

  constructor(private movieService: MovieService, private router: Router, private route: ActivatedRoute) { }

  async navigateToTunnel() {
    this.loadingTunnel.next(true);
    try {
      const { id } = await this.movieService.create();
      this.router.navigate(['../../tunnel/movie/', id], { relativeTo: this.route });
    } catch (err) {
      this.loadingTunnel.next(false);
      console.error(err);
    }
  }
}
