import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractTitleDetail } from '@blockframes/contract/contract/+state';
import { FormGroupSchema, createForms } from 'ng-form-factory';
import { MatTextSchema } from '../../forms/text-form';

interface Person {
  firstName: string;
  lastName: string;
}

const schema: FormGroupSchema<Person> = {
  form: 'group',
  load: 'entity',
  controls: {
    firstName: {
      form: 'control',
      label: 'First Name',
      hint: 'Some hint',
      load: 'text',
    } as MatTextSchema,
    lastName: {
      form: 'control',
      label: 'Last Name',
      hint: 'Some hint',
      load: 'text'
    } as MatTextSchema
  }
};









interface TitleDialogData {
  title: string,
  subtitle: string,
  titleDetail: ContractTitleDetail,
}

@Component({
  selector: 'admin-edit-title',
  templateUrl: './edit-title.component.html',
  styleUrls: ['./edit-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTitleComponent  implements OnInit {
  public form: any;
  public schema;

  constructor(
    public dialogRef: MatDialogRef<EditTitleComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: TitleDialogData,
    private cdRef: ChangeDetectorRef,
  ) {
    this.schema = schema;
  }

  ngOnInit() {
    this.form = createForms(schema, { firstName: '', lastName: '' });
    this.cdRef.markForCheck();
  }

  save() {
    if (this.form.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
    }
    this.dialogRef.close(this.form.value);
  }

  removeTitle() {
    this.dialogRef.close({ remove: true });
  }
}
