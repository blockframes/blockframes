import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementShareComponent } from './statement-share.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [StatementShareComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [StatementShareComponent]
})
export class StatementShareModule { }
