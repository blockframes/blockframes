import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { OrganizationQuery } from '../../+state/organization.query';
import { OrganizationService } from '../../+state/organization.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'organization-feedback',
  templateUrl: './organization-feedback.component.html',
  styleUrls: ['./organization-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFeedbackComponent implements OnInit, OnDestroy {
  /** The organization status should be `accepted' before we can move on to the app */
  public canMoveOn: Observable<boolean>;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private service: OrganizationService,
    private query: OrganizationQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscription = this.service.syncQuery().subscribe();
    this.canMoveOn = this.query.isAccepted$;
  }

  public async removeOrganization() {
    try {
      await this.service.removeOrganization();
      this.snackBar.open('Your request to create an organization has been canceled.', 'close', { duration: 2000 });
      return this.router.navigate(['../']);
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public navigate() {
    this.router.navigate(['../../layout']);
  }
}
