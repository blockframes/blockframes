import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Campaign } from '../../+state';

@Component({
  selector: 'campaign-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressComponent {
  currency = 'USD';
  received = 0;
  progress = 0;
  steps: number[] = [];

  @Input()
  set campaign(campaign: Campaign) {
    if (campaign) {
      this.currency = campaign.currency;
      this.received = campaign.received || 0;
      this.progress = (this.received / campaign.cap) * 100;
      let total = 0;
      const steps = [];
      for (let i = 0; i < 5; i++) {
        steps.push(Math.floor(total));
        total += campaign.cap / 4;
      }
      this.steps = steps;
    }
  }
}
