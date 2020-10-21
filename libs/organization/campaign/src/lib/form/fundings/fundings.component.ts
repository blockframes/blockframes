import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
export class CampaignFormFundingsComponent implements OnInit {
  storagePath: string;
  columns = columns;
  form = this.shell.getForm('campaign');
  
  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Financing plan')
  }

  ngOnInit() {
    const { movieId } = this.route.snapshot.params;
    this.storagePath = `campaigns/${movieId}/financingPlan/`;
  }
}
