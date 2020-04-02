import {
  Component,
  ChangeDetectionStrategy,
  Input,
  QueryList,
  Directive,
  ContentChildren,
  TemplateRef
} from '@angular/core';

@Directive({selector: '[filter]'})
export class FilterDirective {
  @Input() label = 'filter name';
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'movie-filter',
  templateUrl: './movie-filter.component.html',
  styleUrls: ['./movie-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFilterComponent {

  @ContentChildren(FilterDirective) filters: QueryList<FilterDirective>;

}
