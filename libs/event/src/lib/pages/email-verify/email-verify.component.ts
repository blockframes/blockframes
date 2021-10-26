import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthQuery, AuthStore } from '@blockframes/auth/+state';
import { EventQuery } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { Subscription } from 'rxjs';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'event-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailVerifyComponent implements OnInit, OnDestroy {

  private invitationId: string;
  private sub: Subscription;
  public eventId: string;
  constructor(
    private authStore: AuthStore,
    private authQuery: AuthQuery,
    private eventQuery: EventQuery,
    private router: Router,
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    private snackBar: MatSnackBar,
    @Optional() private intercom: Intercom,
  ) { }

  async ngOnInit() {
    const { i, code } = this.route.snapshot.queryParams;
    this.eventId = this.route.snapshot.params.eventId;
    this.invitationId = i;
    if (code) {
      await this.invitationService.validateInvitationOnlyEventAccess(code, this.invitationId);
    }

    if (this.invitationId) {
      this.sub = this.invitationService.valueChanges(this.invitationId).subscribe(i => {
        if (i.accessAllowed) {
          //Update store with from value
          this.authStore.updateAnonymousCredentials({ emailVerified: true });
          // Redirect user to event view
          this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
        }
      });
    } else {
      this.snackBar.open('Missing invitation parameter', 'close', { duration: 5000 });
    }
  }

  ngOnDestroy() {
    if (this.invitationId) {
      this.sub.unsubscribe();
    }
  }

  async click() {
    await this.invitationService.requestInvitationOnlyEventAccess(this.authQuery.anonymousCredentials.email, this.invitationId, this.eventQuery.getActiveId());
    console.log('mail sent !');
  }

  openIntercom() {
    this.intercom.show();
  }

  refresh() {
    window.location.reload();
  }
}
