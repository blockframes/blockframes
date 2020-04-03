import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  Input,
  TemplateRef,
  ContentChildren,
  QueryList
} from '@angular/core';

@Directive({selector: '[filter]'})
export class FilterDirective {
  @Input() label = 'filter name';
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'title-filter',
  templateUrl: './title-filter.component.html',
  styleUrls: ['./title-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleFilterComponent {
  @ContentChildren(FilterDirective) filters: QueryList<FilterDirective>;
}
