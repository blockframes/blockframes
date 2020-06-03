import { ChangeDetectionStrategy, Component, TemplateRef, ContentChild, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AcceptConditionsDirective } from './accept-conditions.directive';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'auth-accept-conditions',
  templateUrl: './accept-conditions.component.html',
  styleUrls: ['./accept-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptConditionsComponent {
  // Access the template given by the parent
  @ContentChild(AcceptConditionsDirective)
  acceptConditions: AcceptConditionsDirective;

  public isConditionChecked = false;

  /** Hold the boolean control of the parent form for the checkbox */
  @Input() control: FormControl;

  constructor(private dialog: MatDialog) {}

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openTermsOfUse(conditions: TemplateRef<any>) {
    this.dialog.open(conditions, { maxHeight: '80vh' })
  }

  public toggleCondition() {
    this.isConditionChecked = !this.isConditionChecked;
    this.control.setValue(this.isConditionChecked);
  }

}
