import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CampaignService } from '../+state';
import { CampaignForm } from '../form/form';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'campaign-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  movieId$ = this.route.selectParams('movieId');
  form = new CampaignForm();

  constructor(
    private service: CampaignService,
    private orgQuery: OrganizationQuery,
    private route: RouterQuery,
  ) { }

  ngOnInit(): void {
    const orgId = this.orgQuery.getActiveId();
    this.sub = this.movieId$.pipe(
      switchMap((id: string) => this.service.valueChanges(id, { params: { orgId }}))
    ).subscribe(campaign => this.form.setAllValue(campaign));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
