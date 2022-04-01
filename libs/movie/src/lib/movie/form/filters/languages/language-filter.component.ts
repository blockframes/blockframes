import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LanguageVersionControl } from '@blockframes/movie/form/search.form';
import { staticModel } from '@blockframes/shared/model';

@Component({
  selector: '[form] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent {

  @Input() form: LanguageVersionControl;

  public items = staticModel['movieLanguageTypes'];

  public keepOrder = () => 1;


}
