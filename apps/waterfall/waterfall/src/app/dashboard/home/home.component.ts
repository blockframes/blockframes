// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
 
  constructor(
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('Dashboard');
  }

}
