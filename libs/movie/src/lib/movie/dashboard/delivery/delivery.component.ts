// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'dashboard-title-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieViewDeliveryComponent implements OnInit {

  public form = this.shell.getForm('movie');

  constructor(
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) { }

  async ngOnInit() {
    const movie = await this.shell.movie;
    const titleName = movie?.title?.international || 'No title';
    this.dynTitle.setPageTitle(titleName, 'Delivery Information');
  }

  get file() {
    return this.form.get('delivery').get('file').value;
  }

}
