
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { WaterfallPoolModalComponent } from './pool-modal.component';


@NgModule({
  declarations: [ WaterfallPoolModalComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,

    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  exports: [ WaterfallPoolModalComponent ],
})
export class WaterfallPoolModalModule {}
