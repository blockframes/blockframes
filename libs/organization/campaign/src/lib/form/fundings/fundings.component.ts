import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

const columns = {
  name: 'Organization name',
  kind: 'Nature',
  amount: 'Amount',
  status: 'Status',
}


@Component({
  selector: 'campaign-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundingsComponent {
  form = this.shell.getForm('campaign');
  columns = columns;
  
  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Financing plan')
  }
}
