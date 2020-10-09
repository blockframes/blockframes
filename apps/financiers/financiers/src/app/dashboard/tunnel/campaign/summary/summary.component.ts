import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignFormShellComponent } from '@blockframes/campaign/form/shell/shell.component';

@Component({
  selector: 'financiers-campaign-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent {
  form = this.shell.getForm('movie');
  constructor(
    private shell: CampaignFormShellComponent,
    private router: Router
  ) { }

  async save() {
    const id = await this.shell.save();
    this.router.navigate(['/c/o/dashboard/title', id]);
  }
}
