import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CampaignForm } from '../../form';

@Component({
  selector: 'campaign-summary-perks',
  templateUrl: './perks.component.html',
  styleUrls: ['./perks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerksComponent {
  @Input() link: string;
  @Input() form: CampaignForm;

  get perks() {
    return this.form?.get('perks');
  }
}
