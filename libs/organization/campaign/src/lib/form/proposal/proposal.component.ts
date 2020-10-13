import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

@Component({
  selector: 'campaign-form-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormProposalComponent {
  form = this.shell.getForm('campaign');
  
  constructor(private shell: MovieFormShellComponent) { }

}
