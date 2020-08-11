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
import { ColRef } from '@blockframes/utils/directives/col-ref.directive';

// RxJs
import { startWith, map, distinctUntilChanged, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

// Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Component({
  selector: '[displayedColumns] [form] bf-form-table',
  templateUrl: './form-table.component.html',
  styleUrls: ['./form-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTableComponent<T> implements OnInit, AfterViewInit, OnDestroy {

  private sub: Subscription;

  @Input() displayedColumns: string[] = [];
  @Input() form: FormList<T>;
  @Input() buttonText: string = 'Add';

  @ContentChildren(ColRef, { descendants: false }) cols: QueryList<ColRef>;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  showTable$: Observable<boolean>;
  showPaginator$: Observable<boolean>;
  activeIndex: number;
  pageSize = 5;
  /* We need to keep track of the current page since it will affect the index that we are working on */
  pageConfig = { pageIndex: 0, pageSize: 5 };
  formItem: FormEntity<EntityControl<T>, T>;
  dataSource = new MatTableDataSource<T>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.displayedColumns.push('actions')
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
      this.cdr.markForCheck();
    });

    /* If form is empty, we need a placeholder for the ngTemplateOutletContext */
    if (this.isFormEmpty) {
      this.add();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get isFormEmpty() {
    return !this.form.length
  }

  // Add a clean form
  add() {
    this.formItem = this.form.createControl({});
  }

  /* If there is no control in the form it adds a default one for the user to work on. */
  addControl() {
    if (this.isFormEmpty) {
      this.form.push(this.formItem)
    }
    const control = this.form.createControl({})
    this.form.push(control)
    this.formItem = control;
    this.activeIndex = this.form.length - 1
    this.cdr.markForCheck()
  }

  // Edit existing form
  edit(index: number) {
    this.calculateCurrentIndex(index);
    this.formItem = this.form.at(this.activeIndex);
    this.cdr.markForCheck();
  }

  // Remove one line in the form
  remove(index: number) {
    this.calculateCurrentIndex(index);
    this.form.removeAt(this.activeIndex);
    /* We don't want a negative index to be set. */
    this.formItem = this.form.at(this.activeIndex ? this.activeIndex - 1 : 0)
    if (this.isFormEmpty) {
      this.add()
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
