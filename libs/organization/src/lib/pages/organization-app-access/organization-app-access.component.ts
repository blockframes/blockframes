import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService, OrganizationQuery } from '../../+state';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'organization-app-access',
  templateUrl: './organization-app-access.component.html',
  styleUrls: ['./organization-app-access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAppAccessComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public access = new FormControl();
  
  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscription = this.service.syncOrgActive().subscribe();
  }

  submit() {
    this.service.update(this.query.getActiveId(), { appAccess: {
      catalogMarketplace: this.access.value === 'marketplace',
      catalogDashboard: this.access.value === 'dashboard'
     }});
    this.router.navigate(['../congratulations'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
