import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CampaignFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'campaign-form-perks',
  templateUrl: './perks.component.html',
  styleUrls: ['./perks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormPerksComponent {
  form = this.shell.form;
  
  constructor(private shell: CampaignFormShellComponent) { }

}
