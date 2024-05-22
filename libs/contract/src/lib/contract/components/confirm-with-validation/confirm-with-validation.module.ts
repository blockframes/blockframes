import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ConfirmWithValidationComponent } from './confirm-with-validation.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule, 
    MatIconModule,
    MatCheckboxModule,
    GlobalModalModule
  ],
  declarations: [ConfirmWithValidationComponent],
  exports: [ConfirmWithValidationComponent]
})
export class ConfirmWithValidationModule { }
