import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CrmFormDialogComponent } from './crm-form-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [CrmFormDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule
  ],
  exports: [CrmFormDialogComponent],
  entryComponents: [CrmFormDialogComponent]
})
export class CrmFormDialogModule { }
