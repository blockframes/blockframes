// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable next-line // <-- eslint doesn't like to update the host directly for some reasons
  host: {
    class: 'surface'
  }
})
export class MovieViewDeliveryComponent implements OnInit {

  public form = this.shell.getForm('movie');

  constructor(private dynTitle: DynamicTitleService, private shell: DashboardTitleShellComponent) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Delivery Information');
  }

  get file() {
    return this.form.get('delivery').get('file').value;
  }

}
