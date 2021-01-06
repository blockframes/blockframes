import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Perk } from '@blockframes/campaign/+state';

@Component({
  selector: 'campaign-perk-card',
  templateUrl: './perk-card.component.html',
  styleUrls: ['./perk-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerkCardComponent {
  @Input() perk: Perk;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;

  constructor(private dialog: MatDialog) { }

  openDialog() {
    this.dialog.open(this.dialogRef, { maxWidth: '60vw', maxHeight: '60vh' });
  }
}
