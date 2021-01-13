// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';

// RxJs
import { BehaviorSubject } from 'rxjs';
import { ConsentsService } from '../../../../../../consents/src/lib/+state/consents.service';

@Component({
  selector: 'movie-form-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormStartTunnelComponent {

  public loadingTunnel = new BehaviorSubject(false);

  constructor(private movieService: MovieService, private consentsService: ConsentsService, private router: Router) { }

  async navigateToTunnel() {
    this.loadingTunnel.next(true);
    try {
      const { id } = await this.movieService.create();
      this.router.navigate(['/c/o/dashboard/tunnel/movie/', id]);
    } catch (err) {
      this.loadingTunnel.next(false);
      console.error(err);
    }
  }

  async navigateToTunnel2() {

   await this.consentsService.createConsent('access | share','ip', 'docId');
   return "Consent succefully created !";

  }
}
