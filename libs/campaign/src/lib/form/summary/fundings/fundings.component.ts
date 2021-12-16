import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CampaignForm } from '../../form';

@Component({
  selector: 'campaign-summary-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryFundingsComponent {
  @Input() link: string | string[];
  @Input() form: CampaignForm;

  get fundings() {
    return this.form.get('fundings').value;
  }
}
