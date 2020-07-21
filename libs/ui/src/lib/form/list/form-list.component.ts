// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterContentInit,
  ContentChild,
  ChangeDetectorRef,
  Directive,
  TemplateRef,
  OnDestroy,
  OnInit
} from '@angular/core';

// Blockframes
import { FormList } from '@blockframes/utils/form';

// Component
import { FormListTableComponent } from './table/form-list-table.component';

// RxJs
import { Subscription } from 'rxjs';

@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Component({
  selector: '[formList] [buttonText] bf-form-list',
  templateUrl: 'form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListComponent implements OnInit, AfterContentInit, OnDestroy {

  private sub: Subscription;

  private activeIndex: number = 0;

  private _formList: FormList<any>
  @Input()
  get formList() { return this._formList }
  set formList(list) {
    this._formList = list;
    this.localForm = list;
  };

  @Input() buttonText: string;

  public localForm: FormList<any>

  public tableView: boolean;

  @ContentChild(FormListTableComponent) formListTableComponent: FormListTableComponent;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.tableView = !this.hasNoControls();
    /* If there are no controls we still need to have one since we need to provide a form via the ngTemplateOutletContext */
    if (!this.formList.controls.length) {
      this.formList.add([])
      this.localForm = this.formList.at(0)
    }
  }

  ngAfterContentInit() {
    this.sub = this.formListTableComponent.selectedRow.subscribe(index => {
      /* We need the not null check because when initializing the subscription, index can be null */
      if (this.isNotNull(index)) {
        this.activeIndex = index
        this.editItem(index)
      }
    })
    this.sub.add(this.formListTableComponent.removeIndex.subscribe(index => {
      /* We need the not null check because when initializing the subscription, index can be null */
      if (this.isNotNull(index)) {
        this.removeControlFromList(index)
      }
    }))
  }

  public editItem(index: number) {
    if (this.isNotNull(index)) {
      /* Reset the local form, otherwise at the next iteration we are at the wrong level of the controls array */
      this.localForm = this.formList;
      this.localForm = this.localForm.at(index)
      this.tableView = false;
      this.cdr.markForCheck();
    }
  }

  public saveForm() {
    if (this.hasNoControls()) {
      /* If we have no controls in the controls array, we need to use the add function */
      this.formList.add(this.localForm.value)
    } else {
      this.formList.at(this.activeIndex).setValue(this.localForm.value)
    }
    this.tableView = true;
    this.cdr.markForCheck();
  }

  public removeControlFromList(index: number) {
    if (this.formList.controls.length === 1) {
      /* If only one control is left and we are going to remove it, we need a placeholder. The placeholder
      will get used for the template router outlet context. We always need a valid form group that we can pass
      to the outlet, otherwise it will throw an error. This is why we are shifting with the indices.  */
      this.activeIndex = 0;
      this.formList.add([]);
      this.formList.removeAt(index);
      this.localForm = this.formList.at(index);
      this.tableView = false;
    } else {
      this.formList.removeAt(index);
    }
    if (this.hasNoControls()) {
      this.tableView = false;
    }
    this.cdr.markForCheck();
  }

  private isNotNull(integer: number) {
    return integer !== null
  }

  private hasNoControls() {
    return this.formList.controls.length === 0
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}