import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Perk } from '@blockframes/model';

@Component({
  selector: 'campaign-perk-card',
  templateUrl: './perk-card.component.html',
  styleUrls: ['./perk-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerkCardComponent {
  @Input() perk: Perk;
  @ViewChild("dialogRef") dialogRef: TemplateRef<unknown>;

  constructor(private dialog: MatDialog) { }

  openDialog() {
    this.dialog.open(this.dialogRef, { maxWidth: '60vw', maxHeight: '60vh' });
  }
}
