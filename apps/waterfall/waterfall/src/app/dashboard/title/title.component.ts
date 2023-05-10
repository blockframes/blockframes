// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Territory } from '@blockframes/model';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FormList } from '@blockframes/utils/form';

@Component({
  selector: 'dashboard-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent {
 
  countries = FormList.factory<Territory>([]);

  constructor(
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('New Film');
  }

}
