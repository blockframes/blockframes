import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { TemplateService } from '../../template/+state/template.service';
import { ConfirmComponent } from './confirm.component';

@Component({
  selector: 'delivery-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTemplateComponent {
  constructor(
    private dialogRef: MatDialogRef<NewTemplateComponent>,
    private templateService: TemplateService,
    private dialog: MatDialog
  ) {}

  public async saveTemplate(name: string) {
    if (await this.templateService.nameExists(name)) {
      this.dialog.open(ConfirmComponent, {
        data: {
          name
        }
      });
    } else {
      this.templateService.saveTemplate(name);
      this.dialogRef.close();
    }
  }

  public close() {
    this.dialogRef.close();
  }
}
