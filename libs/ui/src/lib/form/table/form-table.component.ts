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
import { MatPaginator } from '@angular/material/paginator';

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

  @ContentChildren(ColRef, { descendants: false }) cols: QueryList<ColRef>;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  showTable$: Observable<boolean>;
  showPaginator$: Observable<boolean>;
  showSave: boolean;
  pageSize = 5;
  formItem: FormEntity<EntityControl<T>, T>;
  dataSource = new MatTableDataSource<T>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.displayedColumns.push('actions')
    const values$ = this.form.valueChanges.pipe(startWith(this.form.value));
    // Show table if there are controls
    this.showTable$ = values$.pipe(
      map(value => !!value.length),
      tap(value => value ? this.formItem = this.form.at(0) : this.add()),
      distinctUntilChanged()
    );
    // Show Paginator if table size goes beyond page size
    this.showPaginator$ = values$.pipe(
      map(value => {
        /* We need to reconnect the paginator in order to force a rerendering of the pagination */
        if (value.length >= this.pageSize) {
          this.dataSource.paginator = this.paginator
        }
        return value.length >= this.pageSize
      }),
      distinctUntilChanged()
    );
    // Keep the table updated
    this.sub = values$.subscribe(values => {
      this.dataSource.data = values;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Add a clean form and show save button
  add() {
    this.formItem = this.form.createControl({});
    this.showSave = true;
  }

  // Edit existing form, we don't want save button as content is updated in real time
  edit(index: number) {
    this.formItem = this.form.at(index);
    this.showSave = false;
    this.cdr.detectChanges();
  }

  // Remove one line in the form
  remove(index: number) {
    this.form.removeAt(index);
  }

  // Push the form into the list
  save() {
    this.form.push(this.formItem);
    this.showSave = false;
  }
}