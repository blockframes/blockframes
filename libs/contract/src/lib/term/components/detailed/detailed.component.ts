import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Scope } from '@blockframes/utils/static-model';

@Component({
  selector: 'contract-detailed-terms',
  templateUrl: 'detailed.component.html',
  styleUrls: ['./detailed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailedTermsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { terms: string[], scope: Scope },
    public dialogRef: MatDialogRef<DetailedTermsComponent>
  ) {}
}