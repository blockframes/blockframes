import { ChangeDetectionStrategy, Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyPageComponent } from '@blockframes/marketplace/app/pages/privacy-page/privacy-page.component';

@Component({
  selector: 'terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsAndConditionsComponent {
  @Output() termsOfUseChecked = new EventEmitter<boolean>()
  public isTermsOfUseChecked = false;

  constructor(private dialog: MatDialog) {}

  /** Opens a dialog with terms of use and privacy policy. */
  public openTermsOfUse() {
    this.dialog.open(PrivacyPageComponent, { maxHeight: '100vh' })
  }

  public toggleTermsOfUse() {
    this.isTermsOfUseChecked = !this.isTermsOfUseChecked;
    this.termsOfUseChecked.emit(this.isTermsOfUseChecked)
  }

}
