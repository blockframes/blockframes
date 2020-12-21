import { Component, Input } from '@angular/core';
import { CampaignForm } from '../../form';

@Component({
  selector: '[form][link] campaign-summary-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class SummaryBudgetComponent {

  @Input() form: CampaignForm;
  @Input() link: string;

  get budget() {
    return this.form.get('budget');
  }
}
