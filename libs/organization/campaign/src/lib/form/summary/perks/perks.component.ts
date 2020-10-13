import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CampaignForm } from '../../form';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'campaign-summary-perks',
  templateUrl: './perks.component.html',
  styleUrls: ['./perks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerksComponent {
  @Input() link: string | string[];
  @Input() form: CampaignForm;

  get hasPerks$() {
    return this.perks.valueChanges.pipe(
      startWith(this.perks.value),
      map(perks => !!perks.length)
    );
  }

  get perks() {
    return this.form?.get('perks');
  }
}
