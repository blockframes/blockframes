import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CampaignForm } from '@blockframes/campaign/form/form';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';

interface Data {
  form: CampaignForm;
  errorMatcher: CrossFieldErrorMatcher;
  onSave: () => void;
}

@Component({
  selector: 'financiers-dashboard-title-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<TitleModalComponent>
  ) { }

}
