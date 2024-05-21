import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmInputComponent } from './confirm-input.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
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
