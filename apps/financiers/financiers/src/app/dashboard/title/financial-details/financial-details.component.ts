// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';

@Component({
  selector: 'financiers-movie-view-financial-details',
  templateUrl: './financial-details.component.html',
  styleUrls: ['./financial-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewFinancialDetailComponent implements OnInit {

  public form = this.shell.getForm('movie');

  constructor(private dynTitle: DynamicTitleService, private shell: DashboardTitleShellComponent) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Estimated Budget');
  }

}
