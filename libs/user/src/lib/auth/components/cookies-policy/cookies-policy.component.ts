import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'auth-cookies-policy',
  templateUrl: './cookies-policy.component.html',
  styleUrls: ['./cookies-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CookiesPolicyComponent {
  constructor(
    public dialogRef: MatDialogRef<CookiesPolicyComponent>,
  ) { }

  close() {
    this.dialogRef.close();
  }
}
