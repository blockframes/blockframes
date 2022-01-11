import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery } from '@blockframes/auth/+state';
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

  requestStatus = new BehaviorSubject<RequestStatus>('available');
  screeningRequest: Record<RequestStatus, string> = {
    available: 'Ask for a Screening',
    sending: 'Sending...',
    sent: 'Screening requested'
  };

  constructor(
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
    private snackbar: MatSnackBar
  ) {}

  async requestScreening() {
    this.requestStatus.next('sending');
    const f = this.functions.httpsCallable('requestScreening');
    await f({ movieId: this.movieId, uid: this.authQuery.userId }).toPromise();
    this.requestStatus.next('sent');

    this.snackbar.open('Screening request successfully sent', '', { duration: 3000 });
  }
}

