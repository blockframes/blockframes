import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageVersionControl } from '@blockframes/movie/form/search.form';
import { staticModel } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent {

  @Input() form: LanguageVersionControl;

  public items = staticModel['movieLanguageTypes'];

  private subs: Subscription[] = [];

  /** versions value in form are rebuild for every change. This boolean prevents accidently recognizing a change as a reset */
  private rebuildingForm = false;

  constructor(private cdr: ChangeDetectorRef) { }

  public keepOrder = () => 1;
}
