// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';

// RxJs
import { BehaviorSubject } from 'rxjs';
import { ConsentsService } from '@blockframes/consents/+state/consents.service';

@Component({
  selector: 'movie-form-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormStartTunnelComponent {

  public loadingTunnel = new BehaviorSubject(false);

  constructor(private movieService: MovieService, private consentsService: ConsentsService, private router: Router, private snackbar: MatSnackBar) { }

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

  async consent() {

   const status = await this.consentsService.createConsent('share', 'Ar293JRrE20');
   if (status === true) {
    this.snackbar.open("Consent succefully created !", 'close', { duration: 5000 });
   } else { this.snackbar.open('Consent has not been created.', 'close', { duration: 5000 }); }

  }
}
