import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmInputComponent } from './confirm-input.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirstWordTitlecaseModule } from '@blockframes/utils/pipes/first-titlecase.pipe';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

@NgModule({
  declarations: [ConfirmInputComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FirstWordTitlecaseModule,
    MatButtonModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    GlobalModalModule
  ],
  exports: [ConfirmInputComponent]
})
export class ConfirmInputModule { }
