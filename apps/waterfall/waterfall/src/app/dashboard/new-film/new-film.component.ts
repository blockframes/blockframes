// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Territory } from '@blockframes/model';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FormList } from '@blockframes/utils/form';

@Component({
  selector: 'dashboard-new-film',
  templateUrl: './new-film.component.html',
  styleUrls: ['./new-film.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewFilmComponent {
 
  countries = FormList.factory<Territory>([]);
  constructor(
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle('New Film');
  }

}
