import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  Input,
  TemplateRef,
  ContentChildren,
  QueryList,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Directive({selector: '[filter]'})
export class FilterDirective implements OnInit {
  @Input() label = 'filter name';
  @Input() form: AbstractControl;
  private filterOpened$ = new BehaviorSubject(false);
  public active = false;
  public color$: Observable<'primary' | ''>;
  constructor(public template: TemplateRef<any>) {}

  set filterOpened(isOpened: boolean) {
    this.filterOpened$.next(isOpened);
  }

  ngOnInit() {
    this.color$ = combineLatest([
      this.filterOpened$,
      this.form.valueChanges.pipe(startWith(this.form.value)),
    ]).pipe(
      map(([isOpened]) => isOpened || this.form.dirty),
      map(hasColor => hasColor ? 'primary' : '')
    );

    this.form.valueChanges.subscribe(value => {
      switch (this.label) {
        case "Sales Agents":
        case "Genres":
        case "Country of Origin":
        case "Production Status":
           this.active = value.length !== 0;
          break;
  
        case "Language & Version":
          this.active = !(value.original.length === 0 &&
            value.dubbed.length === 0 &&
            value.subtitle.length === 0 &&
            value.caption.length === 0);
          break;
  
        case "Budget":
          this.active = value !== null && value !== 0;
          break;
  
        default:
          throw Error(`Unknown label ${this.label}`);
      }
    });
  }
}

@Component({
  selector: 'title-filter',
  templateUrl: './title-filter.component.html',
  styleUrls: ['./title-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleFilterComponent {
  @ContentChildren(FilterDirective) filters: QueryList<FilterDirective>;
  constructor(private cdr: ChangeDetectorRef) {}
}
