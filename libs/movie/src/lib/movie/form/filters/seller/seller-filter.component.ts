import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { algolia } from '@env';

@Component({
  selector: '[form] title-filter-seller',
  templateUrl: './seller-filter.component.html',
  styleUrls: ['./seller-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellerFilterComponent {

  @Input() form: FormList<string>;

  public movieIndex = algolia.indexNameMovies;
}
