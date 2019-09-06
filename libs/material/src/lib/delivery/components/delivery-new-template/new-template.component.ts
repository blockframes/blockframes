import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateService } from '../../../template/+state/template.service';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Material } from '../../../material/+state';
import { Subject } from 'rxjs';

@Component({
  selector: 'delivery-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTemplateComponent implements OnInit, OnDestroy {
  public isUpdateTemplate = false;
  private materials: Material[];
  private destroyed$ = new Subject();
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
    this.templateService.subscribeOnTemplates().pipe(takeUntil(this.destroyed$)).subscribe();

    // Check if the name already exists in the selected organization
    this.templateNameControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(templateName =>
      this.templateService.nameExists(templateName)
        ? (this.isUpdateTemplate = true)
        : (this.isUpdateTemplate = false)
    );
  }

  public async saveTemplate(name: string) {
    try {
      await this.templateService.saveAsTemplate(this.materials, this.templateNameControl.value);
      this.dialogRef.close();
      this.snackBar.open('Saved template : ' + name + ' !', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public async updateTemplate(name: string) {
    try {
      await this.templateService.updateTemplate(this.materials, this.templateNameControl.value);
      this.dialogRef.close();
      this.snackBar.open('Updated template : ' + name + ' !', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
