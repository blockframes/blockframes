// Angular
import { Component, ChangeDetectionStrategy, Input, AfterContentInit, ContentChild, OnDestroy, ChangeDetectorRef } from '@angular/core';

// Blockframes
import { FormList } from '@blockframes/utils/form';

// Component
import { FormListTableComponent } from './table/form-list-table.component';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[formList] [buttonText] bf-form-list',
  templateUrl: 'form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListComponent implements AfterContentInit, OnDestroy {
  private sub: Subscription;

  @Input() formList: FormList<any>;

  @Input() buttonText: string;

  public localForm: FormList<any>

  public selectedForm: number;

  public tableView: boolean;

  @ContentChild(FormListTableComponent) formListTableComponent: FormListTableComponent;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterContentInit() {
   /*  console.log(this.formList)
    this.formList.controls.length ? this.tableView = true : this.tableView = false; */
    this.localForm = this.formList;
    this.sub = this.formListTableComponent.selectedRow.subscribe(index => {
      this.selectedForm = index
      this.tableView = false;
      this.cdr.markForCheck();
    })
    this.sub.add(this.formListTableComponent.markedToRemove.subscribe(index => this.removeControlFromList(index)));
  }

  public saveForm() {
    this.tableView = true;
    this.selectedForm = null;
    this.cdr.markForCheck()
  }

  private removeControlFromList(index: number) {
    this.formList.removeAt(index);
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}