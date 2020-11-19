import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DeleteDialogComponent } from './delete-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [DeleteDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule
  ],
  exports: [DeleteDialogComponent],
  entryComponents: [DeleteDialogComponent,]
})
export class DeleteDialogModule { }
