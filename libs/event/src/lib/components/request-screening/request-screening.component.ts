import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/service';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { BehaviorSubject, take } from 'rxjs';
import { MovieService } from '@blockframes/movie/service';

type RequestStatus = 'available' | 'sending' | 'sent';

@Component({
  selector: '[movieId] event-request-screening',
  templateUrl: './request-screening.component.html',
  styleUrls: ['./request-screening.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestScreeningComponent {

  @Input() movieId: string;
  @Input() @boolean iconOnly: boolean;
  
  requestStatus = new BehaviorSubject<RequestStatus>('available');
  screeningRequest: Record<RequestStatus, string> = {
    available: 'Ask for a Screening',
    sending: 'Sending...',
    sent: 'Screening requested'
  };

  constructor(
    private authService: AuthService,
    private functions: Functions,
    private analytics: AnalyticsService,
    private snackbar: MatSnackBar,
    private titleService: MovieService
  ) {}

  async requestScreening() {
    this.requestStatus.next('sending');
    const f = httpsCallable(this.functions,'requestScreening');
    await f({ movieId: this.movieId, uid: this.authService.uid });
    this.requestStatus.next('sent');
    const title = await this.titleService.valueChanges(this.movieId).pipe(take(1)).toPromise();
    this.analytics.addTitle('screeningRequested', title);
    this.snackbar.open('Screening request successfully sent', '', { duration: 3000 });
  }
}

