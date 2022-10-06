import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

const columns = {
  name: 'Organization name',
  kind: 'Nature',
  amount: 'Amount',
  status: 'Status',
}


@Component({
  selector: 'campaign-form-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormFundingsComponent {
  movieId = this.route.snapshot.params.movieId;
  columns = columns;
  form = this.shell.getForm('campaign');

  constructor(
    public shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Financing plan')
  }

  get fundings() {
    return this.form.get('fundings');
  }

  get budget() {
    return this.form.get('budget');
  }
}
