import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CampaignService } from '../+state';
import { createCampaignForm } from '../form/form';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'campaign-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private sub: Subscription;
  form = createCampaignForm();

  constructor(
    private service: CampaignService,
    private orgQuery: OrganizationQuery,
    private route: RouterQuery,
  ) { }

  ngOnInit(): void {
    const orgId = this.orgQuery.getActiveId();
    this.sub = this.route.selectParams('movieId').pipe(
      switchMap((id: string) => this.service.valueChanges(id, { params: { orgId }}))
    ).subscribe(campaign => this.form.patchAllValue(campaign));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
