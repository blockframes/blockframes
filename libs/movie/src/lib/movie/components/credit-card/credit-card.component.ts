import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Credit, Director } from '@blockframes/utils/common-interfaces';

@Component({
  selector: 'title-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditCardComponent {
  icon = 'check';
  @Input() credit: Credit | Director;
  @Input() type: 'director' | 'crew' | 'cast';
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;

  constructor(private dialog: MatDialog) { }

  openDialog() {
    this.dialog.open(this.dialogRef, { maxWidth: 400 });
  }

}

@Pipe({ name: 'roleIcon' })
export class RoleIconPipe implements PipeTransform {
  transform(role?: Credit['role']) {
    switch(role) {
      case '': return 'check';
      default: return 'check';
    }
  }
}