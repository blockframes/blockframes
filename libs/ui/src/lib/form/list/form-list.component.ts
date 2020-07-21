// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterContentInit,
  ContentChild,
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

  public tableView: boolean;

/*   @ContentChild(FormListTableComponent) formListTableComponent: FormListTableComponent; */
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterContentInit() {
    this.tableView = !!this.formList.controls.length;
    this.localForm = this.formList
    console.log(this.localForm, this.formList)

  }

  public selectRow(index: number) {
    this.localForm = this.localForm.at(index);
    console.log(this.localForm)
    this.tableView = false;
    this.cdr.markForCheck();
  }

  public saveForm() {
    this.tableView = true;
    this.cdr.markForCheck()
  }

  public removeControlFromList(index: number) {
    console.log(this.localForm)
    this.formList.removeAt(index);
    this.isLastControl()
    this.cdr.markForCheck();
    console.log(this.localForm)
  }

  private isLastControl() {
    this.tableView = !!this.formList.controls.length;
  }
}