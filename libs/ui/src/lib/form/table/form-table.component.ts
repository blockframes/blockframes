// Angular
import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  TemplateRef,
  Directive,
  ContentChild,
  ChangeDetectionStrategy,
  OnDestroy,
  Pipe,
  PipeTransform
} from '@angular/core';

// Blockframes
import { FormList, FormEntity, EntityControl } from '@blockframes/utils/form';
import { AddButtonTextDirective, SaveButtonTextDirective } from '@blockframes/utils/directives/button-text.directive';

// Material
import { PageState } from '@blockframes/ui/list/table/paginator';
import { ColumnDirective } from '@blockframes/ui/list/table/table.component';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Pipe({ name: 'findColRef' })
export class QueryListFindPipe implements PipeTransform {
  transform(queryList: QueryList<ColumnDirective<unknown>>, key: string) {
    return queryList.find(query => query.name === key);
  }
}


@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Component({
  selector: '[columns] [form] bf-form-table',
  templateUrl: './form-table.component.html',
  styleUrls: ['./form-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTableComponent<T> implements OnInit, OnDestroy {
  @Input() columns: Record<string, string> = {};
  @Input() form: FormList<T>;
  @Input() @boolean disableAddTerms = false;
  @Input() tablePosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() set active(index: number) {
    if (typeof index !== 'number' || index < 0) return;
    this.edit(index);
  }

  @ContentChildren(ColumnDirective, { descendants: false }) cols: QueryList<ColumnDirective<T>>;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;
  @ContentChild(SaveButtonTextDirective, { read: TemplateRef }) saveButtonText: SaveButtonTextDirective;
  @ContentChild(AddButtonTextDirective, { read: TemplateRef }) addButtonText: AddButtonTextDirective;

  layout = { top: 'column', bottom: 'column-reverse', left: 'row', right: 'row-reverse' };
  activeIndex: number;
  activeValue: T;
  pageSize = 5;
  /* We need to keep track of the current page since it will affect the index that we are working on */
  pageConfig: PageState = { pageIndex: 0, pageSize: 5 };
  formItem: FormEntity<EntityControl<T>, T>;

  keepOrder = () => 0;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // If active has not been triggered add a default item
    if (!this.formItem) this.add();
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.formItem?.dirty) this.save()
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
  updateIndex(page: PageState) {
    this.pageConfig = { pageIndex: page.pageIndex, pageSize: page.pageSize };
  }

  /**
   * @description We are getting the index in the context of the paginator. Meaning if you are on page two
   * and click the second row, you get the index 1. But this is not the correct index in the perspective of the list.
   * @param index of the table row
   */
  private calculateCurrentIndex(index: number) {
    this.activeIndex = this.pageConfig.pageIndex * this.pageConfig.pageSize + index;
  }
}
