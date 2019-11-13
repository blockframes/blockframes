import { ChangeDetectionStrategy, Component, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConditionsDirective } from './conditions.directive';

@Component({
  selector: 'accept-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptTermsAndConditionsComponent {

  // Access the template given by the parent
  @ContentChild(ConditionsDirective, { static: false })
  conditions: ConditionsDirective;

  @Output() termsOfUseChecked = new EventEmitter<boolean>()
  public isTermsOfUseChecked = false;

  constructor(private dialog: MatDialog) {}

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openTermsOfUse(conditions: TemplateRef<any>) {
    this.dialog.open(conditions, { maxHeight: '100vh' })
  }

  public toggleTermsOfUse() {
    this.isTermsOfUseChecked = !this.isTermsOfUseChecked;
    this.termsOfUseChecked.emit(this.isTermsOfUseChecked)
  }

}
