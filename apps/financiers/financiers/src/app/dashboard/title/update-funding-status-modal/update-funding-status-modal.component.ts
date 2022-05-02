import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CampaignForm } from '@blockframes/campaign/form/form';
import { CrossFieldErrorMatcher } from '@blockframes/utils/form/matchers';

export interface UpdateFundingStatusModalData {
  form: CampaignForm;
  errorMatcher: CrossFieldErrorMatcher;
  onSave: () => void;
}

@Component({
  selector: 'financiers-dashboard-title-modal',
  templateUrl: './update-funding-status-modal.component.html',
  styleUrls: ['./update-funding-status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateFundingStatusModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UpdateFundingStatusModalData,
    public dialogRef: MatDialogRef<UpdateFundingStatusModalComponent>
  ) { }

}
