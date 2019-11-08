import { ChangeDetectionStrategy, Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateService } from '../../../template/+state/template.service';
import { FormControl } from '@angular/forms';
import { Material } from '../../../material/+state';

@Component({
  selector: 'delivery-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTemplateComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'save-as-template';
  public isTemplateUpdate = false;
  private materials: Material[];
  public templateNameControl = new FormControl();

  constructor(
    private dialogRef: MatDialogRef<NewTemplateComponent>,
    private templateService: TemplateService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: Material[]
  ) {
    this.materials = data;
  }

  ngOnInit() {

    // Check if the name already exists in the selected organization
    this.templateNameControl.valueChanges.pipe().subscribe(templateName =>
      this.templateService.nameExists(templateName)
        ? (this.isTemplateUpdate = true)
        : (this.isTemplateUpdate = false)
    );
  }

  public async saveTemplate(name: string) {
    try {
      await this.templateService.saveAsTemplate(this.materials, this.templateNameControl.value);
      this.dialogRef.close();
      this.snackBar.open(`Saved template: ${name} !`, 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public async updateTemplate(name: string) {
    try {
      await this.templateService.updateTemplate(this.materials, this.templateNameControl.value);
      this.dialogRef.close();
      this.snackBar.open(`Updated template: ${name} !`, 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public close() {
    this.dialogRef.close();
  }

}
