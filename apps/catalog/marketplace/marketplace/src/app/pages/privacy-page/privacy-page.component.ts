import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'catalog-privacy-page',
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPageComponent {

  constructor(private dialogRef: MatDialogRef<PrivacyPageComponent>) {}
}
