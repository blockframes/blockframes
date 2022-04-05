import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { BehaviorSubject } from 'rxjs';

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
  @Input() @boolean @HostBinding('class.animated') animated: boolean;
  
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
    private snackbar: MatSnackBar
  ) {}

  async requestScreening() {
    this.animated = false;
    this.requestStatus.next('sending');
    const f = httpsCallable(this.functions,'requestScreening');
    await f({ movieId: this.movieId, uid: this.authService.uid });
    this.requestStatus.next('sent');
    this.analytics.addTitle('screeningRequested', this.movieId);
    this.snackbar.open('Screening request successfully sent', '', { duration: 3000 });
  }
}

