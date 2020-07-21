// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterContentInit,
  ContentChild,
  OnDestroy,
  ChangeDetectorRef,
  Directive,
  TemplateRef
} from '@angular/core';

// Blockframes
import { FormList } from '@blockframes/utils/form';

// Component
import { FormListTableComponent } from './table/form-list-table.component';

@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Component({
  selector: '[formList] [buttonText] bf-form-list',
  templateUrl: 'form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListComponent implements AfterContentInit {

  @Input() formList: FormList<any>;

  @Input() buttonText: string;

  public localForm: FormList<any>

  public selectedFormIndex: number;

  public tableView: boolean;

  @ContentChild(FormListTableComponent) formListTableComponent: FormListTableComponent;
  @ContentChild(FormViewDirective) formViewDirective: FormViewDirective;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterContentInit() {
    console.log(this.formListTableComponent)
    this.tableView = !!this.formList.controls.length;
    this.cdr.markForCheck();
    this.localForm = this.formList;
  }

  public selectRow(index: number) {
    this.selectedFormIndex = index
    this.localForm = this.localForm.at(index)
    this.tableView = false;
    this.cdr.markForCheck()
  }

  public saveForm() {
    this.tableView = true;
    this.selectedFormIndex = null;
    this.cdr.markForCheck()
  }

  public removeControlFromList(index: number) {
    this.formList.removeAt(index);
    this.cdr.markForCheck();
    this.isLastControl()
  }

  private isLastControl() {
    this.tableView = !!this.formList.controls.length;
  }
}