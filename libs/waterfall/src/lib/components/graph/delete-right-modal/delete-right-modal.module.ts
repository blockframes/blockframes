
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { WaterfallDeleteRightModalComponent } from './delete-right-modal.component';


@NgModule({
  declarations: [ WaterfallDeleteRightModalComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,

    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  exports: [ WaterfallDeleteRightModalComponent ],
})
export class WaterfallDeleteRightModalModule {}
