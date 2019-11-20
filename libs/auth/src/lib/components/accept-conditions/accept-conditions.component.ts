import { ChangeDetectionStrategy, Component, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AcceptConditionsDirective } from './accept-conditions.directive';

@Component({
  selector: 'accept-conditions',
  templateUrl: './accept-conditions.component.html',
  styleUrls: ['./accept-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptConditionsComponent {

  // Access the template given by the parent
  @ContentChild(AcceptConditionsDirective, { static: false })
  acceptConditions: AcceptConditionsDirective;

  @Output() termsOfUseChecked = new EventEmitter<boolean>()
  public isTermsOfUseChecked = false;

  constructor(private dialog: MatDialog) {}

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openTermsOfUse(conditions: TemplateRef<any>) {
    this.dialog.open(conditions, { maxHeight: '80vh' })
  }

  public toggleTermsOfUse() {
    this.isTermsOfUseChecked = !this.isTermsOfUseChecked;
    this.termsOfUseChecked.emit(this.isTermsOfUseChecked)
  }

}
