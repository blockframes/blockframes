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

  public submit(catalogDashboard: boolean, catalogMarketplace: boolean) {
    if (!catalogDashboard && !catalogMarketplace) {
      return this.snackBar.open('You have to select an application.', 'close', { duration: 2000 });
    }
    this.service.update(this.query.getActiveId(), { appAccess: { catalogMarketplace, catalogDashboard } });
    this.router.navigate(['../congratulations'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
