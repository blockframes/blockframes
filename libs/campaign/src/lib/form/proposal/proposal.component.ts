import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';

@Component({
  selector: 'campaign-form-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormProposalComponent {
  form = this.shell.getForm('campaign');
  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Investment Proposal')
  }

}
