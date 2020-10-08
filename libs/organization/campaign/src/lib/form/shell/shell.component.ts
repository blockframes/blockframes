import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TunnelConfirmComponent, TunnelStep } from '@blockframes/ui/tunnel';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { createCampaignForm } from '../form';
import { CampaignService } from '../../+state';
import { of, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

const steps: TunnelStep[] = [{
  title: 'Investment Campaign',
  icon: 'campaign',
  time: 3,
  routes: [{ path: 'proposal', label: 'Investment Proposal' }],
}, {
  title: 'Privileges',
  icon: 'gift',
  time: 12,
  routes: [{ path: 'perks', label: 'Privileges' }],
},{
  title: 'Summary',
  icon: 'send',
  time: 3,
  routes: [{ path: 'summary', label: 'Summary & Submission' }]
}];

@Component({
  selector: 'campaign-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormShellComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  campaignId$ = this.route.params.pipe(map(params => params.campaignId));
  steps = steps;
  form = createCampaignForm();

  constructor(
    private orgQuery: OrganizationQuery,
    private service: CampaignService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    const orgId = this.orgQuery.getActiveId();
    this.sub = this.campaignId$.pipe(
      switchMap((id: string) => this.service.valueChanges(id, { params: { orgId }}))
    ).subscribe(campaign => this.form.patchAllValue(campaign));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async save() {
    if (this.form.valid) {
      const id: string = this.route.snapshot.params.campaignId;
      await this.service.save(id, this.form.value);
      this.form.markAsPristine();
      return id;
    }
  }

  // @todo(#3908) DRY: this must be implemented by every shell in a tunnel. It's always the same  
  confirmExit() {
    if (this.form.pristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Campaign Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
        /* Undefined means, user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false)
        }
        return shouldSave ? this.save() : of(true)
      })
    );
  }
}
