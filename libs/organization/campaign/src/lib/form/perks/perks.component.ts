import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';
import { Perk } from '../../+state';
import { PerkForm } from '../form';

const columns = {
  title: 'Title',
  description: 'Description',
  minPledge: 'Pledge Level',
  // amount: 'Amount of Privileges Available', @todo(#4116)
}

@Component({
  selector: 'campaign-form-perks',
  templateUrl: './perks.component.html',
  styleUrls: ['./perks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormPerksComponent {
  // @todo(#4116)
  // private amount: Perk['amount'] = { total: 0, current: 0 };
  columns = columns;
  form = this.shell.getForm('campaign');
  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Privileges')
  }

  // @todo(#4116)
  // setUnlimited(change: MatCheckboxChange, form: PerkForm) {
  //   if (change.checked) {
  //     this.amount = form.get('amount').value;
  //     form.get('amount').setValue({ total: Infinity, current: Infinity });
  //   } else {
  //     form.get('amount').setValue(this.amount);
  //     delete this.amount;
  //   }
  // }
}
