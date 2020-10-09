import { Component, ChangeDetectionStrategy, Pipe } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Perk } from '@blockframes/campaign/+state';
import { PerkForm } from '../form';
import { CampaignFormShellComponent } from '../shell/shell.component';

const columns = {
  title: 'Title',
  description: 'Description',
  minPledge: 'Pledge Level',
  amount: 'Amount of Privileges Available',
}

@Component({
  selector: 'campaign-form-perks',
  templateUrl: './perks.component.html',
  styleUrls: ['./perks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormPerksComponent {
  private amount: Perk['amount'] = { total: 0 };
  columns = columns;
  form = this.shell.form;
  
  constructor(private shell: CampaignFormShellComponent) { }

  setUnlimited(change: MatCheckboxChange, form: PerkForm) {
    if (change.checked) {
      this.amount = form.get('amount').value;
      form.get('amount').setValue({ total: Infinity, current: Infinity });
    } else {
      form.get('amount').setValue(this.amount);
      delete this.amount;
    }
  }
}
