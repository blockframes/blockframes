import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CampaignForm } from '../../form';

@Component({
  selector: 'campaign-summary-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalComponent {
  @Input() form: CampaignForm;
  @Input() link: string;
}
