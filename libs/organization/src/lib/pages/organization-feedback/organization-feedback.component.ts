import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationStatus } from '../../+state/organization.model';
import { OrganizationQuery } from '../../+state/organization.query';
import { OrganizationService } from '../../+state/organization.service';

@Component({
  selector: 'organization-feedback',
  templateUrl: './organization-feedback.component.html',
  styleUrls: ['./organization-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFeedbackComponent implements OnInit {
  /** The organization status should be `accepted' before we can move on to the app */
  public canMoveOn: Observable<boolean>;

  constructor(
    private router: Router,
    private service: OrganizationService,
    private query: OrganizationQuery
  ) {}

  ngOnInit(): void {
    this.service.sync();
    this.canMoveOn = this.query.status$.pipe(map(status => status === OrganizationStatus.accepted));
  }

  public navigate() {
    this.router.navigate(['../../layout']);
  }
}
