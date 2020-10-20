import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CampaignForm } from '../../form';

const columns = {
  name: 'Organization name',
  kind: 'Nature',
  amount: 'Amount',
  status: 'Status',
}

@Component({
  selector: 'campaign-summary-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundingsComponent {
  @Input() link: string | string[];
  @Input() form: CampaignForm;
  columns = columns;

  get fundings() {
    return this.form.get('fundings').value;
  }
}
