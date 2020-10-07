import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TunnelStep } from '@blockframes/ui/tunnel';
import { CampaignForm } from '../form';
import { CampaignService } from '../../+state';
import { Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state';

const steps: TunnelStep[] = [{
  title: 'Investment Campaign',
  icon: 'home',
  time: 15,
  routes: [{
    path: 'proposal',
    label: 'Investment Proposal'
  }, {
    path: 'perks',
    label: 'Privileges'
  }],
}, {
  title: 'Summary',
  icon: 'send',
  time: 3,
  routes: [{
    path: 'summary',
    label: 'Summary & Submission'
  }]
}];

@Component({
  selector: 'campaign-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormShellComponent implements OnInit {
  private sub: Subscription;
  campaignId$ = this.route.params.pipe(map(params => params.campaignId));
  steps = steps;
  form = new CampaignForm();

  constructor(
    private orgQuery: OrganizationQuery,
    private service: CampaignService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const orgId = this.orgQuery.getActiveId();
    this.campaignId$.pipe(
      switchMap((id: string) => this.service.valueChanges(id, { params: { orgId }}))
    ).subscribe(campaign => this.form.reset(campaign));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  save(id: string) {
    if (this.form.valid) {
      this.service.save(id, this.form.value);
    }
  }
}
