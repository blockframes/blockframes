import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { App, getOrgAppAccess } from '@blockframes/utils/apps';
import { MatSnackBar } from '@angular/material/snack-bar';
import { organizationRoles, OrganizationService } from '@blockframes/organization/+state';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP } from '@blockframes/utils/routes/utils';

type Steps = 'initial' | 'request';

@Component({
  selector: 'org-request-access',
  templateUrl: './request-access.component.html',
  styleUrls: ['./request-access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgRequestAccessComponent implements OnInit {
  public roles = organizationRoles;
  private org$ = this.orgService.currentOrg$;
  private orgId = this.orgService.org.id;
  public orgExistingAccess$: Observable<App[]>;
  public disabledRequest = false;
  public formControl = new FormControl();

  public step$: Observable<Steps>;
  private step = new BehaviorSubject<Steps>('initial');

  constructor(
    private snackBar: MatSnackBar,
    private orgService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(APP) public currentApp: App
  ) { }

  ngOnInit() {
    this.step$ = this.step.asObservable();
    this.orgExistingAccess$ = this.org$.pipe(map(org => getOrgAppAccess(org)));
  }

  joinOptions() {
    this.step.next('request');
  }

  async requestAccess() {
    if (!['dashboard', 'marketplace'].includes(this.formControl.value)) {
      this.snackBar.open('Please choose a role.', 'close', { duration: 5000 });
      return;
    }

    this.disabledRequest = true;

    await this.orgService.requestAppAccess(this.currentApp, this.formControl.value, this.orgId);
    this.router.navigate(['pending'], { relativeTo: this.route });
  }

  public logout() {
    this.authService.signOut();
  }
}
