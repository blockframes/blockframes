import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CampaignForm } from '../../form';

const columns = {
  name: 'Organization name',
  kind: 'Nature',
  amount: 'Amount',
  status: 'Status',
  edit: ''
}

@Component({
  selector: 'campaign-summary-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryFundingsComponent {
  @Input() link: string | string[];
  @Input() form: CampaignForm;
  columns = columns;
  initialColumns = Object.keys(columns);

  get fundings() {
    return this.form.get('fundings').value;
  }
}
