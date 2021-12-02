// Angular
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  TemplateRef,
  Directive,
  ContentChild,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

// Blockframes
import { FormList, FormEntity, EntityControl } from '@blockframes/utils/form';
import { ColRefDirective } from '@blockframes/utils/directives/col-ref.directive';
import { AddButtonTextDirective, SaveButtonTextDirective } from '@blockframes/utils/directives/button-text.directive';

// RxJs
import { startWith, map, distinctUntilChanged, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

// Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Component({
  selector: '[columns] [form] bf-form-table',
  templateUrl: './form-table.component.html',
  styleUrls: ['./form-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTableComponent<T> implements OnInit, AfterViewInit, OnDestroy {

  private sub: Subscription;

  @Input() columns: Record<string, string> = {};
  @Input() form: FormList<T>;
  @Input() tablePosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() set active(index: number) {
    if (typeof index !== 'number' || index < 0) return;
    this.edit(index);
  }

  @ContentChildren(ColRefDirective, { descendants: false }) cols: QueryList<ColRefDirective>;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;
  @ContentChild(SaveButtonTextDirective, { read: TemplateRef }) saveButtonText: SaveButtonTextDirective;
  @ContentChild(AddButtonTextDirective, { read: TemplateRef }) addButtonText: AddButtonTextDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  layout = { top: 'column', bottom: 'column-reverse', left: 'row', right: 'row-reverse' };
  tableColumns: string[] = [];
  showTable$: Observable<boolean>;
  showPaginator$: Observable<boolean>;
  activeIndex: number;
  activeValue: T;
  pageSize = 5;
  /* We need to keep track of the current page since it will affect the index that we are working on */
  pageConfig = { pageIndex: 0, pageSize: 5 };
  formItem: FormEntity<EntityControl<T>, T>;
  dataSource = new MatTableDataSource<T>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.tableColumns = Object.keys(this.columns);
    this.tableColumns.push('actions')
    const values$ = this.form.valueChanges.pipe(startWith(this.form.value));
    // Show table if there are controls
    this.showTable$ = values$.pipe(
      map(value => !!value.length),
      distinctUntilChanged()
    );
    // Show Paginator if table size goes beyond page size
    this.showPaginator$ = values$.pipe(
      map(value => value.length >= this.pageSize),
      /* We need to reconnect the paginator in order to force a rerendering of the pagination */
      tap(isVisible => isVisible ? this.dataSource.paginator = this.paginator : null),
      distinctUntilChanged()
    );
    // Keep the table updated
    this.sub = values$.subscribe(values => {
      this.dataSource.data = values;
    });

    // If active has not been triggered add a default item
    if (!this.formItem) this.add();

    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    if (this.formItem?.dirty) this.save()
    this.sub?.unsubscribe();
  }

  get isFormEmpty() {
    return !this.form.length
  }

  add() {
    this.formItem = this.form.createControl({});
  }

  save() {
    if (this.formItem?.valid) {
      /* If active index is below 0 we want to push the formItem otherwise we are stuck where the table is not shown
      and also no form */
      if (typeof this.activeIndex === 'number' && !this.isFormEmpty && this.activeIndex >= 0) {
        delete this.activeIndex;
      } else {
        this.form.push(this.formItem);
      }
      delete this.formItem;
      this.cdr.markForCheck();
    }
  }

  cancel() {
    if (typeof this.activeIndex === 'number') {
      this.form.at(this.activeIndex).setValue(this.activeValue);
      delete this.activeIndex;
      delete this.activeValue;
    }
    delete this.formItem;
  }

  edit(index: number) {
    this.calculateCurrentIndex(index);
    this.formItem = this.form.at(this.activeIndex);
    console.log(this.formItem, this.formItem.value);
    this.activeValue = this.formItem.value;
    this.cdr.markForCheck();
  }

  remove(index: number) {
    this.calculateCurrentIndex(index);
    this.form.removeAt(this.activeIndex);
    if (this.activeIndex > index) {
      this.activeIndex--;
    }
    if (this.isFormEmpty) {
      this.add();
    }
  }

  /**
   * @description function that gets triggered whenever the paginator fires his page event.
   * @param page
   */
  updateIndex(page: PageEvent) {
    this.pageConfig = { pageIndex: page.pageIndex, pageSize: page.pageSize }
  }

  /**
   * @description We are getting the index in the context of the paginator. Meaning if you are on page two
   * and click the second row, you get the index 1. But this is not the correct index in the perspective of the list.
   * @param index of the table row
   */
  private calculateCurrentIndex(index: number) {
    this.activeIndex = this.pageConfig.pageIndex * this.pageConfig.pageSize + index
  }
}
