import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  Input,
  TemplateRef,
  ContentChildren,
  QueryList,
  OnInit,
  OnChanges
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { hasValue } from '@blockframes/utils/pipes';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Directive({ selector: '[filter]' })
export class FilterDirective implements OnInit, OnChanges {
  @Input() label = 'filter name';
  @Input() form: AbstractControl;
  @Input() autoOpen = false;

  private active$ = new BehaviorSubject(false);
  public color$: Observable<'primary' | ''>;
  constructor(public template: TemplateRef<unknown>) { }

  set active(isActive: boolean) {
    this.active$.next(isActive);
  }

  ngOnInit() {
    this.color$ = combineLatest([
      this.active$,
      this.form.valueChanges.pipe(startWith(this.form.value)),
    ]).pipe(
      map(([active, value]) => active || (hasValue(value) && this.form.valid)),
      map(hasColor => hasColor ? 'primary' : '')
    );
  }

  ngOnChanges() {
    const filterButton = document.getElementById('filterButton');
    if (this.autoOpen) filterButton.click();
  }
}

@Component({
  selector: 'list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListFilterComponent {
  @ContentChildren(FilterDirective) filters: QueryList<FilterDirective>;
}
