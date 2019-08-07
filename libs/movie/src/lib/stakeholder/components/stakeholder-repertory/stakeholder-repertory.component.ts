import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationAlgoliaResult } from '@blockframes/utils';
import { MovieQuery } from '@blockframes/movie/movie/+state';
import { StakeholderService } from '../../+state';

@Component({
  selector: 'stakeholder-repertory',
  templateUrl: './stakeholder-repertory.component.html',
  styleUrls: ['./stakeholder-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderRepertoryComponent {
  constructor(private service: StakeholderService, private movieQuery: MovieQuery) {}

  public submit({ objectID }: OrganizationAlgoliaResult) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    this.service.addStakeholder(this.movieQuery.getActive(), objectID);
  }
}
