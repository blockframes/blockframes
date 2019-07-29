import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import { FireQuery } from '@blockframes/utils';
import { OrganizationStatus } from '../../+state/organization.model';
import { orgObservable } from '../../guard/organization.guard';

@Component({
  selector: 'organization-feedback',
  templateUrl: './organization-feedback.component.html',
  styleUrls: ['./organization-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFeedbackComponent implements OnInit {
  /** The organization status should be `accepted' before we can move on to the app */
  public canMoveOn: Observable<boolean>;

  constructor(private router: Router, private auth: AuthQuery, private db: FireQuery) {
  }

  ngOnInit(): void {
    this.canMoveOn = orgObservable(this.auth, this.db).pipe(
      map(org => {
        return org && org.status && org.status === OrganizationStatus.accepted;
      })
    );
  }

  public navigate() {
    this.router.navigate(['../../layout']);
  }
}
