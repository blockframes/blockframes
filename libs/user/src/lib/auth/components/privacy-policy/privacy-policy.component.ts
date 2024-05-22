import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  constructor(
    public dialogRef: MatDialogRef<PrivacyPolicyComponent>,
  ) { }

  close() {
    this.dialogRef.close();
  }
}
