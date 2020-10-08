import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  Input,
  TemplateRef,
  ContentChildren,
  QueryList,
  OnInit
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Directive({ selector: '[filter]' })
export class FilterDirective implements OnInit {
  @Input() label = 'filter name';
  @Input() form: AbstractControl;
  private active$ = new BehaviorSubject(false);
  public color$: Observable<'primary' | ''>;
  constructor(public template: TemplateRef<any>) { }

  set active(isActive: boolean) {
    this.active$.next(isActive);
  }

  ngOnInit() {
    this.color$ = combineLatest([
      this.active$,
      this.form.valueChanges.pipe(startWith(this.form.value)),
    ]).pipe(
      map(([active]) => active || this.form.dirty),
      map(hasColor => hasColor ? 'primary' : '')
    );
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
